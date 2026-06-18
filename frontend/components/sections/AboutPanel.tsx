"use client"

import type { RefObject } from "react"
import { Bot, Boxes, Code2, Github, Linkedin, Mail, ServerCog } from "lucide-react"
import FlickeringGrid from "@/components/flickering-grid"

type AboutPanelProps = {
  heroRailRef: RefObject<HTMLDivElement | null>
  gridColor: string
  isLightMode: boolean
  primaryTextClass: string
  mutedTextClass: string
  labelTextClass: string
  chipClass: string
  arrowButtonClass: string
}

const focusAreas = [
  {
    title: "Interfaces produit",
    description: "Experiences Next.js propres, rapides et lisibles, avec une attention forte aux etats reels.",
    icon: Code2,
  },
  {
    title: "APIs & IA",
    description: "Backends Python/FastAPI, chatbot RAG, garde-fous de prompt et integrations orientees usage.",
    icon: Bot,
  },
  {
    title: "Deploiement",
    description: "Docker, Nginx, CI/CD et environnements reproductibles pour livrer sans friction.",
    icon: ServerCog,
  },
  {
    title: "Systemes",
    description: "Architecture pragmatique, decoupage clair, documentation courte et maintenance realiste.",
    icon: Boxes,
  },
]

const stack = ["TypeScript", "React", "Next.js", "Python", "FastAPI", "Docker", "Kubernetes", "Strapi", "PostgreSQL"]

export function AboutPanel({
  heroRailRef,
  gridColor,
  isLightMode,
  primaryTextClass,
  mutedTextClass,
  labelTextClass,
  chipClass,
  arrowButtonClass,
}: AboutPanelProps) {
  const panelClass = isLightMode
    ? "border-black/10 bg-white/70 text-black shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
    : "border-white/10 bg-white/[0.045] text-white shadow-[0_18px_50px_rgba(0,0,0,0.25)]"
  const linkClass = isLightMode
    ? "border-black/10 bg-black text-white hover:bg-neutral-800"
    : "border-white/15 bg-white text-black hover:bg-neutral-200"
  const quietLinkClass = isLightMode
    ? "border-black/15 bg-white/70 text-black hover:bg-black hover:text-white"
    : "border-white/10 bg-white/[0.05] text-white hover:bg-white/10"

  return (
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

      <div
        data-annex-scroll
        className="no-scrollbar relative z-10 h-full w-full max-w-6xl overflow-y-auto overscroll-contain px-6 pb-10 pt-24 md:flex md:items-center md:px-14 md:pt-20"
      >
        <div className="grid w-full gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="text-left">
            <p className={`mb-4 text-xs uppercase tracking-[0.45em] ${labelTextClass}`}>
              About
            </p>
            <h2 className={`text-5xl font-medium tracking-tight md:text-7xl ${primaryTextClass}`}>
              Valentin Loth
            </h2>
            <p className={`mt-6 max-w-xl text-base font-light leading-8 md:text-lg ${mutedTextClass}`}>
              Software Engineer oriente produits web deployables. Je construis des interfaces modernes, des APIs solides
              et des integrations IA utiles, avec un niveau d&apos;exigence adapte a la mise en production.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="mailto:lecmd@proton.me"
                className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${linkClass}`}
              >
                <Mail className="h-4 w-4" />
                Contact
              </a>
              <a
                href="https://github.com/El-cmd"
                target="_blank"
                rel="noreferrer"
                className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${quietLinkClass}`}
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="https://fr.linkedin.com/in/valentinloth"
                target="_blank"
                rel="noreferrer"
                className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${quietLinkClass}`}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span key={item} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${chipClass}`}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {focusAreas.map(({ title, description, icon: Icon }) => (
              <article key={title} className={`rounded-lg border p-5 backdrop-blur-xl ${panelClass}`}>
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${
                      isLightMode ? "bg-black text-white" : "bg-white text-black"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-base font-medium tracking-tight">{title}</h3>
                </div>
                <p className={`mt-4 text-sm leading-6 ${mutedTextClass}`}>
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
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
  )
}
