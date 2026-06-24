import { NextResponse } from "next/server"

import { loadProjects } from "@/lib/projects-data"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const result = await loadProjects()

  return NextResponse.json(result.body, {
    status: result.status,
    headers: {
      "x-cache": result.cacheStatus,
    },
  })
}
