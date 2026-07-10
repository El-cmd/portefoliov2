"use client"

import { type FormEvent, useEffect, useRef, useState } from "react"
import { Github, Linkedin, Mail } from "lucide-react"
import { SocialNavigation } from "@/components/navigation/SocialNavigation"
import { ThemeNavigation } from "@/components/navigation/ThemeNavigation"
import { AboutPanel } from "@/components/sections/AboutPanel"
import { ChatSection } from "@/components/sections/ChatSection"
import { HomePanel } from "@/components/sections/HomePanel"
import { HubPanel } from "@/components/sections/HubPanel"
import { ProjectDescriptionModal } from "@/components/sections/ProjectDescriptionModal"
import type {
  ActiveProjectDescription,
  ChatApiResponse,
  ChatMessage,
  ProjectVideoRefs,
  ThemeMode,
} from "@/components/sections/types"
import type { StrapiProject } from "@/lib/strapi"

const MAX_CHAT_MESSAGE_LENGTH = 1000
const CHAT_CLIENT_TIMEOUT_MS = 35000
const CHAT_RATE_LIMIT_MAX_REQUESTS = 8

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/El-cmd",
    icon: Github,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/loth-valentin-50378a231",
    icon: Linkedin,
  },
  {
    label: "Mail",
    href: "mailto:lecmd@proton.me",
    icon: Mail,
  },
]

type PortfolioClientProps = {
  initialProjects: StrapiProject[]
  initialProjectsError: string | null
}

