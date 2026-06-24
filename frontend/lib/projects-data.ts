import type { StrapiCollectionResponse, StrapiProject } from "@/lib/strapi"
import { getCachedProjects, setCachedProjects } from "@/lib/projects-cache"

export type ProjectsResponseBody = {
  data: StrapiProject[]
  error?: string
}

export type ProjectsLoadResult = {
  body: ProjectsResponseBody
  status: number
  cacheStatus: "hit" | "miss"
}

export async function loadProjects(): Promise<ProjectsLoadResult> {
  const cachedProjects = await getCachedProjects()
  if (cachedProjects) {
    return {
      body: cachedProjects,
      status: 200,
      cacheStatus: "hit",
    }
  }

  const strapiBaseUrl =
    process.env.STRAPI_INTERNAL_URL ?? process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337"
  const token = process.env.STRAPI_API_TOKEN
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    const response = await fetch(`${strapiBaseUrl}/api/projects?populate=media&sort=date:desc`, {
      cache: "no-store",
      headers,
    })

    if (!response.ok) {
      return {
        body: { data: [], error: `Strapi returned ${response.status}` },
        status: response.status,
        cacheStatus: "miss",
      }
    }

    const payload = (await response.json()) as StrapiCollectionResponse<StrapiProject>
    const body = { data: payload.data ?? [] }

    await setCachedProjects(body)

    return {
      body,
      status: 200,
      cacheStatus: "miss",
    }
  } catch {
    return {
      body: { data: [], error: "Unable to reach Strapi" },
      status: 502,
      cacheStatus: "miss",
    }
  }
}
