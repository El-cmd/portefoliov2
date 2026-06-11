export type StrapiMedia = {
  id: number
  documentId?: string
  name?: string
  alternativeText?: string | null
  mime?: string
  url: string
}

export type StrapiProject = {
  id: number
  documentId?: string
  name: string
  git_url?: string | null
  project_url?: string | null
  description?: string | null
  date?: string | null
  media?: StrapiMedia | null
  publishedAt?: string | null
}

export type StrapiCollectionResponse<T> = {
  data: T[]
  meta?: Record<string, unknown>
}

export function getStrapiAssetUrl(url?: string | null) {
  if (!url) {
    return null
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  if (url.startsWith("/")) {
    return url
  }

  return `/${url}`
}
