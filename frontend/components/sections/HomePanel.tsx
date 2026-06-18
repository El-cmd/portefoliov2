"use client"

import type { RefObject } from "react"
import dynamic from "next/dynamic"
import FlickeringGrid from "@/components/flickering-grid"

const Typewriter = dynamic(() => import("typewriter-effect"), { ssr: false })

type HomePanelProps = {
  heroRailRef: RefObject<HTMLDivElement | null>
  gridColor: string
  isLightMode: boolean
  primaryTextClass: string
  mutedTextClass: string
  labelTextClass: string
  chipClass: string
  arrowButtonClass: string
}

export function HomePanel({
  heroRailRef,
  gridColor,
  isLightMode,
  primaryTextClass,
  mutedTextClass,
  labelTextClass,
  chipClass,
  arrowButtonClass,
}: HomePanelProps) {
  return (
    <article className="home-panel relative flex h-full w-screen shrink-0 snap-start items-center justify-center overflow-hidden">
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
      <div className="hero-content max-w-6xl mx-auto text-center relative z-10">
        <div className="relative">
          <div className="inline-block">
            <h1 className={`hero-title relative mb-8 text-5xl font-medium tracking-tight md:text-7xl ${primaryTextClass}`}>
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
            <p className={`hero-subtitle mx-auto mt-6 max-w-3xl text-lg font-light md:text-xl ${mutedTextClass}`}>
              Software Engineer
            </p>
          </div>
        </div>
      </div>

      <div className="hero-control hero-control-hub absolute left-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 md:left-8">
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

      <div className="hero-control hero-control-about absolute right-5 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-3 md:right-8">
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

      <div className="hero-control hero-control-chat absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3">
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

      <p className={`mobile-swipe-hint ${labelTextClass}`}>
        Swipez pour naviguer !
      </p>
    </article>
  )
}
