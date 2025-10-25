"use client"

import React, { useState, useMemo, useCallback, useRef, Suspense, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"
import { Button } from "@/src/components/ui/button"
import { Slider } from "@/src/components/ui/slider"
import { Card, CardContent } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/src/components/ui/collapsible"
import { ChevronUp, ChevronLeft, Trophy, Sun, SatelliteIcon, CircleDot, Info, Sparkles } from "lucide-react"
import Link from "next/link"
import { achievementsService } from "@/src/lib/achievementsService"

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

const createProceduralTexture = (type: string, color: string) => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return new THREE.Texture()
  }
  const canvas = document.createElement("canvas")
  canvas.width = 512
  canvas.height = 256
  const context = canvas.getContext("2d", { willReadFrequently: true })!

  const baseColor = new THREE.Color(color)
  const darkerColor = new THREE.Color(color).multiplyScalar(0.5)

  const gradient = context.createLinearGradient(0, 0, 0, 256)
  gradient.addColorStop(0, `#${baseColor.getHexString()}`)
  gradient.addColorStop(1, `#${darkerColor.getHexString()}`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 512, 256)

  if (type === "rock") {
    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const radius = Math.random() * 2 + 1
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
      context.fill()
    }
  } else if (type === "water") {
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20)
      context.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`
      context.lineWidth = Math.random() * 2 + 1
      context.stroke()
    }
  } else if (type === "gas") {
    for (let i = 0; i < 15; i++) {
      const y = Math.random() * 256
      const height = Math.random() * 50 + 25
      const bandGradient = context.createLinearGradient(0, y, 0, y + height)
      bandGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.2})`)
      bandGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
      context.fillStyle = bandGradient
      context.fillRect(0, y, 512, height)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

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
  const color = useMemo(() => contrastColors[Math.floor(Math.random() * contrastColors.length)], [])
  const texture = useMemo(
    () => createProceduralTexture(["rock", "water", "gas"][Math.floor(Math.random() * 3)], color),
    [color],
  )

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed
    meshRef.current.position.x = Math.cos(angle) * orbitRadius
    meshRef.current.position.z = Math.sin(angle) * orbitRadius
    meshRef.current.position.y = Math.sin(angle * 0.5) * orbitRadius * 0.2
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 16, 16]} />
      <meshStandardMaterial map={texture} color={color} roughness={0.5} metalness={0.5} />
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
}

