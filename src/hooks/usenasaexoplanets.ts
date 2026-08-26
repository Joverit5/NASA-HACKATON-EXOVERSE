"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import type { ProcessedExoplanet } from "@/src/lib/exoplanetCatalog"

export type { ProcessedExoplanet }

/**
 * ExoVis catalog state.
 *
 * Search, filtering, sorting and paging are all resolved server-side against the
 * full classified catalog (see src/lib/exoplanetCatalog.ts). Previously the hook
 * merged duplicate rows and sorted client-side over whatever happened to be loaded,
 * which meant a filter only ever applied to the first page — and `loadMore` and
 * `searchGlobal` passed hard-coded "All"/"All"/"name", so the user's filter and sort
 * never reached the server at all.
 */

const BATCH_SIZE = 60

interface CatalogResponse {
  planets: ProcessedExoplanet[]
  total: number
  offset: number
  limit: number
  hasMore: boolean
  catalogSize: number
  error?: string
  details?: string
}

export function useNasaExoplanets() {
  const [exoplanets, setExoplanets] = useState<ProcessedExoplanet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const [currentSearch, setCurrentSearch] = useState("")
  const [currentTypeFilter, setCurrentTypeFilter] = useState("All")
  const [currentHabitabilityFilter, setCurrentHabitabilityFilter] = useState("All")
  const [currentSortBy, setCurrentSortBy] = useState("name")

  /** Guards against a slow early response overwriting a newer query's results. */
  const requestId = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const fetchPage = useCallback(
    async (
      searchTerm: string,
      typeFilter: string,
      habitabilityFilter: string,
      sortBy: string,
      currentOffset: number,
      append: boolean,
    ) => {
      const id = ++requestId.current
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      if (!append) setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          searchTerm,
          typeFilter,
          habitabilityFilter,
          sortBy,
          offset: String(currentOffset),
          limit: String(BATCH_SIZE),
        })

        const res = await fetch(`/api/exoplanets?${params}`, { signal: controller.signal })
        const data: CatalogResponse = await res.json()

        if (!res.ok || data.error) {
          throw new Error(data.details || data.error || `HTTP ${res.status}`)
        }
        // A newer query has been issued since this one started.
        if (id !== requestId.current) return

        setExoplanets((prev) => (append ? [...prev, ...data.planets] : data.planets))
        setHasMore(data.hasMore)
        setOffset(currentOffset + data.planets.length)
        setMatchCount(data.total)
        setTotalCount(data.catalogSize)
      } catch (err: any) {
        if (err?.name === "AbortError" || id !== requestId.current) return
        setError(err?.message || "Could not reach the exoplanet catalog.")
        if (!append) {
          setExoplanets([])
          setHasMore(false)
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false)
          setIsSearching(false)
        }
      }
    },
    [],
  )

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return
    fetchPage(currentSearch, currentTypeFilter, currentHabitabilityFilter, currentSortBy, offset, true)
  }, [loading, hasMore, currentSearch, currentTypeFilter, currentHabitabilityFilter, currentSortBy, offset, fetchPage])

  const searchGlobal = useCallback(
    (searchTerm: string) => {
      setIsSearching(true)
      setCurrentSearch(searchTerm)
    },
    [],
  )

  const refetch = useCallback(() => {
    setCurrentSearch("")
    setCurrentTypeFilter("All")
    setCurrentHabitabilityFilter("All")
    setCurrentSortBy("name")
    fetchPage("", "All", "All", "name", 0, false)
  }, [fetchPage])

  // Any change to the query resets to the first page and refetches. This is the one
  // place a query change is handled, so filters and sort can no longer disagree with
  // what was actually requested.
  useEffect(() => {
    setOffset(0)
    fetchPage(currentSearch, currentTypeFilter, currentHabitabilityFilter, currentSortBy, 0, false)
  }, [currentSearch, currentTypeFilter, currentHabitabilityFilter, currentSortBy, fetchPage])

  useEffect(() => () => abortRef.current?.abort(), [])

  return {
    exoplanets,
    loading,
    error,
    hasMore,
    /** Size of the whole archive catalog. */
    totalCount,
    /** How many planets match the current query. */
    matchCount,
    loadMore,
    refetch,
    searchGlobal,
    isSearching,
    setCurrentTypeFilter,
    setCurrentHabitabilityFilter,
    setCurrentSortBy,
    currentTypeFilter,
    currentHabitabilityFilter,
    currentSortBy,
  }
}
