"use client"

import { useState, useEffect, useCallback } from "react"

export interface ProcessedExoplanet {
  name: string
  hostStar: string
  distance: string
  radius: string
  mass: string
  orbitalPeriod: string
  temperature: number | null
  discoveryYear: number | null
  discoveryMethod: string
  type: string
  habitability: "Potentially Habitable" | "Not Habitable"
  description: string
  sources: number // Number of sources/entries combined
}

export function useNasaExoplanets() {
  const [exoplanets, setExoplanets] = useState<ProcessedExoplanet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [currentSearch, setCurrentSearch] = useState<string>("")

  const BATCH_SIZE = 100

  const combineExoplanetData = useCallback((duplicates: any[]): any => {
    // Sort by completeness (more non-null values first)
    const sortedDuplicates = duplicates.sort((a, b) => {
      const aNonNull = a.filter((val: any) => val !== null && val !== undefined && val !== "").length
      const bNonNull = b.filter((val: any) => val !== null && val !== undefined && val !== "").length
      return bNonNull - aNonNull
    })

    const combined = [...sortedDuplicates[0]] // Start with the most complete entry

    // Combine data from all duplicates, preferring non-null values
    for (let i = 1; i < sortedDuplicates.length; i++) {
      const duplicate = sortedDuplicates[i]

      for (let j = 0; j < combined.length; j++) {
        // If current value is null/empty and duplicate has a value, use it
        if (
          (!combined[j] || combined[j] === "" || combined[j] === null) &&
          duplicate[j] &&
          duplicate[j] !== "" &&
          duplicate[j] !== null
        ) {
          combined[j] = duplicate[j]
        }

        // For discovery year, keep the earliest
        if (j === 7 && duplicate[j] && combined[j]) {
          // disc_year index
          combined[j] = Math.min(Number(combined[j]), Number(duplicate[j]))
        }
      }
    }

    // Combine discovery methods
    const methods = duplicates
      .map((d) => d[8]) // discoverymethod index
      .filter((method, index, arr) => method && arr.indexOf(method) === index)
      .join(", ")

    combined[8] = methods || combined[8]

    return combined
  }, [])

  const processExoplanetData = useCallback(
    (rawData: any[]): ProcessedExoplanet[] => {
      // Group by planet name to find duplicates
      const planetGroups = rawData.reduce((groups: { [key: string]: any[] }, planet) => {
        const planetName = planet[0] // pl_name
        if (!planetName) return groups

        if (!groups[planetName]) {
          groups[planetName] = []
        }
        groups[planetName].push(planet)
        return groups
      }, {})

      // Process each group (combine duplicates)
      const processedPlanets = Object.entries(planetGroups).map(([planetName, duplicates]) => {
        const combinedData = duplicates.length > 1 ? combineExoplanetData(duplicates) : duplicates[0]
        const [pl_name, hostname, sy_dist, pl_rade, pl_masse, pl_orbper, pl_eqt, disc_year, discoverymethod] =
          combinedData

        // Determine planet type based on radius and mass
        let type = "Unknown"
        const radius = Number.parseFloat(pl_rade)
        const mass = Number.parseFloat(pl_masse)

        if (!isNaN(radius)) {
          if (radius < 1.25) {
            type = "Terrestrial"
          } else if (radius < 2.0) {
            type = "Sub-Neptune"
          } else if (radius < 6.0) {
            type = "Neptune-like"
          } else {
            type = "Gas Giant"
          }
        } else if (!isNaN(mass)) {
          if (mass < 2.0) {
            type = "Terrestrial"
          } else if (mass < 10.0) {
            type = "Sub-Neptune"
          } else if (mass < 50.0) {
            type = "Neptune-like"
          } else {
            type = "Gas Giant"
          }
        }

        // Special cases for hot planets
        const temperature = Number.parseFloat(pl_eqt)
        if (!isNaN(temperature) && temperature > 1000) {
          if (type === "Gas Giant") {
            type = "Hot Jupiter"
          }
        }

        // Determine habitability (simplified)
        let habitability: "Potentially Habitable" | "Not Habitable" = "Not Habitable"
        if (!isNaN(temperature) && temperature >= 200 && temperature <= 350 && type === "Terrestrial") {
          habitability = "Potentially Habitable"
        }

        // Generate description with source info
        const sourceInfo = duplicates.length > 1 ? ` (Combined from ${duplicates.length} sources)` : ""
        const description = `${pl_name} is a ${type.toLowerCase()} exoplanet orbiting ${hostname}. ${
          habitability === "Potentially Habitable"
            ? "This world shows potential for habitability with temperatures that could support liquid water."
            : "This distant world represents one of the many diverse planetary systems in our galaxy."
        }${sourceInfo}`

        return {
          name: pl_name || "Unknown",
          hostStar: hostname || "Unknown",
          distance: sy_dist ? `${Number.parseFloat(sy_dist).toFixed(1)} ly` : "Unknown",
          radius: pl_rade ? `${Number.parseFloat(pl_rade).toFixed(2)} R⊕` : "Unknown",
          mass: pl_masse ? `${Number.parseFloat(pl_masse).toFixed(2)} M⊕` : "Unknown",
          orbitalPeriod: pl_orbper ? `${Number.parseFloat(pl_orbper).toFixed(1)} days` : "Unknown",
          temperature,
          discoveryYear: disc_year ? Number.parseInt(disc_year) : null,
          discoveryMethod: discoverymethod || "Unknown",
          type,
          habitability,
          description,
          sources: duplicates.length,
        }
      })

      // Sort by name for consistency
      return processedPlanets.sort((a, b) => a.name.localeCompare(b.name))
    },
    [combineExoplanetData],
  )

  const fetchExoplanets = useCallback(
    async (
      searchTerm = "",
      typeFilter = "All",
      habitabilityFilter = "All",
      sortBy = "name",
      currentOffset = 0,
      append = false,
    ) => {
      try {
        if (!append) {
          setLoading(true)
          setError(null)
        }

        const params = new URLSearchParams({
          limit: BATCH_SIZE.toString(),
          offset: currentOffset.toString(),
          searchTerm,
          typeFilter,
          habitabilityFilter,
          sortBy,
        })

        const response = await fetch(`/api/exoplanets?${params}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.details || data.error)
        }

        const processedData = processExoplanetData(data.data || [])

        if (append) {
          setExoplanets((prev) => {
            // Combine with existing data and remove duplicates
            const combined = [...prev, ...processedData]
            const uniquePlanets = combined.reduce((unique: ProcessedExoplanet[], planet) => {
              const existing = unique.find((p) => p.name === planet.name)
              if (!existing) {
                unique.push(planet)
              } else {
                // If we find a duplicate, keep the one with more sources
                if (planet.sources > existing.sources) {
                  const index = unique.indexOf(existing)
                  unique[index] = planet
                }
              }
              return unique
            }, [])

            return uniquePlanets.sort((a, b) => a.name.localeCompare(b.name))
          })
        } else {
          setExoplanets(processedData)
        }

        setTotalCount(data.totalCount)
        setHasMore(data.hasMore)
        setOffset(currentOffset + BATCH_SIZE)
      } catch (err: any) {
        console.error("Error fetching exoplanets:", err)
        setError(err.message || "Failed to fetch exoplanet data")
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    },
    [processExoplanetData],
  )

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchExoplanets(currentSearch, "All", "All", "name", offset, true)
    }
  }, [loading, hasMore, currentSearch, offset, fetchExoplanets])

  const searchGlobal = useCallback(
    (searchTerm: string, typeFilter = "All", habitabilityFilter = "All", sortBy = "name") => {
      setIsSearching(true)
      setCurrentSearch(searchTerm)
      setOffset(0)
      fetchExoplanets(searchTerm, typeFilter, habitabilityFilter, sortBy, 0, false)
    },
    [fetchExoplanets],
  )

  const refetch = useCallback(() => {
    setOffset(0)
    setCurrentSearch("")
    fetchExoplanets("", "All", "All", "name", 0, false)
  }, [fetchExoplanets])

  useEffect(() => {
    fetchExoplanets()
  }, [])

  return {
    exoplanets,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch,
    searchGlobal,
    isSearching,
  }
}