export function PortfolioClient({ initialProjects, initialProjectsError }: PortfolioClientProps) {
  const [projects] = useState<StrapiProject[]>(() => initialProjects)
  const isLoadingProjects = false
  const hasProjectsError = Boolean(initialProjectsError)
  const [activeDescription, setActiveDescription] = useState<ActiveProjectDescription | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)
  const [chatRateLimitRemaining, setChatRateLimitRemaining] = useState<number | null>(CHAT_RATE_LIMIT_MAX_REQUESTS)
  const [chatRateLimitRetryAfterSeconds, setChatRateLimitRetryAfterSeconds] = useState<number | null>(null)
  const [theme, setTheme] = useState<ThemeMode>("dark")
  const [activeHeroPanel, setActiveHeroPanel] = useState<"hub" | "home" | "about">("home")
  const pageScrollRef = useRef<HTMLDivElement>(null)
  const heroRailRef = useRef<HTMLDivElement>(null)
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<Record<number, ProjectVideoRefs>>({})
  const [readyProjectVideoIds, setReadyProjectVideoIds] = useState<Set<number>>(() => new Set())
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
  const premiumProjectCardClass = isLightMode
    ? "border-black/10 bg-white/65 shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
    : "border-white/15 bg-neutral-950/60 shadow-[0_24px_70px_rgba(0,0,0,0.45)]"
  const premiumProjectLinkClass = isLightMode
    ? "border-black/10 bg-black/[0.025] text-neutral-800 shadow-[0_6px_18px_rgba(0,0,0,0.04)] hover:border-black/20 hover:bg-black hover:text-white"
    : "border-white/10 bg-white/[0.035] text-gray-100 shadow-[0_6px_18px_rgba(0,0,0,0.18)] hover:border-white/20 hover:bg-white/10 hover:text-white"
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

  const readPositiveIntegerHeader = (value: string | null) => {
    if (!value) return null

    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null
  }

  const readNonNegativeIntegerHeader = (value: string | null) => {
    if (!value) return null

    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed >= 0 ? parsed : null
  }

  const markProjectVideoReady = (id: number) => {
    setReadyProjectVideoIds((currentIds) => {
      if (currentIds.has(id)) {
        return currentIds
      }

      const nextIds = new Set(currentIds)
      nextIds.add(id)
      return nextIds
    })
  }

  const playProjectVideo = async (id: number) => {
    const videos = videoRefs.current[id]
    if (!videos) return

    if (!videos.main) return

    try {
      await videos.main.play()
    } catch {
      // Some browsers can reject autoplay even when muted; keep the UI silent.
    }
  }

  const pauseProjectVideo = (id: number) => {
    const videos = videoRefs.current[id]
    if (!videos) return

    if (!videos.main) return

    videos.main.pause()
    videos.main.currentTime = 0
  }

  const sendChatMessage = async (rawMessage: string) => {
    const message = rawMessage.trim()
    if (!message || isSendingChat) return
    if (message.length > MAX_CHAT_MESSAGE_LENGTH) {
      setChatError(`Le message ne doit pas depasser ${MAX_CHAT_MESSAGE_LENGTH} caracteres.`)
      return
    }

    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: message }]
    setChatMessages(nextMessages)
    setChatInput("")
    setChatError(null)
    setChatRateLimitRetryAfterSeconds(null)
    setIsSendingChat(true)

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), CHAT_CLIENT_TIMEOUT_MS)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      })
      const remainingHeader = readNonNegativeIntegerHeader(response.headers.get("RateLimit-Remaining"))
      const retryAfterHeader = readPositiveIntegerHeader(response.headers.get("Retry-After"))

      if (remainingHeader !== null) {
        setChatRateLimitRemaining(remainingHeader)
      }
      setChatRateLimitRetryAfterSeconds(response.status === 429 ? retryAfterHeader : null)

      const payload = (await response.json()) as ChatApiResponse

      if (!response.ok || !payload.answer) {
        throw new Error(payload.error || "Le chatbot n'a pas pu repondre.")
      }

      setChatMessages([...nextMessages, { role: "assistant", content: payload.answer }])
    } catch (error) {
      const isAbort = error instanceof DOMException && error.name === "AbortError"
      setChatError(
        isAbort
          ? "Le chatbot met trop de temps a repondre. Reessaie dans quelques secondes."
          : error instanceof Error
            ? error.message
            : "Impossible de joindre le chatbot.",
      )
    } finally {
      window.clearTimeout(timeout)
      setIsSendingChat(false)
    }
  }

  const handleChatSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await sendChatMessage(chatInput)
  }

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
    <div ref={pageScrollRef} className="portfolio-scroll h-screen overflow-y-scroll snap-y snap-mandatory">
      <main className={`relative min-h-screen w-full transition-colors duration-300 ${mainThemeClass}`}>
        <ThemeNavigation
          theme={theme}
          setTheme={(nextTheme) => setTheme(nextTheme)}
          getThemeButtonClass={getThemeButtonClass}
        />
        <SocialNavigation socialLinks={socialLinks} socialButtonClass={socialButtonClass} />

        <section className="hero-section relative h-screen overflow-hidden snap-start">
          <div
            ref={heroRailRef}
            className="no-scrollbar h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden scroll-smooth"
          >
            <div className="flex h-full w-[300vw]">
              <HubPanel
                projects={projects}
                isLoadingProjects={isLoadingProjects}
                hasProjectsError={hasProjectsError}
                heroRailRef={heroRailRef}
                videoRefs={videoRefs}
                readyProjectVideoIds={readyProjectVideoIds}
                playProjectVideo={playProjectVideo}
                pauseProjectVideo={pauseProjectVideo}
                onProjectVideoCanPlay={markProjectVideoReady}
                onShowDescription={setActiveDescription}
                gridColor={gridColor}
                isLightMode={isLightMode}
                primaryTextClass={primaryTextClass}
                mutedTextClass={mutedTextClass}
                labelTextClass={labelTextClass}
                chipClass={chipClass}
                arrowButtonClass={arrowButtonClass}
                projectCardClass={projectCardClass}
                projectMediaClass={projectMediaClass}
                premiumProjectCardClass={premiumProjectCardClass}
                premiumProjectLinkClass={premiumProjectLinkClass}
              />
              <HomePanel
                heroRailRef={heroRailRef}
                gridColor={gridColor}
                isLightMode={isLightMode}
                primaryTextClass={primaryTextClass}
                mutedTextClass={mutedTextClass}
                labelTextClass={labelTextClass}
                chipClass={chipClass}
                arrowButtonClass={arrowButtonClass}
              />
              <AboutPanel
                heroRailRef={heroRailRef}
                gridColor={gridColor}
                isLightMode={isLightMode}
                primaryTextClass={primaryTextClass}
                mutedTextClass={mutedTextClass}
                labelTextClass={labelTextClass}
                chipClass={chipClass}
                arrowButtonClass={arrowButtonClass}
              />
            </div>
          </div>
        </section>

        <ChatSection
          chatMessages={chatMessages}
          chatMessagesRef={chatMessagesRef}
          chatInput={chatInput}
          setChatInput={setChatInput}
          isSendingChat={isSendingChat}
          chatError={chatError}
          chatRateLimitRemaining={chatRateLimitRemaining}
          chatRateLimitRetryAfterSeconds={chatRateLimitRetryAfterSeconds}
          handleChatSubmit={handleChatSubmit}
          onSelectQuestion={sendChatMessage}
          maxChatMessageLength={MAX_CHAT_MESSAGE_LENGTH}
          gridColor={gridColor}
          isLightMode={isLightMode}
          chipClass={chipClass}
          labelTextClass={labelTextClass}
          chatBubbleBaseClass={chatBubbleBaseClass}
          assistantBubbleClass={assistantBubbleClass}
          userBubbleClass={userBubbleClass}
        />
      </main>

      <ProjectDescriptionModal
        activeDescription={activeDescription}
        onClose={() => setActiveDescription(null)}
        descriptionPanelClass={descriptionPanelClass}
        projectButtonClass={projectButtonClass}
        mutedTextClass={mutedTextClass}
      />

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
