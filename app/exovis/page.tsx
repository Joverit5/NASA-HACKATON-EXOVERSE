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

export default function ExovizCatalog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

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
    offset: ["start start", "end start"],
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
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
        if (value === "") {
          refetch()
        }
      }
    },
    [exoplanets, searchGlobal, refetch],
  )

  // Handle filter changes
  // Los filtros y el orden se aplican solo en el frontend usando los setters del hook

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const planetTypes = useMemo(() => ["All", "Terrestrial", "Sub-Neptune", "Neptune-like", "Gas Giant", "Hot Jupiter"], []);
  const habitabilityOptions = useMemo(() => ["All", "Potentially Habitable", "Not Habitable"], []);
  const habitablePlanets = useMemo(() => exoplanets.filter((p) => p.habitability === "Potentially Habitable").length, [exoplanets]);
  const totalSources = useMemo(() => exoplanets.reduce((sum, planet) => sum + planet.sources, 0), [exoplanets]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent" />
        <CoverParticles />
      </div>

      {/* Navigation */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10"
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
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
              EXOVIS
            </h1>
            <p className="text-xl md:text-2xl text-white/60 font-light max-w-3xl mx-auto mb-12 leading-relaxed">

            </p>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mx-auto mb-5 max-w-2xl">
              Explore ALL exoplanets from NASA's archive. Search through{" "}
              {totalCount?.toLocaleString() || "thousands of"} confirmed exoplanets
            </p>
            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <motion.div
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Globe className="w-8 h-8 mx-auto mb-4 text-white" />
                <div className="text-3xl font-light mb-2">{exoplanets.length.toLocaleString()}</div>
                <div className="text-white/60">Unique Exoplanets</div>
                {totalCount && <div className="text-xs text-white/40 mt-1">of {totalCount.toLocaleString()} total</div>}
              </motion.div>
              <motion.div
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Telescope className="w-8 h-8 mx-auto mb-4 text-white" />
                <div className="text-3xl font-light mb-2">
                  {exoplanets.length > 0 ? new Set(exoplanets.map((p) => p.hostStar)).size.toLocaleString() : 0}
                </div>
                <div className="text-white/60">Star Systems</div>
              </motion.div>
              <motion.div
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Orbit className="w-8 h-8 mx-auto mb-4 text-white" />
                <div className="text-3xl font-light mb-2">{habitablePlanets.toLocaleString()}</div>
                <div className="text-white/60">Potentially Habitable</div>
              </motion.div>
              <motion.div
                className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                transition={{ duration: 0.3 }}
              >
                <Database className="w-8 h-8 mx-auto mb-4 text-white" />
                <div className="text-3xl font-light mb-2">{totalSources.toLocaleString()}</div>
                <div className="text-white/60">Sources Combined</div>
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
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Search with Suggestions */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  {isSearching && (
                    <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5 animate-spin" />
                  )}
                  <Input
                    placeholder="Search ANY exoplanet or host star..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 rounded-xl"
                  />

                  {/* Search Suggestions */}
                  {showSuggestions && searchSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden z-50">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors border-b border-white/10 last:border-b-0"
                          onClick={() => {
                            setSearchTerm(suggestion)
                            setShowSuggestions(false)
                            searchGlobal(suggestion)
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-white/40" />
                            <span>{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <select
                    value={currentTypeFilter}
                    onChange={(e) => setCurrentTypeFilter(e.target.value)}
                    className="pl-12 pr-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl h-12 w-full appearance-none cursor-pointer"
                  >
                    {planetTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-900 text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
                </div>

                {/* Habitability Filter */}
                <div className="relative">
                  <select
                    value={currentHabitabilityFilter}
                    onChange={(e) => setCurrentHabitabilityFilter(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 text-white rounded-xl h-12 w-full appearance-none cursor-pointer"
                  >
                    {habitabilityOptions.map((option) => (
                      <option key={option} value={option} className="bg-gray-900 text-white">
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
                <span className="text-white/60 text-sm">Sort by:</span>
                {[
                  { value: "name", label: "Name" },
                  { value: "distance", label: "Distance" },
                  { value: "year", label: "Discovery Year" },
                  { value: "habitability", label: "Habitability" },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={currentSortBy === option.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentSortBy(option.value)}
                    className={`text-xs ${
                      currentSortBy === option.value
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              {/* Results Info */}
              <div className="mt-4 text-center text-white/60">
                {searchTerm ? (
                  <span>
                    Search results for "{searchTerm}" • {exoplanets.length.toLocaleString()} found
                  </span>
                ) : (
                  <span>
                    Showing {exoplanets.length.toLocaleString()} unique exoplanets
                    {hasMore && " • Scroll for more"}
                  </span>
                )}
                <div className="text-xs text-white/40 mt-1">
                  Duplicates automatically combined • {totalSources.toLocaleString()} total sources processed
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
                className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full mb-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
              <motion.p
                className="text-white/60 text-lg"
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
              <div className="w-16 h-16 text-red-400 mb-6 flex items-center justify-center">
                <Info className="w-full h-full" />
              </div>
              <h3 className="text-2xl font-light text-white mb-4">Connection Error</h3>
              <p className="text-white/60 mb-8 max-w-md">{error}</p>
              <Button
                onClick={refetch}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                  <Loader2 className="w-8 h-8 animate-spin text-white/60 mr-3" />
                  <span className="text-white/60">Loading and combining more exoplanets...</span>
                </div>
              )}

              {/* End of Results */}
              {!hasMore && !loading && (
                <div className="text-center py-12">
                  <p className="text-white/60">
                    {searchTerm
                      ? `End of search results for "${searchTerm}"`
                      : "You've reached the end of the exoplanet catalog"}
                  </p>
                  <p className="text-white/40 mt-2">
                    Total: {exoplanets.length.toLocaleString()} unique exoplanets from {totalSources.toLocaleString()}{" "}
                    sources
                  </p>
                </div>
              )}
            </>
          )}

          {!loading && !error && exoplanets.length === 0 && (
            <div className="text-center py-20">
              <p className="text-white/60 text-xl">No exoplanets found matching your criteria.</p>
              <p className="text-white/40 mt-2">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-20 backdrop-blur-xl bg-white/5">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <h3 className="text-2xl font-light mb-4">EXOVERSE</h3>
              <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                Real-time exoplanet data powered by NASA's Exoplanet Archive TAP API.
              </p>
              <div className="flex justify-center space-x-8 text-sm text-white/40">
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
          className="fixed bottom-8 right-8 z-50 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
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
    const isHabitable = habitability === "Potentially Habitable"

    let colors = {
      primary: isHabitable ? "#4A90E2" : "#8B4513",
      secondary: isHabitable ? "#87CEEB" : "#A0522D",
      glow: isHabitable ? "#00FF00" : "#FF6B6B",
    }

    switch (type) {
      case "Gas Giant":
        colors = { primary: "#FFA500", secondary: "#FFD700", glow: "#FF8C00" }
        break
      case "Hot Jupiter":
        colors = { primary: "#FF4500", secondary: "#FF6347", glow: "#FF0000" }
        break
      case "Neptune-like":
        colors = { primary: "#4169E1", secondary: "#6495ED", glow: "#0000FF" }
        break
      case "Sub-Neptune":
        colors = { primary: "#6495ED", secondary: "#87CEEB", glow: "#4169E1" }
        break
    }

    return colors
  }

  const colors = getPlanetVisualization(planet.type, planet.habitability)

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: (index % 12) * 0.05 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -5 }}
    >
      <Card className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden group h-full">
        <CardHeader className="relative pb-4">
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Badge variant="secondary" className="bg-white/10 text-white border-white/20 backdrop-blur-sm text-xs">
              {planet.type}
            </Badge>
            <Badge
              variant={planet.habitability === "Potentially Habitable" ? "default" : "secondary"}
              className={`text-xs ${
                planet.habitability === "Potentially Habitable"
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}
            >
              {planet.habitability === "Potentially Habitable" ? "🌍" : "🔥"}
            </Badge>
            {planet.sources > 1 && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {planet.sources} sources
              </Badge>
            )}
          </div>

          <CardTitle className="text-lg font-light text-white mb-2 pr-20 line-clamp-2">{planet.name}</CardTitle>
          <div className="text-center text-white/60 text-sm flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {planet.discoveryYear || "Unknown"}
          </div>
        </CardHeader>

        <CardContent className="flex flex-col items-center px-4 pb-4">
          {/* Planet Visualization */}
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full relative"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, ${colors.primary})`,
                boxShadow: `0 0 20px ${colors.glow}40`,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            >
              {/* Rings for gas giants */}
              {(planet.type === "Gas Giant" || planet.type === "Neptune-like") && (
                <div
                  className="absolute inset-0 rounded-full border-2 opacity-60"
                  style={{
                    borderColor: colors.secondary,
                    transform: "scale(1.5) rotateX(75deg)",
                  }}
                />
              )}

              {/* Atmosphere glow for habitable planets */}
              {planet.habitability === "Potentially Habitable" && (
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, transparent 60%, ${colors.glow}20 100%)`,
                    transform: "scale(1.2)",
                  }}
                />
              )}
            </motion.div>
          </div>

          {/* Basic Info */}
          <div className="space-y-2 w-full text-sm">
            <div className="flex items-center justify-between">
              <span className="text-white/60 flex items-center gap-1">
                <Star className="w-3 h-3" />
                Distance:
              </span>
              <span className="text-white text-right">{planet.distance}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/60">Host Star:</span>
              <span className="text-white text-right line-clamp-1">{planet.hostStar}</span>
            </div>

            {/* Expandable Details */}
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 border-t border-white/10 pt-2 mt-2"
              >
                {planet.radius !== "Unknown" && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 flex items-center gap-1">
                      <Ruler className="w-3 h-3" />
                      Radius:
                    </span>
                    <span className="text-white text-right">{planet.radius}</span>
                  </div>
                )}

                {planet.mass !== "Unknown" && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 flex items-center gap-1">
                      <Weight className="w-3 h-3" />
                      Mass:
                    </span>
                    <span className="text-white text-right">{planet.mass}</span>
                  </div>
                )}

                {planet.orbitalPeriod !== "Unknown" && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60">Orbital Period:</span>
                    <span className="text-white text-right">{planet.orbitalPeriod}</span>
                  </div>
                )}

                {planet.temperature && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      Temperature:
                    </span>
                    <span className="text-white text-right">{planet.temperature.toFixed(0)}K</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-white/60">Method:</span>
                  <span className="text-white text-right text-xs line-clamp-1">{planet.discoveryMethod}</span>
                </div>

                {planet.sources > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 flex items-center gap-1">
                      <Database className="w-3 h-3" />
                      Sources:
                    </span>
                    <span className="text-white text-right">{planet.sources} combined</span>
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
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 rounded-lg text-xs"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Less" : "More"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 rounded-lg px-3"
              asChild
            >
              <a
                href={`https://eyes.nasa.gov/apps/exo/#/planet/${planet.name.replace(/\s+/g, "_")}`}
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
