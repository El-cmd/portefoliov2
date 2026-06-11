import { NextResponse } from "next/server"
import { consumeChatRateLimit, type ChatRateLimitResult } from "@/lib/chat-rate-limit"

export const dynamic = "force-dynamic"

type ChatRequestBody = {
  message?: unknown
}

const chatbotInternalUrl = process.env.CHATBOT_INTERNAL_URL ?? "http://localhost:8001"
const timeoutMs = Number(process.env.BACKEND_TIMEOUT_MS ?? 30000)
const maxChatMessageLength = 1000
const maxRequestBodyBytes = 8 * 1024
const rateLimitEnabled = process.env.CHAT_RATE_LIMIT_ENABLED !== "false"
const rateLimitRequestsPerMinute = readPositiveInteger(
  process.env.CHAT_RATE_LIMIT_REQUESTS_PER_MINUTE,
  5,
)
const rateLimitBurst = readNonNegativeInteger(process.env.CHAT_RATE_LIMIT_BURST, 3)
const trustProxyHeaders = process.env.CHAT_RATE_LIMIT_TRUST_PROXY_HEADERS === "true"

class RequestBodyTooLargeError extends Error {}

function readPositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function readNonNegativeInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback
}

function getRateLimitKey(request: Request) {
  if (!trustProxyHeaders) {
    return "local"
  }

  const realIp = request.headers.get("x-real-ip")?.trim()
  if (realIp) {
    return realIp
  }

  const forwardedFor = request.headers.get("x-forwarded-for")
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim()
  return firstForwardedIp || "unknown"
}

function getRateLimitHeaders(result: ChatRateLimitResult) {
  return {
    "RateLimit-Limit": `${rateLimitRequestsPerMinute};w=60;burst=${rateLimitBurst}`,
    "RateLimit-Remaining": String(result.remaining),
  }
}

async function readLimitedJson(request: Request): Promise<ChatRequestBody> {
  const contentLength = Number(request.headers.get("content-length"))
  if (Number.isFinite(contentLength) && contentLength > maxRequestBodyBytes) {
    throw new RequestBodyTooLargeError()
  }

  if (!request.body) {
    return {}
  }

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let totalBytes = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    totalBytes += value.byteLength
    if (totalBytes > maxRequestBodyBytes) {
      await reader.cancel()
      throw new RequestBodyTooLargeError()
    }
    chunks.push(value)
  }

  const body = new Uint8Array(totalBytes)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }

  return JSON.parse(new TextDecoder().decode(body)) as ChatRequestBody
}

export async function POST(request: Request) {
  const rateLimitResult = rateLimitEnabled
    ? consumeChatRateLimit(
        getRateLimitKey(request),
        rateLimitRequestsPerMinute,
        rateLimitBurst,
      )
    : null

  if (rateLimitResult && !rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many chatbot requests. Please retry shortly." },
      {
        status: 429,
        headers: {
          ...getRateLimitHeaders(rateLimitResult),
          "Retry-After": String(rateLimitResult.retryAfterSeconds),
        },
      },
    )
  }

  let body: ChatRequestBody

  try {
    body = await readLimitedJson(request)
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) {
      return NextResponse.json({ error: "Request body is too large." }, { status: 413 })
    }
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const message = typeof body.message === "string" ? body.message.trim() : ""
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 })
  }
  if (message.length > maxChatMessageLength) {
    return NextResponse.json(
      { error: `Message must not exceed ${maxChatMessageLength} characters.` },
      { status: 400 },
    )
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 30000)

  try {
    const response = await fetch(`${chatbotInternalUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: controller.signal,
      cache: "no-store",
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      return NextResponse.json(
        { error: payload?.detail ?? payload?.error ?? "Chatbot backend error." },
        { status: response.status },
      )
    }

    return NextResponse.json(payload, {
      headers: rateLimitResult ? getRateLimitHeaders(rateLimitResult) : undefined,
    })
  } catch (error) {
    const isAbort = error instanceof DOMException && error.name === "AbortError"
    return NextResponse.json(
      { error: isAbort ? "Chatbot backend timeout." : "Unable to reach chatbot backend." },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
