"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { FileText, Github, Globe, Linkedin, Mail, Moon, Phone, SendHorizonal, Sun } from "lucide-react"
import FlickeringGrid from "@/components/flickering-grid"
import { getStrapiAssetUrl, type StrapiProject } from "@/lib/strapi"

const MAX_CHAT_MESSAGE_LENGTH = 1000
const Typewriter = dynamic(() => import("typewriter-effect"), { ssr: false })

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/El-cmd",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://fr.linkedin.com/in/valentinloth",
    icon: Linkedin,
  },
  {
    label: "Mail",
    href: "mailto:lecmd@proton.me",
    icon: Mail,
  },
]

type ProjectsApiResponse = {
  data: StrapiProject[]
  error?: string
}

type ActiveProjectDescription = {
  title: string
  description: string
}

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type ChatApiResponse = {
  answer?: string
  error?: string
}

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

function ChatMessageContent({
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
                </a>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed || trimmed.toLowerCase() === "null") {
    return null
  }

  return trimmed
}

export default function Home() {
  const [projects, setProjects] = useState<StrapiProject[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [hasProjectsError, setHasProjectsError] = useState(false)
  const [activeDescription, setActiveDescription] = useState<ActiveProjectDescription | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeHeroPanel, setActiveHeroPanel] = useState<"hub" | "home" | "about">("home")
  const pageScrollRef = useRef<HTMLDivElement>(null)
  const heroRailRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const isLightMode = theme === "light"
  const gridColor = isLightMode ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)"
  const mainThemeClass = isLightMode ? "bg-white text-black" : "bg-black text-white"
  const primaryTextClass = isLightMode ? "text-black text-glow-light" : "text-white text-glow"
  const mutedTextClass = isLightMode ? "text-neutral-700" : "text-gray-400"
  const labelTextClass = isLightMode ? "text-neutral-600" : "text-gray-500"
  const chipClass = isLightMode
    ? "border-black/10 bg-white/70 text-black"
    : "border-white/10 bg-black/25 text-gray-300"
  const arrowButtonClass = isLightMode
    ? "animate-bounce rounded-lg bg-white p-2 text-black shadow-[0_0_0_1px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-neutral-100"
    : "animate-bounce rounded-lg bg-gray-800 p-2 text-gray-400 transition-all duration-300 hover:bg-gray-700"
  const getThemeButtonClass = (isActive: boolean) => {
    if (isLightMode) {
      return isActive
        ? "grid h-10 w-10 place-items-center rounded-full border border-white bg-black text-white shadow-[0_0_22px_rgba(0,0,0,0.28)] transition hover:bg-neutral-800"
        : "grid h-10 w-10 place-items-center rounded-full border border-black bg-transparent text-black backdrop-blur-sm transition hover:bg-black/5"
    }

    return isActive
      ? "grid h-10 w-10 place-items-center rounded-full bg-white text-black shadow-[0_0_22px_rgba(255,255,255,0.35)] transition hover:bg-neutral-200"
      : "grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/20 text-white/80 backdrop-blur-sm transition duration-300 hover:border-white/35 hover:bg-white/10 hover:text-white"
  }
  const socialButtonClass = isLightMode
    ? "group grid h-10 w-10 place-items-center rounded-full border border-black bg-white text-black backdrop-blur-sm transition duration-300 hover:bg-neutral-100"
    : "group grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/20 text-white/80 backdrop-blur-sm transition duration-300 hover:border-white/35 hover:bg-white/10 hover:text-white"
  const projectCardClass = isLightMode
    ? "border-black/20 bg-white/75 shadow-[10px_10px_0_rgba(0,0,0,0.08)]"
    : "border-white/15 bg-black/55 shadow-[10px_10px_0_rgba(255,255,255,0.06)]"
  const projectMediaClass = isLightMode
    ? "border-black/20 bg-neutral-100"
    : "border-white/15 bg-neutral-950"
  const projectButtonClass = isLightMode
    ? "border-black bg-white text-black hover:bg-black hover:text-white"
    : "border-white/15 bg-white text-black hover:bg-neutral-200"
  const descriptionPanelClass = isLightMode
    ? "border-black/20 bg-white text-black shadow-[12px_12px_0_rgba(0,0,0,0.1)]"
    : "border-white/15 bg-black text-white shadow-[12px_12px_0_rgba(255,255,255,0.06)]"
  const chatBubbleBaseClass = "max-w-[85%] rounded-2xl border px-4 py-3 text-left text-sm leading-6 backdrop-blur-sm md:text-base"
  const assistantBubbleClass = isLightMode
    ? "self-start border-black/10 bg-white/70 text-black"
    : "self-start border-white/10 bg-white/[0.04] text-white"
  const userBubbleClass = isLightMode
    ? "self-end border-black bg-black text-white"
    : "self-end border-white bg-white text-black"

  const playProjectVideo = async (id: number) => {
    const video = videoRefs.current[id]
    if (!video) return

    try {
      await video.play()
    } catch {
      // Some browsers can reject autoplay even when muted; keep the UI silent.
    }
  }

  const pauseProjectVideo = (id: number) => {
    const video = videoRefs.current[id]
    if (!video) return

    video.pause()
    video.currentTime = 0
  }

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const message = chatInput.trim()
    if (!message || isSendingChat) return
    if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
      setChatError(`Le message ne doit pas depasser ${MAX_CHAT_MESSAGE_LENGTH} caracteres.`)
      return
    }

    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: message }]
    setChatMessages(nextMessages)
    setChatInput("")
    setChatError(null)
    setIsSendingChat(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const payload = (await response.json()) as ChatApiResponse

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error || "Le chatbot n'a pas pu repondre.")
      }

      setChatMessages([...nextMessages, { role: "assistant", content: payload.answer }])
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "Impossible de joindre le chatbot.")
    } finally {
      setIsSendingChat(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" })
        if (!response.ok) {
          throw new Error(`Projects request failed: ${response.status}`)
        }

        const payload = (await response.json()) as ProjectsApiResponse
        if (!isMounted) return

        setProjects(payload.data ?? [])
        setHasProjectsError(false)
      } catch {
        if (!isMounted) return

        setProjects([])
        setHasProjectsError(true)
      } finally {
        if (isMounted) {
          setIsLoadingProjects(false)
        }
      }
    }

    void loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const rail = heroRailRef.current
    if (!rail) return

    requestAnimationFrame(() => {
      rail.scrollLeft = rail.clientWidth
    })
  }, [])

  useEffect(() => {
    const rail = heroRailRef.current
    if (!rail) return

    const updateActivePanel = () => {
      const panelIndex = Math.round(rail.scrollLeft / rail.clientWidth)
      setActiveHeroPanel(panelIndex === 0 ? "hub" : panelIndex === 2 ? "about" : "home")
    }

    updateActivePanel()
    rail.addEventListener("scroll", updateActivePanel, { passive: true })
    window.addEventListener("resize", updateActivePanel)

    return () => {
      rail.removeEventListener("scroll", updateActivePanel)
      window.removeEventListener("resize", updateActivePanel)
    }
  }, [])

  useEffect(() => {
    const scrollRoot = pageScrollRef.current
    if (!scrollRoot) return

    let touchStartX = 0
    let touchStartY = 0
    const getAnnexScroller = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>("[data-annex-scroll]") : null
    const shouldBlockVerticalDown = () =>
      activeHeroPanel !== "home" && scrollRoot.scrollTop < window.innerHeight * 0.5

    const handleWheel = (event: WheelEvent) => {
      const isVerticalDown = event.deltaY > 0 && event.deltaY > Math.abs(event.deltaX)
      if (!isVerticalDown || !shouldBlockVerticalDown()) return

      const annexScroller = getAnnexScroller(event.target)
      if (annexScroller && annexScroller.scrollTop + annexScroller.clientHeight < annexScroller.scrollHeight - 1) {
        return
      }

      event.preventDefault()
    }

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return

      touchStartX = touch.clientX
      touchStartY = touch.clientY
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return

      const deltaX = touch.clientX - touchStartX
      const deltaY = touchStartY - touch.clientY
      const isVerticalSwipeDownPage = deltaY > 8 && deltaY > Math.abs(deltaX)
      if (!isVerticalSwipeDownPage || !shouldBlockVerticalDown()) return

      const annexScroller = getAnnexScroller(event.target)
      if (annexScroller && annexScroller.scrollTop + annexScroller.clientHeight < annexScroller.scrollHeight - 1) {
        return
      }

      event.preventDefault()
    }

    scrollRoot.addEventListener("wheel", handleWheel, { passive: false })
    scrollRoot.addEventListener("touchstart", handleTouchStart, { passive: true })
    scrollRoot.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      scrollRoot.removeEventListener("wheel", handleWheel)
      scrollRoot.removeEventListener("touchstart", handleTouchStart)
      scrollRoot.removeEventListener("touchmove", handleTouchMove)
    }
  }, [activeHeroPanel])

  useEffect(() => {
    if (!activeDescription) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDescription(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeDescription])

  useEffect(() => {
    const container = chatMessagesRef.current
    if (!container) return

    container.scrollTop = container.scrollHeight
  }, [chatMessages, isSendingChat, chatError])

  return (
    <div ref={pageScrollRef} className="h-screen overflow-y-scroll snap-y snap-mandatory">
      <main className={`relative min-h-screen w-full transition-colors duration-300 ${mainThemeClass}`}>
        <nav aria-label="Theme mode" className="fixed left-5 top-5 z-30 flex items-center gap-2 md:left-8 md:top-8">
            <button
              type="button"
              onClick={() => setTheme("dark")}
              aria-label="Mode dark"
              className={getThemeButtonClass(theme === "dark")}
            >
              <Moon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setTheme("light")}
              aria-label="Mode light"
              className={getThemeButtonClass(theme === "light")}
            >
              <Sun className="h-5 w-5" />
            </button>
        </nav>

        <nav aria-label="Social links" className="fixed right-5 top-5 z-30 flex items-center gap-3 md:right-8 md:top-8">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={label}
                className={socialButtonClass}
              >
              <Icon className="h-5 w-5 transition duration-300 group-hover:scale-110" />
            </a>
          ))}
        </nav>

        <section className="relative h-screen overflow-hidden snap-start">
          <div
            ref={heroRailRef}
            className="no-scrollbar h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
          >
            <div className="flex h-full w-[300vw]">
              <article className="relative flex h-full w-screen shrink-0 snap-start items-stretch justify-center overflow-hidden">
                <FlickeringGrid
                  className="absolute inset-0 z-0"
                  color={gridColor}
                  maxOpacity={0.1}
                  minOpacity={0.025}
                  squareSize={3}
                  gridGap={6}
                  flickerChance={0.18}
                  flickerDensity={0.055}
                  fps={16}
                  hoverRadius={46}
                  hoverOpacity={0.18}
                  hoverScale={1.28}
                />
                <div className="relative z-10 flex h-full w-full max-w-6xl flex-col px-6 pb-8 pt-24 text-center md:pt-20">
                  <h2 className={`text-5xl font-medium tracking-tight md:text-7xl ${primaryTextClass}`}>
                    HUB
                  </h2>
                  <p className={`mx-auto mt-5 max-w-xl text-sm uppercase tracking-[0.35em] ${labelTextClass}`}>
                    Projets exposes
                  </p>

                  <div
                    data-annex-scroll
                    className="no-scrollbar mt-8 grid min-h-0 flex-1 auto-rows-max grid-cols-1 content-start items-start gap-4 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  >
                    {isLoadingProjects ? (
                      <div className={`col-span-full border p-6 text-center text-sm ${projectCardClass} ${mutedTextClass}`}>
                        Chargement des projets depuis Strapi...
                      </div>
                    ) : hasProjectsError ? (
                      <div className={`col-span-full border p-6 text-center text-sm ${projectCardClass} ${mutedTextClass}`}>
                        Impossible de charger les projets depuis Strapi.
                      </div>
                    ) : projects.length === 0 ? (
                      <div className={`col-span-full border p-6 text-center text-sm ${projectCardClass} ${mutedTextClass}`}>
                        Aucun projet publie dans Strapi pour le moment.
                      </div>
                    ) : (
                      projects.map((project) => {
                        const mediaUrl = getStrapiAssetUrl(project.media?.url)
                        const isVideo = project.media?.mime?.startsWith("video/")
                        const projectUrl = normalizeOptionalText(project.project_url)
                        const gitUrl = normalizeOptionalText(project.git_url)
                        const description = normalizeOptionalText(project.description)
                        const projectDate = project.date ? new Date(project.date) : null
                        const projectTag =
                          projectDate && !Number.isNaN(projectDate.getTime())
                            ? String(projectDate.getFullYear())
                            : "Project"
                        const hasProjectUrl = Boolean(projectUrl)
                        const hasGitUrl = Boolean(gitUrl)
                        const hasDescription = Boolean(description)
                        const hasActions = hasProjectUrl || hasGitUrl || hasDescription

                        return (
                          <article
                            key={project.documentId ?? project.id}
                            onMouseEnter={() => {
                              if (isVideo) void playProjectVideo(project.id)
                            }}
                            onMouseLeave={() => {
                              if (isVideo) pauseProjectVideo(project.id)
                            }}
                            onFocus={() => {
                              if (isVideo) void playProjectVideo(project.id)
                            }}
                            onBlur={() => {
                              if (isVideo) pauseProjectVideo(project.id)
                            }}
                            className={`flex h-[21.5rem] self-start border p-4 text-left backdrop-blur-sm transition hover:-translate-y-1 ${projectCardClass}`}
                          >
                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="flex min-h-[2.5rem] items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className={`text-base font-medium tracking-tight ${isLightMode ? "text-black" : "text-white"}`}>
                                      {project.name}
                                    </h3>
                                  </div>
                                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.2em] ${chipClass}`}>
                                  {projectTag}
                                </span>
                              </div>

                              <div className={`relative mt-4 aspect-[16/10] overflow-hidden border ${projectMediaClass}`}>
                                {mediaUrl ? (
                                  isVideo ? (
                                    <video
                                      ref={(node) => {
                                        videoRefs.current[project.id] = node
                                      }}
                                      src={mediaUrl}
                                      muted
                                      playsInline
                                      preload="metadata"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={mediaUrl}
                                      alt={project.media?.alternativeText || project.name}
                                      className="h-full w-full object-cover"
                                    />
                                  )
                                ) : (
                                  <div className={`grid h-full w-full place-items-center text-[10px] uppercase tracking-[0.24em] ${labelTextClass}`}>
                                    No media
                                  </div>
                                )}
                                <div className={`absolute inset-0 ${isLightMode ? "bg-white/10" : "bg-black/20"}`} />
                              </div>

                              {hasActions ? (
                                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                  {hasProjectUrl ? (
                                    <a
                                      href={projectUrl ?? "#"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`min-w-[5.5rem] flex-1 border px-2 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] transition ${projectButtonClass}`}
                                    >
                                      Voir
                                    </a>
                                  ) : null}
                                  {hasGitUrl ? (
                                    <a
                                      href={gitUrl ?? "#"}
                                      target="_blank"
                                      rel="noreferrer"
                                      className={`min-w-[5.5rem] flex-1 border px-2 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] transition ${projectButtonClass}`}
                                    >
                                      Git
                                    </a>
                                  ) : null}
                                  {hasDescription ? (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveDescription({
                                          title: project.name,
                                          description: description ?? "",
                                        })
                                      }}
                                      className={`min-w-[7.5rem] flex-1 border px-2 py-2.5 text-center text-[10px] uppercase tracking-[0.18em] transition ${projectButtonClass}`}
                                    >
                                      Description
                                    </button>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </article>
                        )
                      })
                    )}
                  </div>
                </div>
                <div className="absolute right-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 md:right-8">
                  <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] backdrop-blur-sm ${chipClass}`}>
                    Home
                  </span>
                  <button
                    onClick={() => {
                      heroRailRef.current?.scrollTo({
                        left: heroRailRef.current.clientWidth,
                        behavior: "smooth",
                      })
                    }}
                    aria-label="Scroll to home"
                    className={arrowButtonClass}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>
              </article>

              <article className="relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden">
                <FlickeringGrid
                  className="absolute inset-0 z-0"
                  color={gridColor}
                  maxOpacity={0.1}
                  minOpacity={0.025}
                  squareSize={3}
                  gridGap={6}
                  flickerChance={0.18}
                  flickerDensity={0.055}
                  fps={16}
                  hoverRadius={46}
                  hoverOpacity={0.18}
                  hoverScale={1.28}
                />
                <div className="max-w-6xl mx-auto text-center relative z-10">
                  <div className="relative">
                    <div className="inline-block">
                      <h1 className={`relative mb-8 text-5xl font-medium tracking-tight md:text-7xl ${primaryTextClass}`}>
                        <Typewriter
                          options={{
                            strings: ["Valentin Loth"],
                            autoStart: true,
                            loop: false,
                            cursor: "",
                            wrapperClassName: isLightMode ? "text-black" : "text-white",
                            deleteSpeed: 9999999,
                            delay: 50,
                          }}
                        />
                      </h1>
                      <p className={`mx-auto mt-6 max-w-3xl text-lg font-light md:text-xl ${mutedTextClass}`}>
                        Software Engineer
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 md:left-8">
                  <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] backdrop-blur-sm ${chipClass}`}>
                    HUB
                  </span>
                  <button
                    onClick={() => {
                      heroRailRef.current?.scrollTo({
                        left: 0,
                        behavior: "smooth",
                      })
                    }}
                    aria-label="Scroll to hub"
                    className={arrowButtonClass}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                  </button>
                </div>

                <div className="absolute right-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 md:right-8">
                  <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] backdrop-blur-sm ${chipClass}`}>
                    About
                  </span>
                  <button
                    onClick={() => {
                      const rail = heroRailRef.current
                      if (!rail) return

                      rail.scrollTo({
                        left: rail.clientWidth * 2,
                        behavior: "smooth",
                      })
                    }}
                    aria-label="Scroll to about"
                    className={arrowButtonClass}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </button>
                </div>

                <div className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
                  <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] backdrop-blur-sm ${chipClass}`}>
                    Assistant chatbot
                  </span>
                  <button
                    onClick={() => {
                      document.querySelector(".snap-y")?.scrollTo({
                        top: window.innerHeight,
                        behavior: "smooth",
                      })
                    }}
                    aria-label="Scroll to chatbot"
                    className={arrowButtonClass}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                    </svg>
                  </button>
                </div>
              </article>

              <article className="relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden">
                <FlickeringGrid
                  className="absolute inset-0 z-0"
                  color={gridColor}
                  maxOpacity={0.1}
                  minOpacity={0.025}
                  squareSize={3}
                  gridGap={6}
                  flickerChance={0.18}
                  flickerDensity={0.055}
                  fps={16}
                  hoverRadius={46}
                  hoverOpacity={0.18}
                  hoverScale={1.28}
                />

                <div className="relative z-10 max-w-3xl px-6 text-center">
                  <p className={`mb-4 text-xs uppercase tracking-[0.45em] ${labelTextClass}`}>
                    About
                  </p>
                  <h2 className={`text-5xl font-medium tracking-tight md:text-7xl ${primaryTextClass}`}>
                    ABOUT
                  </h2>
                  <p className={`mx-auto mt-8 max-w-xl text-base font-light leading-8 md:text-lg ${mutedTextClass}`}>
                    Software Engineer oriente interfaces modernes, experiences web propres et produits deployables.
                  </p>
                </div>

                <div className="absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 md:left-8">
                  <span className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] backdrop-blur-sm ${chipClass}`}>
                    Home
                  </span>
                  <button
                    onClick={() => {
                      const rail = heroRailRef.current
                      if (!rail) return

                      rail.scrollTo({
                        left: rail.clientWidth,
                        behavior: "smooth",
                      })
                    }}
                    aria-label="Scroll to home"
                    className={arrowButtonClass}
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={`relative h-screen overflow-hidden px-4 snap-start md:px-6 ${isLightMode ? "bg-white" : "bg-black"}`}>
          <FlickeringGrid
            className="absolute inset-0 z-0"
            color={gridColor}
            maxOpacity={0.1}
            minOpacity={0.025}
            squareSize={3}
            gridGap={6}
            flickerChance={0.18}
            flickerDensity={0.055}
            fps={16}
            hoverRadius={46}
            hoverOpacity={0.18}
            hoverScale={1.28}
          />

          <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col overflow-hidden pt-20 md:pt-24">
            <div className="shrink-0 text-center">
              <p className={`text-lg font-light md:text-2xl ${isLightMode ? "text-black" : "text-gray-300"}`}>
                Poses tes questions pour en savoir plus sur moi !
              </p>
            </div>

            <div
              ref={chatMessagesRef}
              className="no-scrollbar my-6 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-1 py-2 md:my-8"
            >
              {chatMessages.length === 0 ? (
                <div className={`mx-auto mt-10 max-w-xl rounded-2xl border px-5 py-4 text-center text-sm leading-6 backdrop-blur-sm ${chipClass}`}>
                  Demande-moi mes projets, mes competences, mes tarifs ou comment me contacter.
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`${chatBubbleBaseClass} ${
                      message.role === "user" ? userBubbleClass : assistantBubbleClass
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <ChatMessageContent content={message.content} isLightMode={isLightMode} />
                    ) : (
                      message.content
                    )}
                  </div>
                ))
              )}

              {isSendingChat ? (
                <div className={`${chatBubbleBaseClass} ${assistantBubbleClass}`}>
                  Recherche dans la base de connaissance...
                </div>
              ) : null}

              {chatError ? (
                <div className={`self-start rounded-2xl border px-4 py-3 text-sm ${
                  isLightMode ? "border-red-600/30 bg-red-50 text-red-700" : "border-red-400/30 bg-red-950/30 text-red-200"
                }`}>
                  {chatError}
                </div>
              ) : null}
            </div>

            <form
              onSubmit={handleChatSubmit}
              className={`shrink-0 flex items-center gap-3 border-t py-4 md:py-5 ${isLightMode ? "border-black/10" : "border-white/10"}`}
            >
              <div className="min-w-0 flex-1">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  aria-label="Message"
                  aria-describedby="chat-character-counter"
                  placeholder="Message..."
                  maxLength={MAX_CHAT_MESSAGE_LENGTH}
                  disabled={isSendingChat}
                  className={`w-full bg-transparent px-1 py-3 text-base outline-none ${
                    isLightMode ? "text-black placeholder:text-neutral-500" : "text-white placeholder:text-gray-600"
                  }`}
                />
                <p
                  id="chat-character-counter"
                  aria-live="polite"
                  className={`px-1 text-right text-xs tabular-nums ${
                    MAX_CHAT_MESSAGE_LENGTH - chatInput.length <= 100
                      ? isLightMode
                        ? "text-red-700"
                        : "text-red-300"
                      : labelTextClass
                  }`}
                >
                  {MAX_CHAT_MESSAGE_LENGTH - chatInput.length} caractères restants
                </p>
              </div>
              <button
                type="submit"
                aria-label="Envoyer"
                disabled={isSendingChat || !chatInput.trim()}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition ${
                  isLightMode
                    ? "bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500"
                    : "bg-white text-black hover:bg-gray-200 disabled:bg-white/20 disabled:text-white/40"
                }`}
              >
                <SendHorizonal className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>
      </main>
      {activeDescription ? (
        <div
          role="presentation"
          onClick={() => setActiveDescription(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-description-title"
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-lg border p-5 ${descriptionPanelClass}`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="project-description-title" className="text-lg font-medium tracking-tight">
                {activeDescription.title}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDescription(null)}
                className={`border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition ${projectButtonClass}`}
              >
                Fermer
              </button>
            </div>
            <p className={`mt-5 max-h-[50vh] overflow-y-auto whitespace-pre-line text-sm leading-7 ${mutedTextClass}`}>
              {activeDescription.description}
            </p>
          </section>
        </div>
      ) : null}
      <style jsx>{`
        .text-glow {
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2), 0 0 30px rgba(255, 255, 255, 0.1);
        }
        .text-glow-light {
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.16), 0 0 20px rgba(0, 0, 0, 0.1), 0 0 30px rgba(0, 0, 0, 0.06);
        }
        @keyframes dataFlow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-data-flow {
          animation: dataFlow 3s linear infinite;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        }
        .animate-data-flow-reverse {
          animation: dataFlow 3s linear infinite reverse;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  )
}
