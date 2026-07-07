"use client"

import type { RefObject } from "react"
import { ExternalLink, FileText, Github } from "lucide-react"
import FlickeringGrid from "@/components/flickering-grid"
import type { ActiveProjectDescription, ProjectVideoRefs } from "@/components/sections/types"
import { getStrapiAssetUrl, getStrapiMediaPosterUrl, type StrapiProject } from "@/lib/strapi"

type HubPanelProps = {
  projects: StrapiProject[]
  isLoadingProjects: boolean
  hasProjectsError: boolean
  heroRailRef: RefObject<HTMLDivElement | null>
  videoRefs: RefObject<Record<number, ProjectVideoRefs>>
  readyProjectVideoIds: Set<number>
  playProjectVideo: (id: number) => Promise<void>
  pauseProjectVideo: (id: number) => void
  onProjectVideoCanPlay: (id: number) => void
  onShowDescription: (description: ActiveProjectDescription) => void
  gridColor: string
  isLightMode: boolean
  primaryTextClass: string
  mutedTextClass: string
  labelTextClass: string
  chipClass: string
  arrowButtonClass: string
  projectCardClass: string
  projectMediaClass: string
  premiumProjectCardClass: string
  premiumProjectLinkClass: string
}

function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed || trimmed.toLowerCase() === "null") {
    return null
  }

  return trimmed
}