const Planet: React.FC<PlanetProps> = React.memo(({ radius, color, satelliteCount, ringCount, textureType }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useMemo(() => createProceduralTexture(textureType, color), [textureType, color])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  const ringDistances = useMemo(() => {
    const distances = [radius + 0.5]
    for (let i = 1; i < ringCount; i++) {
      distances.push(distances[i - 1] + 0.3)
    }
    return distances
  }, [radius, ringCount])

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={texture}
          bumpScale={0.05}
          color={color}
          roughness={0.7}
          metalness={0.2}
        />
      </mesh>
      {Array.from({ length: satelliteCount }, (_, i) => (
        <Satellite key={i} radius={radius * 0.1} orbitRadius={radius + 1 + i * 0.5} speed={0.5 + i * 0.2} />
      ))}
      {ringCount > 0 &&
        ringDistances.map((distance, i) => (
          <mesh rotation={[Math.PI / 2, 0, 0]} key={i}>
            <ringGeometry args={[distance, distance + 0.1, 32]} />
            <meshStandardMaterial
              color={contrastColors[i % contrastColors.length]}
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
    </group>
  )
})

Planet.displayName = "Planet"

interface StarProps {
  color: THREE.Color
  intensity: number
  distance: number
  size: number
}

const Star: React.FC<StarProps> = React.memo(({ color, intensity, distance, size }) => {
  const lightRef = useRef<THREE.PointLight>(null!)
  const glowRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    if (lightRef.current && glowRef.current) {
      const time = clock.getElapsedTime()
      const glowIntensity = Math.sin(time * 2) * 0.1 + 0.9
      lightRef.current.position.set(distance, 30, -100)
      glowRef.current.position.set(distance, 30, -100)

      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
      glowMaterial.opacity = glowIntensity
    }
  })

  return (
    <group>
      <mesh position={[distance, 30, -100]}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={intensity * 5} distance={1000} decay={1} />
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
  const [planetInfo, setPlanetInfo] = useState<string | null>(null)
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

  const starColor = useMemo(() => {
    switch (planetProps.starType) {
      case "redDwarf":
        return new THREE.Color(0xff4500)
      case "yellowDwarf":
        return new THREE.Color(0xffff00)
      case "giant":
        return new THREE.Color(0xffd700)
      default:
        return new THREE.Color(0xffff00)
    }
  }, [planetProps.starType])

  const starIntensity = useMemo(() => {
    switch (planetProps.starType) {
      case "redDwarf":
        return 12
      case "yellowDwarf":
        return 18
      case "giant":
        return 30
      default:
        return 18
    }
  }, [planetProps.starType])

  const starSize = useMemo(() => {
    switch (planetProps.starType) {
      case "redDwarf":
        return 3
      case "yellowDwarf":
        return 5
      case "giant":
        return 15
      default:
        return 5
    }
  }, [planetProps.starType])

  const generatePlanetInfo = useCallback(() => {
    const mass = (Math.random() * 10 + 0.1).toFixed(2)
    const gravity = (Math.random() * 20 + 1).toFixed(2)
    const temperature = Math.floor(Math.random() * 1000 - 200)
    const atmosphere = Math.random() > 0.5 ? "Yes" : "No"
    const possibleLife = Math.random() > 0.8 ? "Possible" : "Unlikely"
    const orbitalPeriod = (Math.random() * 500 + 10).toFixed(1)
    const distance = (Math.random() * 100 + 0.5).toFixed(2)

    const info = `
Mass: ${mass} Earth masses
Surface Gravity: ${gravity} m/s²
Average Temperature: ${temperature}°C
Atmosphere: ${atmosphere}
Orbital Period: ${orbitalPeriod} days
Distance from Star: ${distance} AU
Potential for Life: ${possibleLife}
Planet Type: ${planetProps.type.charAt(0).toUpperCase() + planetProps.type.slice(1)}
Number of Moons: ${planetProps.satelliteCount}
    `

    setPlanetInfo(info)
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
  }, [planetProps.type, planetProps.satelliteCount, creationCount])

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

      <Canvas shadows camera={{ position: [0, 5, 15], fov: 60 }}>
        <EnhancedLighting />
        <Suspense fallback={null}>
          <Planet {...planetProps} />
          <Star color={starColor} intensity={starIntensity} distance={planetProps.starDistance} size={starSize} />
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
                <h3 className="text-lg font-semibold mb-2 text-purple-400">Navigation Controls</h3>
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
                <h3 className="text-lg font-semibold mb-3 text-purple-400">Amazing Exoplanet Facts</h3>
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

      {planetInfo && (
        <Card className="absolute bottom-24 right-4 w-80 bg-gray-900/90 backdrop-blur-md text-white border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Planet Data</h3>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                Exoplanet #{creationCount}
              </Badge>
            </div>
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{planetInfo}</pre>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {showAchievement && currentAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 right-4 bg-gradient-to-r from-purple-900/90 to-blue-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3 border border-yellow-400/50"
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
                activeTab === "planet" ? "bg-blue-600 text-white" : "text-white/80 hover:bg-white/10"
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
                activeTab === "star" ? "bg-yellow-600 text-white" : "text-white/80 hover:bg-white/10"
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
                activeTab === "system" ? "bg-purple-600 text-white" : "text-white/80 hover:bg-white/10"
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
                    Planet Size: {planetProps.radius.toFixed(1)}x Earth
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
                    Star Distance: {planetProps.starDistance} units
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              onClick={onGeneratePlanetInfo}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Planet Data
            </Button>
            <Button
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
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
