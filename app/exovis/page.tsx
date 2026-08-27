"use client"

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import CoverParticles from "@/src/components/ui/star_particles"
import Navbar from "@/src/components/ui/navBar"
import {
  Search,
  Filter,
  Globe,
  Telescope,
  Orbit,
  Star,
  Calendar,
  Thermometer,
  Ruler,
  Weight,
  Info,
  ChevronDown,
  ArrowUp,
  Loader2,
  Database,
} from "lucide-react"
import { useNasaExoplanets } from "@/src/hooks/usenasaexoplanets"
import { TransitCurve } from "@/src/components/transit-curve"
import { depthPpm } from "@/src/lib/transit"

export default function ExovizCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const {
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
  } = useNasaExoplanets()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start","end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%","30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.95])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const ySpring = useSpring(y, springConfig)

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return

    const scrollTop = window.pageYOffset
    const windowHeight = window.innerHeight
    const docHeight = document.documentElement.offsetHeight

    if (scrollTop + windowHeight >= docHeight - 1000) {
      loadMore()
    }

    setShowScrollTop(scrollTop > 1000)
  }, [loading, hasMore, loadMore])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  // Search with debouncing and suggestions
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value)

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      if (value.length >= 2) {
        // Show suggestions for partial matches
        const suggestions = exoplanets
          .filter(
            (planet) =>
              planet.name.toLowerCase().includes(value.toLowerCase()) ||
              planet.hostStar.toLowerCase().includes(value.toLowerCase()),
          )
          .slice(0, 5)
          .map((planet) => planet.name)

        setSearchSuggestions(suggestions)
        setShowSuggestions(true)

        // Debounced global search
        searchTimeoutRef.current = setTimeout(() => {
          searchGlobal(value)
        }, 500)
      } else {
        setShowSuggestions(false)
        if (value ==="") {
          // Clearing the box clears the search only; the user's filters stand.
          searchGlobal("")
        }
      }
    },
    [exoplanets, searchGlobal],
  )

  // Handle filter changes
  // Los filtros y el orden se aplican solo en el frontend usando los setters del hook

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior:"smooth" })
  }

  const planetTypes = useMemo(() => ["All","Terrestrial","Super-Earth","Mini-Neptune","Neptune-like","Gas Giant","Hot Jupiter"], []);
  const habitabilityOptions = useMemo(() => ["All","Potentially Habitable","Not Habitable"], []);
  const habitablePlanets = useMemo(() => exoplanets.filter((p) => p.habitability ==="Potentially Habitable").length, [exoplanets]);
  const totalSources = useMemo(() => exoplanets.reduce((sum, planet) => sum + planet.sources, 0), [exoplanets]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-ink relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-void" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent" />
        <CoverParticles />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 bg-void/90 border-b border-rule"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
      <Navbar />
      </motion.nav>

      <div className="relative z-10 pt-24">
        {/* Hero Section */}
        <motion.section className="container mx-auto px-6 py-20 text-center" style={{ opacity, scale, y: ySpring }}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 text-ink leading-tight">
              EXOVIS
            </h1>
            <p className="text-xl md:text-2xl text-ink-dim font-light max-w-3xl mx-auto mb-12 leading-relaxed">

            </p>
            <p className="text-xl md:text-2xl text-ink-dim leading-relaxed mx-auto mb-5 max-w-2xl">
              Explore ALL exoplanets from NASA's archive. Search through{" "}
              {totalCount?.toLocaleString("en-US") ||"thousands of"} confirmed exoplanets
            </p>
            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <motion.div
                className="bg-surface border border-rule p-6"
                whileHover={{ scale: 1.05, backgroundColor:"rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Globe className="w-8 h-8 mx-auto mb-4 text-ink" />
                <div className="text-3xl font-light mb-2">{exoplanets.length.toLocaleString("en-US")}</div>
                <div className="text-ink-dim">Unique Exoplanets</div>
                {totalCount && <div className="text-xs text-ink-faint mt-1">of {totalCount.toLocaleString("en-US")} total</div>}
              </motion.div>
              <motion.div
                className="bg-surface border border-rule p-6"
                whileHover={{ scale: 1.05, backgroundColor:"rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Telescope className="w-8 h-8 mx-auto mb-4 text-ink" />
                <div className="text-3xl font-light mb-2">
                  {exoplanets.length > 0 ? new Set(exoplanets.map((p) => p.hostStar)).size.toLocaleString("en-US") : 0}
                </div>
                <div className="text-ink-dim">Star Systems</div>
              </motion.div>
              <motion.div
                className="bg-surface border border-rule p-6"
                whileHover={{ scale: 1.05, backgroundColor:"rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Orbit className="w-8 h-8 mx-auto mb-4 text-ink" />
                <div className="text-3xl font-light mb-2">{habitablePlanets.toLocaleString("en-US")}</div>
                <div className="text-ink-dim">Potentially Habitable</div>
              </motion.div>
              <motion.div
                className="bg-surface border border-rule p-6"
                whileHover={{ scale: 1.05, backgroundColor:"rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Database className="w-8 h-8 mx-auto mb-4 text-ink" />
                <div className="text-3xl font-light mb-2">{totalSources.toLocaleString("en-US")}</div>
                <div className="text-ink-dim">Sources Combined</div>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>

        {/* Search and Filter Section */}
        <motion.section
          className="container mx-auto px-6 py-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-surface border border-rule p-8 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search with Suggestions */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-faint w-5 h-5" />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ink-faint w-5 h-5 animate-spin" />
                  )}
                  <Input
                    placeholder="Search ANY exoplanet or host star..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 pr-12 bg-raised border-rule text-ink placeholder:text-ink-faint h-12"
                  />

                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-rule overflow-hidden z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-3 text-left text-ink hover:bg-raised transition-colors border-b border-rule last:border-b-0"
                          onClick={() => {
                            setSearchTerm(suggestion)
                            setShowSuggestions(false)
                            searchGlobal(suggestion)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-ink-faint" />
                            <span>{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-ink-faint w-5 h-5" />
                  <select
                    value={currentTypeFilter}
                    onChange={(e) => setCurrentTypeFilter(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-raised border border-rule text-ink h-12 w-full appearance-none cursor-pointer"
                  >
                    {planetTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-900 text-ink">
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-faint w-4 h-4 pointer-events-none" />
                </div>

                {/* Habitability Filter */}
                <div className="relative">
                  <select
                    value={currentHabitabilityFilter}
                    onChange={(e) => setCurrentHabitabilityFilter(e.target.value)}
                    className="px-4 py-3 bg-raised border border-rule text-ink h-12 w-full appearance-none cursor-pointer"
                  >
                    {habitabilityOptions.map((option) => (
                      <option key={option} value={option} className="bg-gray-900 text-ink">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ink-faint w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-rule">
                <span className="text-ink-dim text-sm">Sort by:</span>
                {[
                  { value:"name", label:"Name" },
                  { value:"distance", label:"Distance" },
                  { value:"year", label:"Discovery Year" },
                  { value:"habitability", label:"Habitability" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={currentSortBy === option.value ?"default" :"ghost"}
                    size="sm"
                    onClick={() => setCurrentSortBy(option.value)}
                    className={`text-xs ${
                      currentSortBy === option.value
                        ?"bg-white text-black"
                        :"text-ink-dim hover:text-ink hover:bg-raised"
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Results Info */}
              <div className="mt-4 text-center text-ink-dim">
                {searchTerm ? (
                  <span>
                    Search results for"{searchTerm}" • {exoplanets.length.toLocaleString("en-US")} found
                  </span>
                ) : (
                  <span>
                    Showing {exoplanets.length.toLocaleString("en-US")} unique exoplanets
                    {hasMore &&" • Scroll for more"}
                  </span>
                )}
                <div className="text-xs text-ink-faint mt-1">
                  {totalSources.toLocaleString("en-US")} published references behind these planets
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Content Section */}
        <section className="container mx-auto px-6 py-12">
          {loading && exoplanets.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                className="w-16 h-16 border-4 border-rule border-t-white rounded-full mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease:"linear" }}
              />
              <motion.p
                className="text-ink-dim text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Loading and combining exoplanet data from NASA...
              </motion.p>
            </div>
          )}

          {error && (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 text-hostile mb-6 flex items-center justify-center">
                <Info className="w-full h-full" />
              </div>
              <h3 className="text-2xl font-light text-ink mb-4">Connection Error</h3>
              <p className="text-ink-dim mb-8 max-w-md">{error}</p>
              <Button
                onClick={refetch}
                variant="outline"
                className="bg-raised border-rule text-ink hover:bg-rule"
              >
                Try Again
              </Button>
            </motion.div>
          )}

          {!error && exoplanets.length > 0 && (
            <>
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, staggerChildren: 0.02 }}
                viewport={{ once: true }}
              >
                {exoplanets.map((planet, index) => (
                  <ExoplanetCard key={`${planet.name}-${index}`} planet={planet} index={index} />
                ))}
              </motion.div>

              {/* Loading More Indicator */}
              {loading && exoplanets.length > 0 && (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-ink-dim mr-3" />
                  <span className="text-ink-dim">Loading and combining more exoplanets...</span>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && !loading && (
                <div className="text-center py-12">
                  <p className="text-ink-dim">
                    {searchTerm
                      ? `End of search results for"${searchTerm}"`
                      :"You've reached the end of the exoplanet catalog"}
                  </p>
                  <p className="text-ink-faint mt-2">
                    Total: {exoplanets.length.toLocaleString("en-US")} exoplanets shown, from {totalSources.toLocaleString("en-US")}{" "}
                    sources
                  </p>
                </div>
              )}
            </>
          )}

          {!loading && !error && exoplanets.length === 0 && (
            <div className="text-center py-20">
              <p className="text-ink-dim text-xl">No exoplanets found matching your criteria.</p>
              <p className="text-ink-faint mt-2">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-rule mt-20 bg-surface">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-light mb-4">EXOVERSE</h3>
              <p className="text-ink-dim mb-8 max-w-2xl mx-auto">
                Real-time exoplanet data powered by NASA's Exoplanet Archive TAP API.
              </p>
              <div className="flex justify-center space-x-8 text-sm text-ink-faint">
                <span>NASA TAP API</span>
                <span>•</span>
                <span>© {new Date().getFullYear()} Exoverse</span>
                <span>•</span>
                <span>Exploring the cosmos</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 bg-raised border border-rule rounded-full text-ink hover:bg-rule transition-all duration-tick"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  )
}

// Exoplanet Card Component with source indicator
const ExoplanetCard = React.memo(function ExoplanetCard({ planet, index }: { planet: any; index: number }) {
  const [showDetails, setShowDetails] = useState(false)

  const getPlanetVisualization = (type: string, habitability: string) => {
    const isHabitable = habitability ==="Potentially Habitable"

    let colors = {
      primary: isHabitable ?"#4A90E2" :"#8B4513",
      secondary: isHabitable ?"#87CEEB" :"#A0522D",
      glow: isHabitable ?"#00FF00" :"#FF6B6B",
    }

    switch (type) {
      case"Gas Giant":
        colors = { primary:"#FFA500", secondary:"#FFD700", glow:"#FF8C00" }
        break
      case"Hot Jupiter":
        colors = { primary:"#FF4500", secondary:"#FF6347", glow:"#FF0000" }
        break
      case"Neptune-like":
        colors = { primary:"#4169E1", secondary:"#6495ED", glow:"#0000FF" }
        break
      case"Sub-Neptune":
        colors = { primary:"#6495ED", secondary:"#87CEEB", glow:"#4169E1" }
        break
    }

    return colors
  }

  const colors = getPlanetVisualization(planet.type, planet.habitability)

  return (
    <motion.div
      className="catalog-card"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 12) * 0.05 }}
      viewport={{ once: true, margin:"-100px" }}
      whileHover={{ y: -5 }}
    >
      <Card className="relative bg-surface border border-rule overflow-hidden group h-full">
        <CardHeader className="relative pb-4">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Badge variant="secondary" className="bg-raised text-ink border-rule text-xs">
              {planet.type}
            </Badge>
            <Badge
              variant={planet.habitability ==="Potentially Habitable" ?"default" :"secondary"}
              className={`text-xs ${
                planet.habitability ==="Potentially Habitable"
                  ?"bg-mint/15 text-mint border-mint-deep"
                  :"bg-hostile/15 text-hostile border-hostile/40"
              }`}
            >
              {planet.habitability ==="Potentially Habitable" ?"🌍" :"🔥"}
            </Badge>
            {planet.sources > 1 && (
              <Badge variant="outline" className="bg-source/15 text-source border-source/40 text-xs">
                {planet.sources} sources
              </Badge>
            )}
          </div>

          <CardTitle className="text-lg font-light text-ink mb-2 pr-20 line-clamp-2">{planet.name}</CardTitle>
          <div className="text-center text-ink-dim text-sm flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {planet.discoveryYear ||"Unknown"}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center px-4 pb-4">
          {/* The catalog is a field of curves: each card carries the real transit
              signature of its own system. A planet with no measured depth shows
              no curve rather than a fabricated one. */}
          {planet.transitDepth !== null ? (
            <div className="w-full mb-3">
              <TransitCurve planet={planet} compact still />
              <p className="font-mono text-xs text-mint mt-1 text-center tabular-nums">
                {depthPpm(planet.transitDepth)}
              </p>
            </div>
          ) : (
            <p className="font-mono text-xs text-ink-faint mb-3 text-center">No transit measured</p>
          )}

          {/* Basic Info */}
          <div className="space-y-2 w-full text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-dim flex items-center gap-1">
                <Star className="w-3 h-3" />
                Distance:
              </span>
              <span className="text-ink text-right">{planet.distance}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-ink-dim">Host Star:</span>
              <span className="text-ink text-right line-clamp-1">{planet.hostStar}</span>
            </div>

            {/* Expandable Details */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height:"auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 border-t border-rule pt-2 mt-2"
              >
                {planet.radius !=="Unknown" && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-dim flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      Radius:
                    </span>
                    <span className="text-ink text-right">{planet.radius}</span>
                  </div>
                )}

                {planet.mass !=="Unknown" && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-dim flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      Mass:
                    </span>
                    <span className="text-ink text-right">{planet.mass}</span>
                  </div>
                )}

                {planet.orbitalPeriod !=="Unknown" && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-dim">Orbital Period:</span>
                    <span className="text-ink text-right">{planet.orbitalPeriod}</span>
                  </div>
                )}

                {planet.temperature && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-dim flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Temperature:
                    </span>
                    <span className="text-ink text-right">{planet.temperature.toFixed(0)}K</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-ink-dim">Method:</span>
                  <span className="text-ink text-right text-xs line-clamp-1">{planet.discoveryMethod}</span>
                </div>

                {planet.sources > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-ink-dim flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Sources:
                    </span>
                    <span className="text-ink text-right">{planet.sources} combined</span>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4 w-full">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-raised border-rule text-ink hover:bg-rule hover:border-rule-strong transition-all duration-tick text-xs"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ?"Less" :"More"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-raised border-rule text-ink hover:bg-rule hover:border-rule-strong transition-all duration-tick px-3"
              asChild
            >
              <a
                href={`https://eyes.nasa.gov/apps/exo/#/planet/${planet.name.replace(/\s+/g,"_")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Info className="h-3 w-3" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
});
