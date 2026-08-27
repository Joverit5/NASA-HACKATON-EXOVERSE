"use client"

import React, { useState, useMemo, useCallback, useRef, Suspense, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars, PerformanceMonitor } from "@react-three/drei"
import * as THREE from "three"
import { Button } from "@/src/components/ui/button"
import { Slider } from "@/src/components/ui/slider"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible"
import { ChevronUp, ChevronLeft, Trophy, Sun, SatelliteIcon, CircleDot, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import { achievementsService } from "@/src/lib/achievementsService"
import {
  derivePlanet,
  estimateMass,
  sliderToAu,
  starSpec,
  blackbodyRgb,
  starLightIntensity,
  type DerivedPlanet,
} from "@/src/lib/planetPhysics"
import {
  createPlanetMaterial,
  createAtmosphereMaterial,
  createStarMaterial,
  createRingMaterial,
  rocheLimitRadii,
  type PlanetSurface,
} from "@/src/components/exocreator-materials"
import { PlanetReadout } from "@/src/components/planet-readout"

const contrastColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98FB98",
  "#DDA0DD",
  "#F0E68C",
  "#FF69B4",
  "#20B2AA",
  "#B0E0E6",
]

interface SatelliteProps {
  radius: number
  orbitRadius: number
  speed: number
}

interface PlanetControlsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  planetProps: {
    radius: number
    type: string
    color: string
    satelliteCount: number
    ringCount: number
    starType: string
    starDistance: number
    textureType: string
  }
  onPropChange: (prop: string, value: any) => void
  onGeneratePlanetInfo: () => void
  onShowEducationalInfo: () => void
  isVisible?: boolean
}

const Satellite: React.FC<SatelliteProps> = React.memo(({ radius, orbitRadius, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null!)

  // Moons are captured or accreted rock, not confetti. The old scene picked one of
  // ten saturated colours at random, which under colour-as-meaning said nothing.
  // A small tint variation stands in for composition; the shading does the rest.
  const material = useMemo(() => {
    const grey = 0.38 + (orbitRadius % 0.7) * 0.18
    const tint = new THREE.Color(grey, grey * 0.97, grey * 0.92)
    return createPlanetMaterial("rock", "#" + tint.getHexString())
  }, [orbitRadius])

  useEffect(() => () => material.dispose(), [material])

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed
    if (!meshRef.current) return
    meshRef.current.position.x = Math.cos(angle) * orbitRadius
    meshRef.current.position.z = Math.sin(angle) * orbitRadius
    meshRef.current.position.y = Math.sin(angle * 0.5) * orbitRadius * 0.2
    meshRef.current.rotation.y = angle
  })

  return (
    <mesh ref={meshRef} castShadow material={material}>
      <sphereGeometry args={[radius, 32, 32]} />
    </mesh>
  )
})

Satellite.displayName = "Satellite"

interface PlanetProps {
  radius: number
  color: string
  satelliteCount: number
  ringCount: number
  textureType: string
  /** Host star effective temperature, which sets the atmosphere's scattered colour. */
  starTeff: number
}

