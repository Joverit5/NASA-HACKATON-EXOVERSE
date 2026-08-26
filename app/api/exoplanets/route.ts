import type { NextRequest } from "next/server"
import { getCatalog, queryCatalog } from "@/src/lib/exoplanetCatalog"

/**
 * ExoVis catalog endpoint.
 *
 * Search, filter, sort and paging all run against the full classified catalog held
 * in `src/lib/exoplanetCatalog.ts`. The NASA TAP service can do none of them: it has
 * no OFFSET, and its TOP clause applies before ORDER BY. See that file for detail.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  try {
    const catalog = await getCatalog()

    const page = queryCatalog(catalog, {
      searchTerm: searchParams.get("searchTerm") ?? "",
      typeFilter: searchParams.get("typeFilter") ?? "All",
      habitabilityFilter: searchParams.get("habitabilityFilter") ?? "All",
      sortBy: searchParams.get("sortBy") ?? "name",
      offset: Number(searchParams.get("offset") ?? 0),
      limit: Number(searchParams.get("limit") ?? 60),
    })

    return Response.json(page, {
      headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" },
    })
  } catch (err: any) {
    return Response.json(
      {
        error: "The NASA Exoplanet Archive is unavailable right now.",
        details: err?.message ?? String(err),
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
