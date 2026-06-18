"use client"

import { ExternalLink, FileText, Github, Globe, Linkedin, Mail, Phone } from "lucide-react"

type ChatUiButton = {
  label: string
  url: string
  style?: string
  icon?: string
}

type ChatUiImage = {
  url: string
  alt?: string
  caption?: string
}

type ChatUiIcon = {
  label: string
  url: string
}

type ChatContentPart =
  | {
      type: "text"
      text: string
    }
  | {
      type: "ui"
      buttons: ChatUiButton[]
    }
  | {
      type: "image"
      image: ChatUiImage
    }
  | {
      type: "icons"
      icons: ChatUiIcon[]
    }

const uiFencePattern = /```ui\s*([\s\S]*?)```/g

function cleanUiValue(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, "") ?? ""
}

function parseFieldFromInlineChunk(chunk: string, field: string) {
  const pattern = new RegExp(`(?:^|\\s)${field}:\\s*(.*?)(?=\\s(?:label|url|style|icon):|$)`, "i")
  return cleanUiValue(chunk.match(pattern)?.[1])
}

function parseInlineButtons(block: string) {
  const compact = block.replace(/\s+/g, " ").trim()
  const chunks = compact.split(/\s+-\s+label:\s+/i).slice(1)

  return chunks
    .map((chunk) => {
      const label = cleanUiValue(chunk.match(/^(.*?)(?=\s(?:url|style|icon):|$)/i)?.[1])
      const url = parseFieldFromInlineChunk(chunk, "url")
      const style = parseFieldFromInlineChunk(chunk, "style")
      const icon = parseFieldFromInlineChunk(chunk, "icon")

      return { label, url, style, icon }
    })
    .filter((button) => button.label && button.url)
}

function parseLineBasedButtons(block: string) {
  const buttons: ChatUiButton[] = []
  let current: Partial<ChatUiButton> | null = null

  const pushCurrent = () => {
    if (current?.label && current.url) {
      buttons.push({
        label: current.label,
        url: current.url,
        style: current.style,
        icon: current.icon,
      })
    }
  }

  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === "buttons:" || trimmed === "file:") continue

    const listItemMatch = trimmed.match(/^-\s*label:\s*(.+)$/)
    if (listItemMatch) {
      pushCurrent()
      current = { label: cleanUiValue(listItemMatch[1]) }
      continue
    }

    const fieldMatch = trimmed.match(/^(label|url|style|icon):\s*(.+)$/)
    if (fieldMatch) {
      if (!current) current = {}
      current[fieldMatch[1] as keyof ChatUiButton] = cleanUiValue(fieldMatch[2])
    }
  }

  pushCurrent()
  return buttons
}

function parseLineBasedIcons(block: string) {
  if (!block.includes("icons:")) {
    return []
  }

  const icons: ChatUiIcon[] = []
  let current: Partial<ChatUiIcon> | null = null

  const pushCurrent = () => {
    if (current?.label && current.url) {
      icons.push({
        label: current.label,
        url: current.url,
      })
    }
  }

  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed === "icons:") continue

    const listItemMatch = trimmed.match(/^-\s*label:\s*(.+)$/)
    if (listItemMatch) {
      pushCurrent()
      current = { label: cleanUiValue(listItemMatch[1]) }
      continue
    }

    const fieldMatch = trimmed.match(/^(label|url):\s*(.+)$/)
    if (fieldMatch) {
      if (!current) current = {}
      current[fieldMatch[1] as keyof ChatUiIcon] = cleanUiValue(fieldMatch[2])
    }
  }

  pushCurrent()
  return icons
}

function parseUiImage(block: string): ChatUiImage | null {
  if (!block.includes("image:")) {
    return null
  }

  const url = cleanUiValue(block.match(/(?:^|\n)\s*url:\s*(.+)/)?.[1])
  if (!url) {
    return null
  }

  return {
    url,
    alt: cleanUiValue(block.match(/(?:^|\n)\s*alt:\s*(.+)/)?.[1]),
    caption: cleanUiValue(block.match(/(?:^|\n)\s*caption:\s*(.+)/)?.[1]),
  }
}

