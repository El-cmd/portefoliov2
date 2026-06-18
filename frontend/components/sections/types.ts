import type { LucideIcon } from "lucide-react"
import type { StrapiProject } from "@/lib/strapi"

export type ThemeMode = "dark" | "light"

export type ProjectVideoRefs = {
  ambient: HTMLVideoElement | null
  main: HTMLVideoElement | null
}

export type ActiveProjectDescription = {
  title: string
  description: string
}

export type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export type ProjectsApiResponse = {
  data: StrapiProject[]
  error?: string
}

export type ChatApiResponse = {
  answer?: string
  error?: string
}

export type SocialLink = {
  label: string
  href: string
  icon: LucideIcon
}