const Planet: React.FC<PlanetProps> = React.memo(
  ({ radius, color, satelliteCount, ringCount, textureType, starTeff }) => {
    const meshRef = useRef<THREE.Mesh>(null!)

    const surface: PlanetSurface = textureType === "water" ? "water" : textureType === "gas" ? "gas" : "rock"

    // Node materials are rebuilt only when what they depend on changes; the shader
    // itself evaluates per-pixel on the GPU, so surface detail no longer costs a
    // CPU texture upload on every parameter change.
    const surfaceMaterial = useMemo(() => createPlanetMaterial(surface, color), [surface, color])
    const atmosphereMaterial = useMemo(() => createAtmosphereMaterial(starTeff, surface), [starTeff, surface])

    // Ring extent is derived, not decorative: material inside the Roche limit cannot
    // accrete into a moon, which is why Saturn has rings and Earth does not.
    const density = useMemo(() => {
      const m = estimateMass(radius).value
      return m === null ? null : 5.514 * (m / Math.pow(radius, 3))
    }, [radius])
    const rocheRadii = useMemo(() => rocheLimitRadii(density), [density])

    const ringBands = useMemo(() => {
      const inner = radius * 1.35
      const outer = radius * rocheRadii
      const span = Math.max(0.25, outer - inner)
      return Array.from({ length: ringCount }, (_, i) => {
        const t0 = i / ringCount
        const t1 = (i + 0.72) / ringCount
        return { inner: inner + span * t0, outer: inner + span * t1 }
      })
    }, [radius, ringCount, rocheRadii])

    const ringMaterial = useMemo(() => createRingMaterial(color), [color])

    useFrame((_, delta) => {
      // Delta-timed so rotation speed does not depend on frame rate.
      if (meshRef.current) meshRef.current.rotation.y += delta * 0.28
    })

    useEffect(() => {
      return () => {
        surfaceMaterial.dispose()
        atmosphereMaterial.dispose()
        ringMaterial.dispose()
      }
    }, [surfaceMaterial, atmosphereMaterial, ringMaterial])

    return (
      <group>
        <mesh ref={meshRef} castShadow receiveShadow material={surfaceMaterial}>
          <sphereGeometry args={[radius, 96, 96]} />
        </mesh>

        {/* The atmospheric shell, lit at the limb where it is optically thickest. */}
        <mesh material={atmosphereMaterial}>
          <sphereGeometry args={[radius * 1.045, 64, 64]} />
        </mesh>

        {Array.from({ length: satelliteCount }, (_, i) => (
          <Satellite key={i} radius={radius * 0.1} orbitRadius={radius + 1 + i * 0.5} speed={0.5 + i * 0.2} />
        ))}

        {ringBands.map((band, i) => (
          <mesh rotation={[Math.PI / 2, 0, 0]} key={i} material={ringMaterial}>
            <ringGeometry args={[band.inner, band.outer, 128]} />
          </mesh>
        ))}
      </group>
    )
  },
)

Planet.displayName = "Planet"

interface StarProps {
  teff: number
  intensity: number
  distance: number
  size: number
}

const Star: React.FC<StarProps> = React.memo(({ teff, intensity, distance, size }) => {
  const lightRef = useRef<THREE.PointLight>(null!)

  const starMaterial = useMemo(() => createStarMaterial(teff), [teff])
  const lightColor = useMemo(() => {
    const { r, g, b } = blackbodyRgb(teff)
    return new THREE.Color(r, g, b)
  }, [teff])

  useEffect(() => () => starMaterial.dispose(), [starMaterial])

  const position: [number, number, number] = [distance, 30, -100]

  return (
    <group>
      {/* The disc itself, limb-darkened and granulated in the shader. */}
      <mesh position={position} material={starMaterial}>
        <sphereGeometry args={[size, 64, 64]} />
      </mesh>

      {/* The light the planet is actually lit by, in the star's own colour. */}
      <pointLight ref={lightRef} position={position} color={lightColor} intensity={intensity} distance={0} decay={0} />
    </group>
  )
})

Star.displayName = "Star"

const educationalContent = {
  planetTypes: {
    rock: {
      title: "Rocky Exoplanets",
      description:
        "Terrestrial planets composed primarily of silicate rocks and metals. Similar to Earth, Mars, Venus, and Mercury. These planets have solid surfaces and may harbor conditions suitable for life.",
      examples: "Kepler-452b, Proxima Centauri b, TRAPPIST-1e",
    },
    gas: {
      title: "Gas Giant Exoplanets",
      description:
        "Massive planets composed mainly of hydrogen and helium. They lack solid surfaces and often have spectacular ring systems and numerous moons. Hot Jupiters orbit very close to their stars.",
      examples: "51 Pegasi b, HD 209458 b, WASP-12b",
    },
    water: {
      title: "Ocean World Exoplanets",
      description:
        "Hypothetical planets covered entirely by deep oceans. These water worlds could exist in the habitable zone and potentially support exotic forms of aquatic life beneath their surfaces.",
      examples: "GJ 1214 b (candidate), Kepler-22b (candidate)",
    },
  },
  starTypes: {
    redDwarf: {
      title: "Red Dwarf Stars",
      description:
        "Small, cool stars that burn slowly and can live for trillions of years. Most common type of star in the galaxy. Planets in habitable zones orbit very close to these dim stars.",
      temperature: "2,500 - 4,000 K",
      lifespan: "Trillions of years",
    },
    yellowDwarf: {
      title: "Yellow Dwarf Stars",
      description:
        "Medium-sized stars like our Sun. They provide stable energy output over billions of years, making them ideal for supporting life on orbiting planets.",
      temperature: "5,200 - 6,000 K",
      lifespan: "10 billion years",
    },
    giant: {
      title: "Giant Stars",
      description:
        "Large, luminous stars in later stages of stellar evolution. They emit tremendous amounts of energy but have shorter lifespans. Planets around giants face extreme radiation.",
      temperature: "3,000 - 5,000 K",
      lifespan: "Millions of years",
    },
  },
  discoveries: [
    "Over 5,500 exoplanets have been confirmed as of 2024",
    "The Kepler Space Telescope discovered over 2,600 exoplanets",
    "Some exoplanets orbit binary star systems (like Tatooine!)",
    "The closest exoplanet is Proxima Centauri b, 4.2 light-years away",
    "JWST is now studying exoplanet atmospheres for signs of life",
  ],
}

