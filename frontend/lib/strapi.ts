export type StrapiMedia = {
  id: number
  documentId?: string
  name?: string
  alternativeText?: string | null
  mime?: string
  hash?: string
  formats?: Record<string, { url?: string | null }> | null
  previewUrl?: string | null
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

export function getStrapiMediaPosterUrl(media?: StrapiMedia | null) {
  const remotePosterUrl =
    media?.previewUrl ??
    media?.formats?.thumbnail?.url ??
    media?.formats?.small?.url ??
    media?.formats?.medium?.url ??
    null

  if (remotePosterUrl) {
    return getStrapiAssetUrl(remotePosterUrl)
  }

  if (media?.mime?.startsWith("video/") && media.hash) {
    return `/project-posters/${media.hash}.jpg`
  }

  return null
}
