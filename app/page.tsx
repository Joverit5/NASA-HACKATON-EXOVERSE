import Home from "@/src/components/home"
import { getFeaturedPlanet } from "@/src/lib/exoplanetCatalog"

/**
 * The landing page is a server component so the featured planet's real archive
 * values are in the first HTML response — the curve is the page's argument, and an
 * argument that arrives after a client fetch is an argument the visitor waits for.
 *
 * Rendered per request rather than cached, because the hero draws a different real
 * world on each visit. The catalog is already held in memory, so the per-request
 * cost is a filter and a pick, not a fetch.
 */
export const dynamic = "force-dynamic"

export default async function Page() {
  const pick = await getFeaturedPlanet()
  return <Home featured={pick?.planet ?? null} poolSize={pick?.poolSize ?? 0} />
}
