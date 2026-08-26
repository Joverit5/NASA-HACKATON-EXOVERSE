import Home from "@/src/components/home"
import { getFeaturedPlanet } from "@/src/lib/exoplanetCatalog"

/**
 * The landing page is a server component so the featured planet's real archive
 * values are in the first HTML response — the curve is the page's argument, and an
 * argument that arrives after a client fetch is an argument the visitor waits for.
 */
export const revalidate = 3600

export default async function Page() {
  const featured = await getFeaturedPlanet()
  return <Home featured={featured} />
}
