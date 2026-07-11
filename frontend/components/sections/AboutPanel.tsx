"use client"

import { useState, type RefObject } from "react"
import {
  BadgeCheck,
  BriefcaseBusiness,
  Code2,
  Download,
  FileText,
  Github,
  Linkedin,
  Mail,
  Rocket,
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
    value: "Stack",
    label: "Technologies",
    icon: Code2,
    action: "stack",
  },
]

const stackGroups = [
  {
    title: "Frontend",
    items: [
      { name: "React", icon: "react.svg" },
      { name: "Next.js", icon: "nextjs.svg" },
      { name: "TypeScript", icon: "typescript.svg" },
      { name: "Tailwind CSS", icon: "tailwindcss.svg" },
      { name: "Three.js", icon: "threejs.svg" },
    ],
  },
  {
    title: "Backend",
    items: [
      { name: "Python", icon: "python.svg" },
      { name: "FastAPI", icon: "fastapi.svg" },
      { name: "Flask" },
      { name: "Node.js" },
      { name: "REST APIs" },
    ],
  },
  {
    title: "IA & data",
    items: [
      { name: "RAG" },
      { name: "Embeddings" },
      { name: "FAISS" },
      { name: "PostgreSQL", icon: "postgresql.svg" },
      { name: "pgvector" },
    ],
  },
  {
    title: "Ops & cloud",
    items: [
      { name: "Docker", icon: "docker.svg" },
      { name: "Kubernetes", icon: "kubernetes.svg" },
      { name: "Helm", icon: "helm.svg" },
      { name: "Nginx", icon: "nginx.svg" },
      { name: "GitHub Actions", icon: "githubactions.svg" },
      { name: "CI/CD" },
    ],
  },
  {
    title: "CMS & infra",
    items: [
      { name: "Strapi" },
      { name: "Redis" },
      { name: "Cloudflare" },
      { name: "Linux VPS", icon: "linux.svg" },
      { name: "Monitoring" },
    ],
  },
]