function parseUiBlock(block: string): ChatContentPart[] {
  const icons = parseLineBasedIcons(block)
  if (icons.length > 0) {
    return [{ type: "icons", icons }]
  }

  const image = parseUiImage(block)
  if (image) {
    return [{ type: "image", image }]
  }

  const buttons = parseLineBasedButtons(block)
  if (buttons.length > 0) {
    return [
      {
        type: "ui",
        buttons: block.includes("file:") ? buttons.map((button) => ({ ...button, icon: button.icon ?? "file" })) : buttons,
      },
    ]
  }

  const inlineButtons = parseInlineButtons(block)
  if (inlineButtons.length > 0) {
    return [{ type: "ui", buttons: inlineButtons }]
  }

  const fileLabel = block.match(/label:\s*(.+)/)?.[1]
  const fileUrl = block.match(/url:\s*(.+)/)?.[1]
  if (fileLabel && fileUrl) {
    return [{ type: "ui", buttons: [{ label: cleanUiValue(fileLabel), url: cleanUiValue(fileUrl), icon: "file" }] }]
  }

  return []
}

function parseChatContent(content: string): ChatContentPart[] {
  const parts: ChatContentPart[] = []
  let cursor = 0

  for (const match of content.matchAll(uiFencePattern)) {
    const before = content.slice(cursor, match.index).trim()
    if (before) {
      parts.push({ type: "text", text: before })
    }

    parts.push(...parseUiBlock(match[1] ?? ""))

    cursor = (match.index ?? 0) + match[0].length
  }

  const after = content.slice(cursor).trim()
  if (after) {
    parts.push({ type: "text", text: after })
  }

  return parts.length > 0 ? parts : [{ type: "text", text: content }]
}

function getSafeChatHref(url: string) {
  const trimmed = url.trim()
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed
  }

  return "#"
}

function getSafeChatImageSrc(url: string) {
  const trimmed = url.trim()
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed
  }

  return `/${trimmed.replace(/^\.\//, "")}`
}

function getChatButtonIcon(icon?: string) {
  switch (icon?.toLowerCase()) {
    case "github":
      return Github
    case "linkedin":
      return Linkedin
    case "mail":
    case "email":
      return Mail
    case "phone":
    case "tel":
      return Phone
    case "file":
    case "pdf":
      return FileText
    case "globe":
    case "site":
      return Globe
    default:
      return null
  }
}

export function ChatMessageContent({
  content,
  isLightMode,
}: {
  content: string
  isLightMode: boolean
}) {
  const parts = parseChatContent(content)
  const buttonClass = isLightMode
    ? "inline-flex items-center justify-center gap-2 rounded-xl border border-black bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
    : "inline-flex items-center justify-center gap-2 rounded-xl border border-white bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-neutral-200"

  return (
    <div className="space-y-3">
      {parts.map((part, index) => {
        if (part.type === "text") {
          return (
            <p key={`text-${index}`} className="whitespace-pre-line">
              {part.text}
            </p>
          )
        }

        if (part.type === "image") {
          return (
            <figure key={`image-${index}`} className="overflow-hidden rounded-2xl">
              <img
                src={getSafeChatImageSrc(part.image.url)}
                alt={part.image.alt || "Image du portfolio"}
                className="max-h-80 w-full max-w-sm rounded-2xl border border-white/10 object-cover"
              />
              {part.image.caption ? (
                <figcaption className={`mt-2 text-xs ${isLightMode ? "text-neutral-600" : "text-gray-400"}`}>
                  {part.image.caption}
                </figcaption>
              ) : null}
            </figure>
          )
        }

        if (part.type === "icons") {
          return (
            <div key={`icons-${index}`} className="flex max-w-2xl flex-wrap gap-2">
              {part.icons.map((icon) => (
                <span
                  key={`${icon.label}-${icon.url}`}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                    isLightMode
                      ? "border-black/15 bg-white text-black"
                      : "border-white/10 bg-white/[0.06] text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                    <img
                      src={getSafeChatImageSrc(icon.url)}
                      alt={icon.label}
                      className="h-5 w-5 object-contain"
                      loading="lazy"
                    />
                  </span>
                  {icon.label}
                </span>
              ))}
            </div>
          )
        }

        return (
          <div key={`ui-${index}`} className="flex flex-wrap gap-2">
            {part.buttons.map((button) => {
              const href = getSafeChatHref(button.url)
              const Icon = getChatButtonIcon(button.icon)
              const isExternal = href.startsWith("http://") || href.startsWith("https://")

              return (
                <a
                  key={`${button.label}-${button.url}`}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noreferrer" : undefined}
                  className={buttonClass}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {button.label}
                  {isExternal && !Icon ? <ExternalLink className="h-4 w-4" /> : null}
                </a>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
