import { PortfolioClient } from "@/components/pages/PortfolioClient"
import { loadProjects } from "@/lib/projects-data"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export default async function Home() {
  const projectsResult = await loadProjects()

  return (
    <PortfolioClient
      initialProjects={projectsResult.body.data ?? []}
      initialProjectsError={projectsResult.body.error ?? null}
    />
  )
}