const expertise = [
  {
    title: "Developpeur full-stack",
    description: "Web & APIs",
    icon: Code2,
  },
  {
    title: "Outils IA sur mesure",
    description: "Je concois et integre differents modeles pour differents besoins",
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
  const [isStackModalOpen, setIsStackModalOpen] = useState(false)
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
        className="about-panel-scroll no-scrollbar relative z-10 h-full w-full max-w-7xl overflow-y-auto overscroll-contain px-5 pb-6 pt-20 sm:px-7 md:px-10 lg:px-12 lg:pt-20"
      >
        <div className="about-panel-inner mx-auto flex w-full max-w-6xl flex-col gap-4">
          <section className="about-hero relative grid min-h-[21rem] gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="relative z-20 max-w-xl text-left">
              <p className={`about-kicker mb-3 text-[0.68rem] uppercase tracking-[0.46em] ${labelTextClass}`}>
                About
              </p>
              <h2 className={`about-name text-5xl font-medium tracking-tight sm:text-6xl lg:text-6xl ${primaryTextClass}`}>
                Valentin Loth
              </h2>
              <p className={`about-lead mt-5 text-base leading-7 sm:text-lg ${mutedTextClass}`}>
                Je construis des produits, pas seulement du code.
              </p>
              <p className={`about-copy mt-4 max-w-lg text-sm font-light leading-7 sm:text-base ${mutedTextClass}`}>
                Issu de 42 et enrichi par une experience chez OVHcloud, j&apos;aime concevoir des applications qui
                repondent a de vrais besoins. Du frontend aux APIs, jusqu&apos;aux integrations IA et au deploiement avec
                Kubernetes, je cherche toujours a creer des solutions utiles, maintenables et agreables a utiliser.
              </p>

              <div className="about-links mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:lecmd@proton.me"
                  className={`about-link inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${strongButtonClass}`}
                >
                  <Mail className="h-4 w-4" />
                  Me contacter
                </a>
                <a
                  href="https://github.com/El-cmd"
                  target="_blank"
                  rel="noreferrer"
                  className={`about-link inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition ${quietButtonClass}`}
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
                <a
                  href="https://www.linkedin.com/in/loth-valentin-50378a231"
                  target="_blank"
                  rel="noreferrer"
                  className={`about-link inline-flex h-11 items-center gap-2 rounded-lg border px-5 text-sm font-medium transition ${quietButtonClass}`}
                >
                  <Linkedin className="h-4 w-4" />
                  Linkedin
                </a>
              </div>
            </div>

            <div className="about-visual relative z-10 min-h-[20rem] lg:min-h-[23rem]">
              <div className="about-portrait pointer-events-none relative mx-auto h-[18rem] w-[18rem] overflow-hidden rounded-full sm:h-[20rem] sm:w-[20rem] lg:absolute lg:bottom-2 lg:left-[-1rem] lg:h-[22rem] lg:w-[22rem]">
                <div className={`absolute inset-4 rounded-full blur-3xl ${portraitGlowClass}`} />
                <Image
                  src="/assets/valentinLoth.png"
                  alt="Portrait de Valentin Loth"
                  fill
                  sizes="(min-width: 1024px) 22rem, 20rem"
                  priority
                  className="relative z-10 object-contain object-center drop-shadow-[0_28px_55px_rgba(0,0,0,0.48)]"
                />
              </div>

              <div className="about-stats relative z-20 ml-auto mt-4 grid w-full max-w-[15rem] grid-cols-2 gap-2.5 lg:absolute lg:right-0 lg:top-20 lg:mt-0 xl:right-2">
                {stats.map(({ value, label, icon: Icon, action }) => {
                  if (action === "stack") {
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setIsStackModalOpen(true)}
                        className="about-stat group min-h-[4.9rem] rounded-lg border border-white bg-white p-3 text-left text-black shadow-[0_16px_55px_rgba(0,0,0,0.28)] transition hover:border-white hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <strong className="text-lg font-medium tracking-tight sm:text-xl">{value}</strong>
                          <span className="ml-auto text-lg leading-none" aria-hidden="true">
                            &gt;
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-4 text-neutral-700 transition group-hover:text-neutral-300">{label}</p>
                      </button>
                    )
                  }

                  return (
                    <article
                      key={label}
                      className={`about-stat min-h-[4.9rem] rounded-lg border p-3 backdrop-blur-xl ${subtleSurfaceClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <strong className="text-lg font-medium tracking-tight sm:text-xl">{value}</strong>
                      </div>
                      <p className={`mt-2 text-xs leading-4 ${mutedTextClass}`}>{label}</p>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>

          <section className={`about-expertise grid rounded-lg border backdrop-blur-xl md:grid-cols-4 ${surfaceClass}`}>
            {expertise.map(({ title, description, icon: Icon }, index) => (
              <article
                key={title}
                className={`flex min-h-[5.5rem] items-center gap-4 px-6 py-4 ${
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

          <section className={`about-journey rounded-lg border p-5 backdrop-blur-xl lg:p-5 ${surfaceClass}`}>
            <div className="grid gap-5 lg:grid-cols-[0.25fr_0.75fr] lg:items-center">
              <div className="text-left">
                <h3 className="text-xl font-semibold tracking-tight">Mon parcours</h3>
                <p className={`mt-3 max-w-xs text-sm leading-6 ${mutedTextClass}`}>
                  Chaque etape m&apos;a permis de grandir, d&apos;apprendre et de construire des projets concrets.
                </p>
                <a
                  href="/assets/cv-valentin-loth.pdf"
                  className={`mt-4 inline-flex h-10 items-center gap-3 rounded-lg border px-4 text-sm font-medium transition ${quietButtonClass}`}
                >
                  Telecharger mon CV
                  <Download className="h-4 w-4" />
                </a>
              </div>

              <div className="relative grid gap-5 md:grid-cols-3">
                <div className={`pointer-events-none absolute left-[13%] right-[13%] top-5 hidden border-t ${dividerClass} md:block`} />

                <article className="relative grid gap-4 text-left md:grid-cols-[5.5rem_1fr]">
                  <div className="relative z-10 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white">
                    <Image src="/assets/42.png" alt="42 School" width={54} height={54} className="object-contain" />
                  </div>
                  <div>
                    <h4 className="font-semibold">42 School</h4>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>Paris | 2022 - 2025</p>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                      Formation Architecte du numerique - Projets en C, C++, Python, systemes et reseau.
                    </p>
                  </div>
                </article>

                <article className="relative grid gap-4 text-left md:grid-cols-[5.5rem_1fr]">
                  <div className="relative z-10 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-white">
                    <Image src="/assets/ovhlogo.jpg" alt="OVHcloud" width={54} height={54} className="object-contain" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Stage - OVHcloud</h4>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>Roubaix | 2025 - 2026</p>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                      AI Engineer - Applications IA & deploiement Kubernetes.
                    </p>
                  </div>
                </article>

                <article className="relative grid gap-4 text-left md:grid-cols-[5.5rem_1fr]">
                  <div className="relative z-10 grid h-16 w-16 place-items-center rounded-full bg-white text-black">
                    <Rocket className="h-9 w-9" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Aujourd&apos;hui</h4>
                    <p className={`mt-1 text-sm ${mutedTextClass}`}>2026 -&gt;</p>
                    <p className={`mt-2 text-sm leading-6 ${mutedTextClass}`}>
                      A la recherche de nouveaux defis.
                    </p>
                  </div>
                </article>
              </div>
            </div>
          </section>

        </div>
      </div>

      <div className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-3 md:left-6 md:flex">
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

      <div className="about-home-mobile absolute left-4 z-30 flex flex-col items-center gap-3 md:hidden">
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

      {isStackModalOpen ? (
        <div
          role="presentation"
          onClick={() => setIsStackModalOpen(false)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 backdrop-blur-sm"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-stack-title"
            onClick={(event) => event.stopPropagation()}
            className={`w-full max-w-2xl border p-5 sm:p-6 ${
              isLightMode
                ? "border-black/10 bg-white text-black shadow-[0_22px_80px_rgba(0,0,0,0.18)]"
                : "border-white/10 bg-[#050505] text-white shadow-[0_22px_80px_rgba(0,0,0,0.65)]"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id="about-stack-title" className="text-lg font-semibold tracking-tight">
                Stack technologique
              </h3>
              <button
                type="button"
                onClick={() => setIsStackModalOpen(false)}
                className={`border px-3 py-2 text-[10px] uppercase tracking-[0.18em] transition ${strongButtonClass}`}
              >
                Fermer
              </button>
            </div>
            <div className="mt-5 grid max-h-[62vh] gap-4 overflow-y-auto sm:grid-cols-2">
              {stackGroups.map(({ title, items }) => (
                <article
                  key={title}
                  className={`rounded-lg border p-4 ${
                    isLightMode ? "border-black/10 bg-neutral-50" : "border-white/10 bg-[#111]"
                  }`}
                >
                  <h4 className="text-sm font-semibold">{title}</h4>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {items.map(({ name, icon }) => {
                      if (icon) {
                        return (
                          <span
                            key={name}
                            title={name}
                            aria-label={name}
                            className={`grid h-10 w-10 place-items-center rounded-lg border ${chipClass}`}
                          >
                            <Image
                              src={`/icons/${icon}`}
                              alt=""
                              width={24}
                              height={24}
                              className="h-6 w-6 object-contain"
                            />
                          </span>
                        )
                      }

                      return (
                        <span
                          key={name}
                          title={name}
                          className={`rounded-full border px-3 py-1 text-xs ${chipClass}`}
                        >
                          {name}
                        </span>
                      )
                    })}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </article>
  )
}
