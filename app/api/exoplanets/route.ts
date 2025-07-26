import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const searchTerm = searchParams.get("searchTerm") || ""
  const limit = Number(searchParams.get("limit") || 100)
  const offset = Number(searchParams.get("offset") || 0)
  const typeFilter = searchParams.get("typeFilter") || "All"
  const habitabilityFilter = searchParams.get("habitabilityFilter") || "All"
  const sortBy = searchParams.get("sortBy") || "name"

  const baseUrl = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync"
  let whereClause = "pl_name IS NOT NULL AND hostname IS NOT NULL AND default_flag = 1"
  if (searchTerm) {
    const escapedTerm = searchTerm.replace(/'/g, "''")
    whereClause += ` AND (pl_name LIKE '%${escapedTerm}%' OR hostname LIKE '%${escapedTerm}%')`
  }
  // Consulta SQL compatible con TAP/Oracle para paginación
  let innerQuery = `
    SELECT pl_name, hostname, sy_dist, pl_rade, pl_masse, pl_orbper, pl_eqt, disc_year, discoverymethod
    FROM ps
    WHERE ${whereClause}
  `

  if (searchTerm) {
    const term = searchTerm.replace(/'/g, "''") // Escapar comillas simples
    innerQuery += ` AND (pl_name LIKE '%${term}%' OR hostname LIKE '%${term}%')`
  }

  innerQuery += ` ORDER BY pl_name`

  const upperLimit = offset + limit

  // Consulta anidada para paginación con ROWNUM
  const query = `
    SELECT * FROM (
      SELECT a.*, ROWNUM rnum FROM (
        ${innerQuery}
      ) a WHERE ROWNUM <= ${upperLimit}
    ) WHERE rnum > ${offset}
  `

  const params = new URLSearchParams({
    query: query,
    format: "json",
  })

  const url = `${baseUrl}?${params.toString()}`



  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ExoViz/1.0",
      },
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("NASA API Error Response:", errorText)
      return new Response(
        JSON.stringify({
          error: "NASA API Error",
          details: `HTTP ${response.status}: ${errorText}`,
          timestamp: new Date().toISOString(),
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const contentType = response.headers.get("content-type")
    console.log("Content-Type:", contentType)

    if (!contentType || !contentType.includes("application/json")) {
      const responseText = await response.text()
      console.error("Non-JSON response:", responseText.substring(0, 500))
      return new Response(
        JSON.stringify({
          error: "Invalid Response Format",
          details: "NASA API returned non-JSON response",
          responsePreview: responseText.substring(0, 200),
          timestamp: new Date().toISOString(),
        }),
        {
          status: 502,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const data = await response.json()

    // Crear metadata para compatibilidad con el hook existente
    const metadata = [
      { name: "pl_name" },
      { name: "hostname" },
      { name: "sy_dist" },
      { name: "pl_rade" },
      { name: "pl_masse" },
      { name: "pl_orbper" },
      { name: "pl_eqt" },
      { name: "disc_year" },
      { name: "discoverymethod" },
    ]

    // Transformar datos al formato que espera el hook
    const transformedData = data.map((planet: any) => [
      planet.pl_name || "Unknown",
      planet.hostname || "Unknown",
      planet.sy_dist || null,
      planet.pl_rade || null,
      planet.pl_masse || null,
      planet.pl_orbper || null,
      planet.pl_eqt || null,
      planet.disc_year || null,
      planet.discoverymethod || "Unknown",
    ])

    console.log("Transformed data length:", transformedData.length)

    return new Response(
      JSON.stringify({
        metadata: metadata,
        data: transformedData,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    )
  } catch (err: any) {
    console.error("API Error:", err)
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: err.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}