export function HubPanel({
  projects,
  isLoadingProjects,
  hasProjectsError,
  heroRailRef,
  videoRefs,
  readyProjectVideoIds,
  playProjectVideo,
  pauseProjectVideo,
  onProjectVideoCanPlay,
  onShowDescription,
  gridColor,
  isLightMode,
  primaryTextClass,
  mutedTextClass,
  labelTextClass,
  chipClass,
  arrowButtonClass,
  projectCardClass,
  projectMediaClass,
  premiumProjectCardClass,
  premiumProjectLinkClass,
}: HubPanelProps) {
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
      <div className="relative z-10 flex h-full w-full max-w-6xl flex-col px-6 pb-8 pt-24 text-center md:pt-20">
        <h2 className={`hub-title text-5xl font-medium tracking-tight md:text-7xl ${primaryTextClass}`}>
          HUB
        </h2>
        <p className={`mx-auto mt-5 max-w-xl text-sm uppercase tracking-[0.35em] ${labelTextClass}`}>
          Projets exposes
        </p>

        <div
          data-annex-scroll
          className="project-grid no-scrollbar mt-8 grid min-h-0 flex-1 auto-rows-max grid-cols-1 content-start items-start gap-5 overflow-y-auto overscroll-contain pr-1 lg:grid-cols-2"
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
              const mediaPosterUrl = getStrapiMediaPosterUrl(project.media)
              const isVideo = project.media?.mime?.startsWith("video/")
              const isProjectVideoReady = readyProjectVideoIds.has(project.id)
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
                  className={`premium-project-card group relative flex h-[25rem] self-start flex-col overflow-hidden rounded-[1.75rem] border text-left backdrop-blur-xl transition duration-500 hover:-translate-y-1 ${premiumProjectCardClass}`}
                >
                  {mediaUrl ? (
                    <div className="project-card-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
                      {isVideo ? (
                        <>
                          <video
                            ref={(node) => {
                              const refs = videoRefs.current[project.id] ?? { ambient: null, main: null }
                              refs.ambient = node
                              videoRefs.current[project.id] = refs
                            }}
                            src={mediaUrl}
                            muted
                            playsInline
                            preload="auto"
                            tabIndex={-1}
                            className="h-full w-full object-cover"
                          />
                          {mediaPosterUrl ? (
                            <img
                              src={mediaPosterUrl}
                              alt=""
                              onError={(event) => {
                                event.currentTarget.hidden = true
                              }}
                              className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${
                                isProjectVideoReady ? "group-hover:opacity-0" : "opacity-100"
                              }`}
                            />
                          ) : null}
                        </>
                      ) : (
                        <img src={mediaUrl} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  ) : null}
                  <div
                    className={`pointer-events-none absolute inset-0 z-[1] ${
                      isLightMode
                        ? "bg-gradient-to-b from-white/15 via-white/45 to-white/90"
                        : "bg-gradient-to-b from-black/10 via-black/45 to-black/90"
                    }`}
                  />

                  <div className={`relative z-10 h-[58%] shrink-0 overflow-hidden ${projectMediaClass}`}>
                    <span
                      className={`absolute left-5 top-5 z-20 rounded-full border px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] backdrop-blur-xl ${chipClass}`}
                    >
                      {projectTag}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute bottom-4 left-5 z-20 h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.9)]"
                    />
                    {mediaUrl ? (
                      isVideo ? (
                        <>
                          <video
                            ref={(node) => {
                              const refs = videoRefs.current[project.id] ?? { ambient: null, main: null }
                              refs.main = node
                              videoRefs.current[project.id] = refs
                            }}
                            src={mediaUrl}
                            muted
                            playsInline
                            preload="auto"
                            onCanPlay={() => onProjectVideoCanPlay(project.id)}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                          />
                          {mediaPosterUrl ? (
                            <img
                              src={mediaPosterUrl}
                              alt={project.media?.alternativeText || project.name}
                              onError={(event) => {
                                event.currentTarget.hidden = true
                              }}
                              className={`absolute inset-0 h-full w-full object-cover transition duration-300 ${
                                isProjectVideoReady ? "group-hover:opacity-0" : "opacity-100"
                              }`}
                            />
                          ) : null}
                        </>
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={project.media?.alternativeText || project.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                        />
                      )
                    ) : (
                      <div className={`grid h-full w-full place-items-center text-[10px] uppercase tracking-[0.24em] ${labelTextClass}`}>
                        No media
                      </div>
                    )}
                    <div
                      className={`pointer-events-none absolute inset-0 ${
                        isLightMode
                          ? "bg-gradient-to-t from-white/55 via-transparent to-white/5"
                          : "bg-gradient-to-t from-black/65 via-transparent to-black/5"
                      }`}
                    />
                  </div>

                  <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
                    <div className="min-w-0">
                      <h3
                        className={`truncate text-xl font-medium tracking-[-0.025em] ${
                          isLightMode ? "text-black" : "text-white"
                        }`}
                      >
                        {project.name}
                      </h3>
                      {description ? (
                        <p className={`project-card-description mt-1.5 text-sm leading-5 ${mutedTextClass}`}>
                          {description}
                        </p>
                      ) : (
                        <p className={`mt-1.5 text-sm leading-5 ${mutedTextClass}`}>
                          Projet selectionne du portfolio.
                        </p>
                      )}
                    </div>

                    {hasProjectUrl || hasGitUrl || hasDescription ? (
                      <div className="mt-auto flex flex-wrap gap-2 pt-3">
                        {hasProjectUrl ? (
                          <a
                            href={projectUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex h-9 items-center gap-3 rounded-lg border px-3 text-xs font-medium transition duration-300 ${premiumProjectLinkClass}`}
                          >
                            <span>Voir</span>
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : null}
                        {hasGitUrl ? (
                          <a
                            href={gitUrl ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={`inline-flex h-9 items-center gap-3 rounded-lg border px-3 text-xs font-medium transition duration-300 ${premiumProjectLinkClass}`}
                          >
                            <span>Git</span>
                            <Github className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        ) : null}
                        {hasDescription ? (
                          <button
                            type="button"
                            onClick={() => {
                              onShowDescription({
                                title: project.name,
                                description: description ?? "",
                              })
                            }}
                            className={`inline-flex h-9 items-center gap-3 rounded-lg border px-3 text-xs font-medium transition duration-300 ${premiumProjectLinkClass}`}
                          >
                            <span>Details</span>
                            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
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
  )
}