const ExoplanetCreator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("planet")
  const [dpr, setDpr] = useState(1.5)
  const [backend, setBackend] = useState<string | null>(null)
  const [planetProps, setPlanetProps] = useState({
    radius: 1,
    type: "rock",
    color: "#4ECDC4",
    satelliteCount: 1,
    ringCount: 0,
    starType: "yellowDwarf",
    starDistance: 50,
    textureType: "rock",
  })
  const [derived, setDerived] = useState<DerivedPlanet | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [currentAchievement, setCurrentAchievement] = useState<any | null>(null)
  const [showEducation, setShowEducation] = useState(false)
  const [educationContent, setEducationContent] = useState<any>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [creationCount, setCreationCount] = useState(0)
  const [achievements, setAchievements] = useState<any[]>([])

  useEffect(() => {
    achievementsService.initializeAchievements()
    setAchievements(achievementsService.getAllAchievements())
  }, [])

  const handlePropChange = (prop: string, value: any) => {
    setPlanetProps((prev) => ({ ...prev, [prop]: value }))
  }

  const star = useMemo(() => starSpec(planetProps.starType), [planetProps.starType])

  // Colour, brightness and size now come from the real stellar values rather than
  // three hard-coded switch statements. #ffff00 is not a colour any star is: the Sun
  // is white, and looks yellow from Earth only because the atmosphere scatters blue.
  const starColor = useMemo(() => {
    const { r, g, b } = blackbodyRgb(star.teff)
    return new THREE.Color(r, g, b)
  }, [star.teff])

  const starIntensity = useMemo(() => starLightIntensity(star.luminosity), [star.luminosity])

  // Real radius ratio, compressed logarithmically so a 25 R☉ giant and a 0.36 R☉
  // dwarf both stay in frame.
  const starSize = useMemo(() => 5 * (1 + Math.log10(star.radius + 0.1) * 0.9), [star.radius])

  const generatePlanetInfo = useCallback(() => {
    // Every figure below is derived from the controls the visitor set. This used to
    // be Math.random() for mass, gravity, temperature, period and even the orbital
    // distance the slider had just fixed -- nothing they built affected anything.
    const result = derivePlanet({
      radiusEarth: planetProps.radius,
      type: planetProps.type,
      starId: planetProps.starType,
      semiMajorAxisAu: sliderToAu(planetProps.starDistance),
      moons: planetProps.satelliteCount,
      rings: planetProps.ringCount,
    })

    setDerived(result)
    setCreationCount((prev) => prev + 1)

    if (creationCount === 0) {
      const unlockedAchievement = achievementsService.unlockAchievement("Master of Atmospheres")
      if (unlockedAchievement) {
        setCurrentAchievement(unlockedAchievement)
        setShowAchievement(true)
        setAchievements(achievementsService.getAllAchievements())
        setTimeout(() => setShowAchievement(false), 5000)
      }
    }
  }, [planetProps, creationCount])

  const handleShowEducationalInfo = useCallback(() => {
    const content = {
      planet: educationalContent.planetTypes[planetProps.type as keyof typeof educationalContent.planetTypes],
      star: educationalContent.starTypes[planetProps.starType as keyof typeof educationalContent.starTypes],
      discoveries: educationalContent.discoveries,
    }
    setEducationContent(content)
    setShowEducation(true)
    setShowHelp(false)
  }, [planetProps.type, planetProps.starType])

  const handleShowHelp = useCallback(() => {
    setShowHelp(true)
    setShowEducation(false)
  }, [])

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/50 backdrop-blur-md hover:bg-white/70">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="bg-black/50 backdrop-blur-md rounded-full px-4 py-2 text-sm text-white/80 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          You are 1,799 light-years from Earth
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/50 backdrop-blur-md hover:bg-white/70"
          onClick={handleShowHelp}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/50 backdrop-blur-md hover:bg-white/70"
          onClick={handleShowEducationalInfo}
        >
          <Info className="h-5 w-5" />
        </Button>

      </div>

      <Canvas
        shadows
        camera={{ position: [0, 5, 15], fov: 60 }}
        dpr={dpr}
        /*
         * WebGPU where the browser has it, WebGL2 everywhere else. WebGPURenderer
         * picks its own backend at init(), so this is one renderer and one set of
         * TSL shaders rather than two code paths. If init throws -- an old browser,
         * a blocked GPU -- the scene falls back to R3F's default WebGL renderer,
         * and the node materials still compile because TSL emits GLSL too.
         */
        gl={async (props: any) => {
          const { WebGPURenderer } = await import("three/webgpu")
          const renderer = new WebGPURenderer({ ...props, antialias: true })
          await renderer.init()
          setBackend((renderer as any).backend?.isWebGPUBackend ? "WebGPU" : "WebGL2")
          return renderer as any
        }}
      >
        {/* PRODUCT.md: this has to hold frame rate on a classroom laptop. Rather
            than guessing at the hardware, watch the actual frame rate and drop
            resolution when it sags. */}
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(0.75, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(2, d + 0.25))}
        />
        <EnhancedLighting />
        <Suspense fallback={null}>
          <Planet {...planetProps} starTeff={star.teff} />
          <Star teff={star.teff} intensity={starIntensity} distance={planetProps.starDistance} size={starSize} />
        </Suspense>
        <OrbitControls enableZoom={true} maxDistance={20} minDistance={5} />
        <Stars radius={300} depth={100} count={2000} factor={4} saturation={0} fade speed={1} />
      </Canvas>

      <PlanetControls
        activeTab={activeTab}
        onTabChange={setActiveTab}
        planetProps={planetProps}
        onPropChange={handlePropChange}
        onGeneratePlanetInfo={generatePlanetInfo}
        onShowEducationalInfo={handleShowEducationalInfo}
        isVisible={!showHelp && !showEducation}
      />

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 w-96 max-h-[calc(100vh-120px)] overflow-y-auto bg-gray-900/95 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl border border-gray-700 z-30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">How to Use ExoCreator</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
                onClick={() => setShowHelp(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">Getting Started</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Welcome to ExoCreator! This interactive tool lets you design and explore custom exoplanets and their
                  star systems. Use the controls at the bottom to customize your planet, star, and orbital system.
                </p>
              </section>

              <section>
                <h3 className="text-lg mb-2 text-ink">Navigation Controls</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>
                      <strong>Rotate:</strong> Click and drag to rotate the view around your planet
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>
                      <strong>Zoom:</strong> Use mouse wheel or pinch gesture to zoom in/out
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>
                      <strong>Pan:</strong> Right-click and drag to move the camera position
                    </span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Customization Tabs</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Planet Tab</h4>
                    <p className="text-sm text-gray-300">
                      Adjust planet size, choose from 10 vibrant colors, and select planet type (Rocky, Gas Giant, or
                      Ocean World). Each type has unique surface textures.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-300 mb-1">Star Tab</h4>
                    <p className="text-sm text-gray-300">
                      Configure your star system by selecting star type (Red Dwarf, Yellow Dwarf, or Giant Star) and
                      adjusting the distance between the planet and its star.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-1">System Tab</h4>
                    <p className="text-sm text-gray-300">
                      Add moons (up to 5) that orbit your planet and create ring systems (up to 5 rings) for a
                      Saturn-like appearance.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Generate Planet Data</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Click the "Generate Planet Data" button to create realistic scientific data for your exoplanet,
                  including mass, gravity, temperature, orbital period, and potential for life. Each generation creates
                  a unique planet!
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-pink-400">Achievements</h3>
                <p className="text-sm text-gray-300 leading-relaxed mb-2">
                    <span className="text-yellow-400">🏆</span>
                    <span>Create your first planet to unlock "Master of Atmospheres"</span>
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-cyan-400">Educational Info</h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Click the info button (ℹ️) to learn fascinating facts about exoplanets, different star types, and real
                  discoveries from space missions like Kepler and JWST.
                </p>
              </section>

              <section className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
                <h3 className="text-lg font-semibold mb-2 text-blue-300">Pro Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">💡</span>
                    <span>Gas giants look best with ring systems and multiple moons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">💡</span>
                    <span>Red dwarf stars create a dramatic reddish lighting effect</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">💡</span>
                    <span>Try different color combinations to create unique alien worlds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">💡</span>
                    <span>Experiment with star distance to see how lighting changes</span>
                  </li>
                </ul>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEducation && educationContent && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 w-96 max-h-[calc(100vh-120px)] overflow-y-auto bg-gray-900/95 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl border border-gray-700 z-30"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Educational Info</h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-white/10"
                onClick={() => setShowEducation(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
            </div>

            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-2 text-blue-400">{educationContent.planet.title}</h3>
                <p className="text-sm text-gray-300 mb-2 leading-relaxed">{educationContent.planet.description}</p>
                <p className="text-xs text-gray-400">
                  <strong>Examples:</strong> {educationContent.planet.examples}
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">{educationContent.star.title}</h3>
                <p className="text-sm text-gray-300 mb-2 leading-relaxed">{educationContent.star.description}</p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>
                    <strong>Temperature:</strong> {educationContent.star.temperature}
                  </p>
                  <p>
                    <strong>Lifespan:</strong> {educationContent.star.lifespan}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg mb-3 text-ink">Amazing Exoplanet Facts</h3>
                <ul className="space-y-2">
                  {educationContent.discoveries.map((fact: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {derived && (
        <PlanetReadout planet={derived} index={creationCount} onClose={() => setDerived(null)} />
      )}

      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-surface text-ink p-4 flex items-center space-x-3 border border-mint-deep"
          >
            <Trophy className="h-8 w-8 text-yellow-400" />
            <div>
              <Badge variant="secondary" className="bg-yellow-400/20 text-yellow-300 mb-2">
                Achievement Unlocked!
              </Badge>
              <p className="font-semibold">{currentAchievement.name}</p>
              <p className="text-xs text-gray-300">{currentAchievement.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const PlanetControls: React.FC<PlanetControlsProps> = ({
  activeTab,
  onTabChange,
  planetProps,
  onPropChange,
  onGeneratePlanetInfo,
  onShowEducationalInfo,
  isVisible = true,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  React.useEffect(() => {
    if (!isVisible) {
      setIsOpen(false)
    }
  }, [isVisible])

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="fixed bottom-0 left-0 right-0 z-10 w-full max-w-2xl mx-auto"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full bg-gray-900/90 backdrop-blur-md rounded-t-xl text-white hover:bg-gray-800/90"
        >
          <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          <span className="ml-2 text-sm">Exoplanet Controls</span>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="bg-gray-900/90 backdrop-blur-md p-6 border-t border-gray-700">
          <div className="flex gap-2 mb-6 flex-wrap">
            <Button
              variant={activeTab === "planet" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                activeTab === "planet" ? "bg-mint text-void" : "text-ink-dim hover:bg-raised hover:text-ink"
              }`}
              onClick={() => onTabChange("planet")}
            >
              <CircleDot className="h-4 w-4 mr-2" />
              Planet
            </Button>
            <Button
              variant={activeTab === "star" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                activeTab === "star" ? "bg-mint text-void" : "text-ink-dim hover:bg-raised hover:text-ink"
              }`}
              onClick={() => onTabChange("star")}
            >
              <Sun className="h-4 w-4 mr-2" />
              Star
            </Button>
            <Button
              variant={activeTab === "system" ? "default" : "ghost"}
              size="sm"
              className={`rounded-full ${
                activeTab === "system" ? "bg-mint text-void" : "text-ink-dim hover:bg-raised hover:text-ink"
              }`}
              onClick={() => onTabChange("system")}
            >
              <SatelliteIcon className="h-4 w-4 mr-2" />
              System
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "planet" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="planet-size" className="text-sm text-white/90 mb-3 block font-medium">
                    Planet radius:{" "}
                    <span className="font-mono text-ink tabular-nums">{planetProps.radius.toFixed(2)} R⊕</span>
                  </label>
                  <Slider
                    id="planet-size"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[planetProps.radius]}
                    onValueChange={([value]) => onPropChange("radius", value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/90 mb-3 block font-medium">Planet Color</label>
                  <div className="flex flex-wrap gap-3">
                    {contrastColors.map((color, index) => (
                      <button
                        key={index}
                        className={`w-10 h-10 rounded-full transition-all ${
                          planetProps.color === color ? "ring-4 ring-white scale-110" : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => onPropChange("color", color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-white/90 mb-3 block font-medium">Planet Type</label>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      variant={planetProps.type === "rock" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1 min-w-[100px]"
                      onClick={() => {
                        onPropChange("type", "rock")
                        onPropChange("textureType", "rock")
                      }}
                    >
                      🪨 Rocky
                    </Button>
                    <Button
                      variant={planetProps.type === "gas" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1 min-w-[100px]"
                      onClick={() => {
                        onPropChange("type", "gas")
                        onPropChange("textureType", "gas")
                      }}
                    >
                      💨 Gas Giant
                    </Button>
                    <Button
                      variant={planetProps.type === "water" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1 min-w-[100px]"
                      onClick={() => {
                        onPropChange("type", "water")
                        onPropChange("textureType", "water")
                      }}
                    >
                      🌊 Ocean World
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "star" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="star-distance" className="text-sm text-white/90 mb-3 block font-medium">
                    Orbital distance:{" "}
                    <span className="font-mono text-ink tabular-nums">
                      {sliderToAu(planetProps.starDistance).toFixed(3)} AU
                    </span>
                  </label>
                  <Slider
                    id="star-distance"
                    min={20}
                    max={100}
                    step={1}
                    value={[planetProps.starDistance]}
                    onValueChange={([value]) => onPropChange("starDistance", value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/90 mb-3 block font-medium">Star Type</label>
                  <div className="flex gap-3 flex-wrap">
                    <Button
                      variant={planetProps.starType === "redDwarf" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1 min-w-[120px]"
                      onClick={() => onPropChange("starType", "redDwarf")}
                    >
                      🔴 Red Dwarf
                    </Button>
                    <Button
                      variant={planetProps.starType === "yellowDwarf" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1 min-w-[120px]"
                      onClick={() => onPropChange("starType", "yellowDwarf")}
                    >
                      ⭐ Yellow Dwarf
                    </Button>
                    <Button
                      variant={planetProps.starType === "giant" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full flex-1 min-w-[120px]"
                      onClick={() => onPropChange("starType", "giant")}
                    >
                      🌟 Giant Star
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "system" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="satellite-count" className="text-sm text-white/90 mb-3 block font-medium">
                    Moons: {planetProps.satelliteCount}
                  </label>
                  <Slider
                    id="satellite-count"
                    min={0}
                    max={5}
                    step={1}
                    value={[planetProps.satelliteCount]}
                    onValueChange={([value]) => onPropChange("satelliteCount", value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="ring-count" className="text-sm text-white/90 mb-3 block font-medium">
                    Ring Systems: {planetProps.ringCount}
                  </label>
                  <Slider
                    id="ring-count"
                    min={0}
                    max={5}
                    step={1}
                    value={[planetProps.ringCount]}
                    onValueChange={([value]) => onPropChange("ringCount", value)}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 mt-6">
            <Button
              className="flex-1 bg-raised hover:bg-rule text-ink border border-rule transition-colors duration-tick ease-tick"
              onClick={onGeneratePlanetInfo}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Planet Data
            </Button>
            <Button
              variant="outline"
              className="bg-transparent hover:bg-raised text-ink-dim hover:text-ink border border-rule transition-colors duration-tick ease-tick"
              onClick={onShowEducationalInfo}
            >
              <Info className="h-4 w-4 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const EnhancedLighting = React.memo(() => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  )
})

EnhancedLighting.displayName = "EnhancedLighting"

export default ExoplanetCreator
