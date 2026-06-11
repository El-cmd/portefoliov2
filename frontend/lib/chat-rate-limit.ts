type RateLimitBucket = {
  tokens: number
  lastRefillAt: number
  lastSeenAt: number
}

type RateLimitStore = Map<string, RateLimitBucket>

type GlobalRateLimitState = typeof globalThis & {
  __chatRateLimitStore?: RateLimitStore
  __chatRateLimitOperations?: number
}

export type ChatRateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  retryAfterSeconds: number
}

const globalState = globalThis as GlobalRateLimitState
const store = globalState.__chatRateLimitStore ?? new Map<string, RateLimitBucket>()
globalState.__chatRateLimitStore = store

function cleanupInactiveBuckets(now: number) {
  globalState.__chatRateLimitOperations = (globalState.__chatRateLimitOperations ?? 0) + 1
  if (globalState.__chatRateLimitOperations % 100 !== 0) {
    return
  }

  const inactiveThreshold = now - 10 * 60 * 1000
  for (const [key, bucket] of store) {
    if (bucket.lastSeenAt < inactiveThreshold) {
      store.delete(key)
    }
  }
}

export function consumeChatRateLimit(
  key: string,
  requestsPerMinute: number,
  burst: number,
  now = Date.now(),
): ChatRateLimitResult {
  const refillRatePerMs = requestsPerMinute / 60_000
  const capacity = requestsPerMinute + burst
  const bucket = store.get(key) ?? {
    tokens: capacity,
    lastRefillAt: now,
    lastSeenAt: now,
  }

  const elapsedMs = Math.max(0, now - bucket.lastRefillAt)
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsedMs * refillRatePerMs)
  bucket.lastRefillAt = now
  bucket.lastSeenAt = now

  const allowed = bucket.tokens >= 1
  if (allowed) {
    bucket.tokens -= 1
  }

  store.set(key, bucket)
  cleanupInactiveBuckets(now)

  return {
    allowed,
    limit: capacity,
    remaining: Math.max(0, Math.floor(bucket.tokens)),
    retryAfterSeconds: allowed
      ? 0
      : Math.max(1, Math.ceil((1 - bucket.tokens) / refillRatePerMs / 1000)),
  }
}
