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
  const [originalExoplanets, setOriginalExoplanets] = useState<ProcessedExoplanet[]>([])
  const [exoplanets, setExoplanets] = useState<ProcessedExoplanet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [currentSearch, setCurrentSearch] = useState<string>("")
  const [currentTypeFilter, setCurrentTypeFilter] = useState<string>("All")
  const [currentHabitabilityFilter, setCurrentHabitabilityFilter] = useState<string>("All")
  const [currentSortBy, setCurrentSortBy] = useState<string>("name")

  const BATCH_SIZE = 100

  const combineExoplanetData = useCallback((duplicates: any[]): any => {
    // Ordenar por completitud
    const sortedDuplicates = duplicates.sort((a, b) => {
      const aNonNull = a.filter((val: any) => val !== null && val !== undefined && val !== "" && val !== "NaN").length;
      const bNonNull = b.filter((val: any) => val !== null && val !== undefined && val !== "" && val !== "NaN").length;
      return bNonNull - aNonNull;
    });
    const combined = [...sortedDuplicates[0]];
    for (let i = 1; i < sortedDuplicates.length; i++) {
      const duplicate = sortedDuplicates[i];
      for (let j = 0; j < combined.length; j++) {
        if (
          (!combined[j] || combined[j] === "" || combined[j] === null || combined[j] === "NaN") &&
          duplicate[j] &&
          duplicate[j] !== "" &&
          duplicate[j] !== null &&
          duplicate[j] !== "NaN"
        ) {
          combined[j] = duplicate[j];
        }
        // Mantener el año más antiguo
        if (j === 7 && duplicate[j] && combined[j]) {
          combined[j] = Math.min(Number(combined[j]), Number(duplicate[j]));
        }
      }
    }
    // Métodos de descubrimiento combinados
    const methods = duplicates
      .map((d) => d[8])
      .filter((method, index, arr) => method && arr.indexOf(method) === index)
      .join(", ");
    combined[8] = methods || combined[8];
    return combined;
  }, []);

  const processExoplanetData = useCallback(
    (rawData: any[]): ProcessedExoplanet[] => {
      // Agrupar por nombre
      const planetGroups = rawData.reduce((groups: { [key: string]: any[] }, planet) => {
        const planetName = planet[0];
        if (!planetName) return groups;
        if (!groups[planetName]) {
          groups[planetName] = [];
        }
        groups[planetName].push(planet);
        return groups;
      }, {});

      // Physical classification and NaN handling
      const processedPlanets = Object.entries(planetGroups).map(([planetName, duplicates]) => {
        const combinedData = duplicates.length > 1 ? combineExoplanetData(duplicates) : duplicates[0];
        const [pl_name, hostname, sy_dist, pl_rade, pl_masse, pl_orbper, pl_eqt, disc_year, discoverymethod] = combinedData;

        // Utility for displaying numbers
        const safeNum = (val: any, decimals = 2, unit = "") => {
          const num = Number.parseFloat(val);
          return !val || isNaN(num) ? "Not available" : `${num.toFixed(decimals)}${unit}`;
        };

        // Improved physical classification
        let type = "Unknown";
        const radius = Number.parseFloat(pl_rade);
        const mass = Number.parseFloat(pl_masse);
        if (!isNaN(radius) && !isNaN(mass)) {
          if (radius < 1.5 && mass < 5) {
            type = "Terrestrial";
          } else if (radius < 2.0 && mass < 10) {
            type = "Super-Earth";
          } else if (radius < 4.0 && mass < 20) {
            type = "Mini-Neptune";
          } else if (radius < 6.0 && mass < 50) {
            type = "Neptune-like";
          } else if (radius >= 6.0 || mass >= 50) {
            type = "Gas Giant";
          }
        } else if (!isNaN(radius)) {
          if (radius < 1.5) {
            type = "Terrestrial";
          } else if (radius < 2.0) {
            type = "Super-Earth";
          } else if (radius < 4.0) {
            type = "Mini-Neptune";
          } else if (radius < 6.0) {
            type = "Neptune-like";
          } else {
            type = "Gas Giant";
          }
        } else if (!isNaN(mass)) {
          if (mass < 5) {
            type = "Terrestrial";
          } else if (mass < 10) {
            type = "Super-Earth";
          } else if (mass < 20) {
            type = "Mini-Neptune";
          } else if (mass < 50) {
            type = "Neptune-like";
          } else {
            type = "Gas Giant";
          }
        }

        // Hot Jupiter
        const temperature = Number.parseFloat(pl_eqt);
        if (!isNaN(temperature) && temperature > 1000 && type === "Gas Giant") {
          type = "Hot Jupiter";
        }

        // Habitability mejorada
        let habitability: "Potentially Habitable" | "Not Habitable" = "Not Habitable";
        if (
          (type === "Terrestrial" || type === "Super-Earth") &&
          (
            (!isNaN(temperature) && temperature >= 200 && temperature <= 350) ||
            temperature === null // Si no hay temperatura, pero el tipo es adecuado
          )
        ) {
          habitability = "Potentially Habitable";
        }

        // Description
        const sourceInfo = duplicates.length > 1 ? ` (Combined from ${duplicates.length} sources)` : "";
        const description = `${pl_name} is a ${type.toLowerCase()} exoplanet orbiting ${hostname}. ${
          habitability === "Potentially Habitable"
            ? "This world shows potential for habitability with temperatures that could support liquid water."
            : "This distant world represents the diversity of planetary systems in our galaxy."
        }${sourceInfo}`;

        // Distance in light years
        let distanceLy = "Not available";
        if (sy_dist && !isNaN(Number(sy_dist))) {
          const ly = Number.parseFloat(sy_dist) * 3.26156;
          distanceLy = `${ly.toFixed(1)} ly`;
        }

        return {
          name: pl_name || "Unknown",
          hostStar: hostname || "Unknown",
          distance: distanceLy,
          radius: safeNum(pl_rade, 2, " R⊕"),
          mass: safeNum(pl_masse, 2, " M⊕"),
          orbitalPeriod: safeNum(pl_orbper, 1, " days"),
          temperature: !isNaN(temperature) ? temperature : null,
          discoveryYear: disc_year && !isNaN(Number(disc_year)) ? Number.parseInt(disc_year) : null,
          discoveryMethod: discoverymethod || "Unknown",
          type,
          habitability,
          description,
          sources: duplicates.length,
        };
      });

      return processedPlanets;
    },
    [combineExoplanetData],
  );

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
          setLoading(true);
          setError(null);
        }
        const params = new URLSearchParams({
          limit: BATCH_SIZE.toString(),
          offset: currentOffset.toString(),
          searchTerm,
        });
        const response = await fetch(`/api/exoplanets?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.details || data.error);
        }
        let processedData = processExoplanetData(data.data || []);
        if (append) {
          setOriginalExoplanets((prev) => {
            const combined = [...prev, ...processedData];
            const uniquePlanets = combined.reduce((unique: ProcessedExoplanet[], planet) => {
              const existing = unique.find((p) => p.name === planet.name);
              if (!existing) {
                unique.push(planet);
              } else {
                if (planet.sources > existing.sources) {
                  const index = unique.indexOf(existing);
                  unique[index] = planet;
                }
              }
              return unique;
            }, []);
            return uniquePlanets;
          });
        } else {
          setOriginalExoplanets(processedData);
        }
        setTotalCount(data.totalCount);
        setHasMore(data.hasMore);
        setOffset(currentOffset + BATCH_SIZE);
      } catch (err: any) {
        console.error("Error fetching exoplanets:", err);
        setError(err.message || "No se pudo obtener datos de exoplanetas");
      } finally {
        setLoading(false);
        setIsSearching(false);
      }
    },
    [processExoplanetData],
  );

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchExoplanets(currentSearch, "All", "All", "name", offset, true)
    }
  }, [loading, hasMore, currentSearch, offset, fetchExoplanets])

  const searchGlobal = useCallback(
    (searchTerm: string) => {
      setIsSearching(true)
      setCurrentSearch(searchTerm)
      setOffset(0)
      fetchExoplanets(searchTerm, "All", "All", "name", 0, false)
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

  // Efecto para filtrar y ordenar en frontend
  useEffect(() => {
    let filtered = [...originalExoplanets];
    if (currentTypeFilter !== "All") {
      filtered = filtered.filter((p) => p.type === currentTypeFilter);
    }
    if (currentHabitabilityFilter !== "All") {
      filtered = filtered.filter((p) =>
        currentHabitabilityFilter === "Potentially Habitable"
          ? p.habitability === "Potentially Habitable"
          : p.habitability === "Not Habitable"
      );
    }
    if (currentSortBy === "name") {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (currentSortBy === "distance") {
      filtered = filtered.sort((a, b) => {
        const da = parseFloat((a.distance || "").replace(/[^\d\.]/g, ""));
        const db = parseFloat((b.distance || "").replace(/[^\d\.]/g, ""));
        if (isNaN(da)) return 1;
        if (isNaN(db)) return -1;
        return da - db;
      });
    } else if (currentSortBy === "year") {
      filtered = filtered.sort((a, b) => {
        if (!a.discoveryYear) return 1;
        if (!b.discoveryYear) return -1;
        return b.discoveryYear - a.discoveryYear;
      });
    } else if (currentSortBy === "habitability") {
      filtered = filtered.sort((a, b) => {
        if (a.habitability === b.habitability) return 0;
        if (a.habitability === "Potentially Habitable") return -1;
        return 1;
      });
    }
    setExoplanets(filtered);
  }, [originalExoplanets, currentTypeFilter, currentHabitabilityFilter, currentSortBy]);

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
    setCurrentTypeFilter,
    setCurrentHabitabilityFilter,
    setCurrentSortBy,
    currentTypeFilter,
    currentHabitabilityFilter,
    currentSortBy,
  }
}
 