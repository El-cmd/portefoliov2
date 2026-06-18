"use client"

import type { ActiveProjectDescription } from "@/components/sections/types"

type ProjectDescriptionModalProps = {
  activeDescription: ActiveProjectDescription | null
  onClose: () => void
  descriptionPanelClass: string
  projectButtonClass: string
  mutedTextClass: string
}

export function ProjectDescriptionModal({
  activeDescription,
  onClose,
  descriptionPanelClass,
  projectButtonClass,
  mutedTextClass,
}: ProjectDescriptionModalProps) {
  if (!activeDescription) {
    return null
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
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
            onClick={onClose}
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
  )
}
