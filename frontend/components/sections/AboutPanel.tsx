"use client"

import type { RefObject } from "react"
import {
  BadgeCheck,
  BriefcaseBusiness,
  Code2,
  Download,
  FileText,
  Github,
  Lightbulb,
  Linkedin,
  Mail,
  Rocket,
  ShieldCheck,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react"
import Image from "next/image"
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

const stats = [
  {
    value: "+10",
    label: "Projets realises",
    icon: BriefcaseBusiness,
  },
  {
    value: "100%",
    label: "Passionne",
    icon: Code2,
  },
  {
    value: "3+",
    label: "Annees d'experience",
    icon: BadgeCheck,
  },
  {
    value: "0 -> 1",
    label: "De l'idee a la prod",
    icon: UserRound,
  },
]

const expertise = [
  {
    title: "Developpeur full-stack",
    description: "Web & APIs",
    icon: Code2,
  },
  {
    title: "IA pragmatique",
    description: "Outils utiles & integres",
    icon: BadgeCheck,
  },
  {
    title: "Ops & deploiement",
    description: "Docker, K8s, CI/CD",
    icon: Rocket,
  },
  {
    title: "Toujours en apprentissage",
    description: "Curieux & autonome",
    icon: FileText,
  },
]

const values = [
  {
    title: "Impact",
    description: "Je construis des solutions qui repondent a de vrais besoins.",
    icon: Target,
  },
  {
    title: "Fiabilite",
    description: "Code propre, tests, monitoring : pret pour la production.",
    icon: ShieldCheck,
  },
  {
    title: "Apprentissage",
    description: "Curieux, autonome et toujours en veille technologique.",
    icon: Lightbulb,
  },
  {
    title: "Collaboration",
    description: "A l'ecoute, transparent et oriente equipe et utilisateur.",
    icon: UsersRound,
  },
]

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
  const surfaceClass = isLightMode
    ? "border-black/10 bg-white/78 text-black shadow-[0_22px_80px_rgba(0,0,0,0.1)]"
    : "border-white/10 bg-[#0d0d0d]/82 text-white shadow-[0_22px_80px_rgba(0,0,0,0.42)]"
  const subtleSurfaceClass = isLightMode
    ? "border-black/10 bg-white/72 text-black shadow-[0_16px_55px_rgba(0,0,0,0.08)]"
    : "border-white/10 bg-white/[0.045] text-white shadow-[0_16px_55px_rgba(0,0,0,0.3)]"
  const strongButtonClass = isLightMode
    ? "border-black/10 bg-black text-white hover:bg-neutral-800"
    : "border-white/15 bg-white text-black hover:bg-neutral-200"
  const quietButtonClass = isLightMode
    ? "border-black/12 bg-white/70 text-black hover:bg-black hover:text-white"
    : "border-white/10 bg-white/[0.035] text-white hover:border-white/20 hover:bg-white/10"
  const dividerClass = isLightMode ? "border-black/10" : "border-white/10"
  const portraitGlowClass = isLightMode
    ? "bg-[radial-gradient(circle_at_50%_40%,rgba(0,0,0,0.1),transparent_58%)]"
    : "bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.12),transparent_58%)]"

  return (
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

      <div
        data-annex-scroll
        className="no-scrollbar relative z-10 h-full w-full max-w-7xl overflow-y-auto overscroll-contain px-5 pb-10 pt-24 sm:px-7 md:px-10 lg:px-12 lg:pb-12 lg:pt-20"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5">
          <section className="relative grid min-h-[26rem] gap-7 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="relative z-20 max-w-xl text-left">
              <p className={`mb-3 text-[0.68rem] uppercase tracking-[0.46em] ${labelTextClass}`}>
                About
              </p>
              <h2 className={`text-5xl font-medium tracking-tight sm:text-6xl lg:text-7xl ${primaryTextClass}`}>
                Valentin Loth
              </h2>
              <p className={`mt-5 text-base leading-7 sm:text-lg ${mutedTextClass}`}>
                Software Engineer oriente produits web deployables.
              </p>
              <p className={`mt-4 max-w-lg text-sm font-light leading-7 sm:text-base ${mutedTextClass}`}>
                Je concois des interfaces modernes, des APIs robustes et des integrations IA utiles, avec une exigence
                constante : livrer des solutions fiables, maintenables et pretes pour la production.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:lecmd@proton.me"
                  className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${strongButtonClass}`}
                >
                  <Mail className="h-4 w-4" />
                  Me contacter
                </a>
                <a
                  href="https://github.com/El-cmd"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition ${quietButtonClass}`}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href="https://fr.linkedin.com/in/valentinloth"
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition ${quietButtonClass}`}
                >
                  <Linkedin className="h-4 w-4" />
                  Linkedin
                </a>
              </div>
            </div>

            <div className="relative z-10 grid min-h-[25rem] grid-cols-1 items-center gap-5 sm:grid-cols-[1fr_18rem] lg:min-h-[28rem]">
              <div className="pointer-events-none relative order-2 mx-auto h-[23rem] w-full max-w-[25rem] sm:order-1 lg:absolute lg:bottom-0 lg:left-[-3rem] lg:h-[31rem] lg:max-w-[31rem]">
                <div className={`absolute inset-x-6 bottom-2 top-8 rounded-full blur-3xl ${portraitGlowClass}`} />
                <Image
                  src="/assets/valentinLoth.png"
                  alt="Portrait de Valentin Loth"
                  fill
                  sizes="(min-width: 1024px) 31rem, 25rem"
                  priority
                  className="relative z-10 object-contain object-bottom drop-shadow-[0_28px_55px_rgba(0,0,0,0.48)]"
                />
              </div>

              <div className="relative z-20 order-1 grid grid-cols-2 gap-3 sm:order-2">
                {stats.map(({ value, label, icon: Icon }) => (
                  <article
                    key={label}
                    className={`min-h-[6.2rem] rounded-lg border p-4 backdrop-blur-xl ${subtleSurfaceClass}`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" />
                      <strong className="text-xl font-medium tracking-tight sm:text-2xl">{value}</strong>
                    </div>
                    <p className={`mt-3 text-xs leading-5 sm:text-sm ${mutedTextClass}`}>{label}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={`grid rounded-lg border backdrop-blur-xl md:grid-cols-4 ${surfaceClass}`}>
            {expertise.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                className={`flex min-h-[6.25rem] items-center gap-4 px-6 py-5 ${
                  index > 0 ? `border-t md:border-l md:border-t-0 ${dividerClass}` : ""
                }`}
              >
                <Icon className="h-8 w-8 shrink-0" />
                <div className="min-w-0 text-left">
                  <h3 className="text-sm font-semibold leading-5 sm:text-base">{title}</h3>
                  <p className={`mt-1 text-sm ${mutedTextClass}`}>{description}</p>
                </div>
              </article>
            ))}
          </section>

          <section className={`rounded-lg border p-6 backdrop-blur-xl lg:p-7 ${surfaceClass}`}>
            <div className="grid gap-7 lg:grid-cols-[0.25fr_0.75fr] lg:items-center">
              <div className="text-left">
                <h3 className="text-xl font-semibold tracking-tight">Mon parcours</h3>
                <p className={`mt-4 max-w-xs text-sm leading-7 ${mutedTextClass}`}>
                  Chaque etape m&apos;a permis de grandir, d&apos;apprendre et de construire des projets concrets a impact.
                </p>
                <a
                  href="/cv.pdf"
                  className={`mt-5 inline-flex h-10 items-center gap-3 rounded-lg border px-4 text-sm font-medium transition ${quietButtonClass}`}
                >
                  Telecharger mon CV
                  <Download className="h-4 w-4" />
                </a>
              </div>

              <div className="relative grid gap-6 md:grid-cols-3">
                <div className={`pointer-events-none absolute left-[13%] right-[13%] top-5 hidden border-t ${dividerClass} md:block`} />

                <article className="relative grid gap-4 text-left md:grid-cols-[5.5rem_1fr]">
                  <div className={`relative z-10 grid h-20 w-20 place-items-center rounded-full border ${dividerClass} ${subtleSurfaceClass}`}>
                    <Image src="/assets/42.png" alt="42 School" width={40} height={40} className="object-contain" />
                  </div>
                  <div>
                    <h4 className="font-semibold">42 School</h4>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>2022 - 2024</p>
                    <p className={`mt-3 text-sm leading-6 ${mutedTextClass}`}>
                      Formation intense en autonomie. Projets en C, C++, Python, systemes et reseau.
                    </p>
                  </div>
                </article>

                <article className="relative grid gap-4 text-left md:grid-cols-[5.5rem_1fr]">
                  <div className={`relative z-10 grid h-20 w-20 place-items-center rounded-full border ${dividerClass} ${subtleSurfaceClass}`}>
                    <span className="text-3xl font-black tracking-[-0.12em]">V+</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Stage - OVHcloud</h4>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>2024 - 2025</p>
                    <p className={`mt-3 text-sm leading-6 ${mutedTextClass}`}>
                      AI Engineer - Conception d&apos;un AI HUB, RAG, integrations IA et mise en production sur Kubernetes.
                    </p>
                  </div>
                </article>

                <article className="relative grid gap-4 text-left md:grid-cols-[5.5rem_1fr]">
                  <div className={`relative z-10 grid h-20 w-20 place-items-center rounded-full border ${dividerClass} ${subtleSurfaceClass}`}>
                    <Rocket className="h-9 w-9" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Aujourd&apos;hui</h4>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>2025 -&gt;</p>
                    <p className={`mt-3 text-sm leading-6 ${mutedTextClass}`}>
                      A la recherche de nouveaux defis pour construire des produits utiles et scalables.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className={`rounded-lg border p-6 backdrop-blur-xl lg:p-7 ${surfaceClass}`}>
            <h3 className="text-left text-xl font-semibold tracking-tight">Mes valeurs</h3>
            <div className="mt-6 grid gap-5 md:grid-cols-4">
              {values.map(({ title, description, icon: Icon }, index) => (
                <article
                  key={title}
                  className={`flex gap-4 text-left ${
                    index > 0 ? `border-t pt-5 md:border-l md:border-t-0 md:pl-7 md:pt-0 ${dividerClass}` : ""
                  }`}
                >
                  <Icon className="h-8 w-8 shrink-0" />
                  <div>
                    <h4 className="font-semibold">{title}</h4>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="absolute left-4 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 md:left-6">
        <span className={`rounded-full border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] backdrop-blur-sm ${chipClass}`}>
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
