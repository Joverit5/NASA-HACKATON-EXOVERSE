'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture, SpotLight } from '@react-three/drei'
import * as THREE from 'three'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { achievementsService } from '@/pages/api/achievements'

const contrastColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98',
  '#DDA0DD', '#F0E68C', '#FF69B4', '#20B2AA', '#B0E0E6',
]

type Achievement = {
  name: string
  unlocked: boolean
}

const createProceduralTexture = (type: string, color: string) => {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 512
  const context = canvas.getContext('2d')!

  const baseColor = new THREE.Color(color)
  const darkerColor = new THREE.Color(color).multiplyScalar(0.5)

  const gradient = context.createLinearGradient(0, 0, 0, 512)
  gradient.addColorStop(0, `#${baseColor.getHexString()}`)
  gradient.addColorStop(1, `#${darkerColor.getHexString()}`)
  context.fillStyle = gradient
  context.fillRect(0, 0, 1024, 512)

  if (type === 'rock') {
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 512
      const radius = Math.random() * 3 + 1
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.3)`
      context.fill()
    }
  } else if (type === 'water') {
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 512
      context.beginPath()
      context.moveTo(x, y)
      context.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20)
      context.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`
      context.lineWidth = Math.random() * 2 + 1
      context.stroke()
    }
  } else if (type === 'gas') {
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * 512
      const height = Math.random() * 100 + 50
      const bandGradient = context.createLinearGradient(0, y, 0, y + height)
      bandGradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.2})`)
      bandGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = bandGradient
      context.fillRect(0, y, 1024, height)
    }
  }

  return new THREE.CanvasTexture(canvas)
}

interface SatelliteProps {
  radius: number
  orbitRadius: number
  speed: number
}

const Satellite: React.FC<SatelliteProps> = ({ radius, orbitRadius, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const color = useMemo(() => contrastColors[Math.floor(Math.random() * contrastColors.length)], [])
  const texture = useMemo(() => createProceduralTexture(['rock', 'water', 'gas'][Math.floor(Math.random() * 3)], color), [color])

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed
    meshRef.current.position.x = Math.cos(angle) * orbitRadius
    meshRef.current.position.z = Math.sin(angle) * orbitRadius
    meshRef.current.position.y = Math.sin(angle * 0.5) * orbitRadius * 0.2
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial map={texture} color={color} roughness={0.5} metalness={0.5} />
    </mesh>
  )
}

interface PlanetProps {
  radius: number
  color: string
  planetType: 'water' | 'rock' | 'gas'
  satelliteCount: number
  ringCount: number
  textureType: string
}

const Planet: React.FC<PlanetProps> = ({ radius, color, planetType, satelliteCount, ringCount, textureType }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useMemo(() => createProceduralTexture(textureType, color), [textureType, color])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  const ringDistances = useMemo(() => {
    let distances = [radius + 1.8]
    for (let i = 1; i < ringCount; i++) {
      distances.push(distances[i-1] + Math.random() * 0.5 + 0.2)
    }
    return distances
  }, [radius, ringCount])

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
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
        <Satellite 
          key={i} 
          radius={radius * 0.2} 
          orbitRadius={radius + 1.5 + i * 0.5} 
          speed={0.5 + i * 0.2}
        />
      ))}
      {ringCount > 0 && ringDistances.map((distance, i) => (
        <mesh rotation={[-Math.PI / 2, 0, 0]} key={i}>
          <ringGeometry args={[distance, distance + 0.2, 64]} />
          <meshStandardMaterial color={contrastColors[i % contrastColors.length]} side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

interface StarProps {
  color: THREE.Color
  intensity: number
  distance: number
  size: number
}

const Star: React.FC<StarProps> = ({ color, intensity, distance, size }) => {
  const { scene } = useThree()
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
        <sphereGeometry args={[size, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.2, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={intensity * 5} distance={1000} decay={1} />
    </group>
  )
}

interface SceneLightProps {
  color: THREE.Color
  intensity: number
}

const SceneLight: React.FC<SceneLightProps> = ({ color, intensity }) => {
  return (
    <SpotLight
      position={[10, 10, 10]}
      angle={0.3}
      penumbra={1}
      intensity={intensity * 5}
      color={color.getHexString()}
      castShadow
      shadow-mapSize={[2048, 2048]}
    />
  )
}

export default function ExoCreator() {
  const [radius, setRadius] = useState(1)
  const [color, setColor] = useState(contrastColors[0])
  const [planetType, setPlanetType] = useState<'water' | 'rock' | 'gas'>('water')
  const [satelliteCount, setSatelliteCount] = useState(1)
  const [ringCount, setRingCount] = useState(0)
  const [starType, setStarType] = useState<'redDwarf' | 'yellowDwarf' | 'giant'>('yellowDwarf')
  const [textureType, setTextureType] = useState('water')
  const [starDistance, setStarDistance] = useState(50)
  const [planetInfo, setPlanetInfo] = useState<string | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementName, setAchievementName] = useState("")
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [planetCount, setPlanetCount] = useState(0)

  useEffect(() => {
    fetchAchievements()
  }, [])

const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements')
      if (response.ok) {
        const achievements = await response.json()
        setUnlockedAchievements(achievements.filter((a: Achievement) => a.unlocked).map((a: Achievement) => a.name))
      }
    } catch (error) {
      console.error('Error fetching achievements:', error)
    }
  }

  const starColor = useMemo(() => {
    switch (starType) {
      case 'redDwarf':
        return new THREE.Color(0xff4500)
      case 'yellowDwarf':
        return new THREE.Color(0xffff00)
      case 'giant':
        return new THREE.Color(0xffd700)
      default:
        return new THREE.Color(0xffff00)
    }
  }, [starType])

  const starIntensity = useMemo(() => {
    switch (starType) {
      case 'redDwarf':
        return 12
      case 'yellowDwarf':
        return 18
      case 'giant':
        return 30
      default:
        return 18
    }
  }, [starType])

  const starSize = useMemo(() => {
    switch (starType) {
      case 'redDwarf':
        return 3
      case 'yellowDwarf':
        return 5
      case 'giant':
        return 15
      default:
        return 5
    }
  }, [starType])

  const generatePlanetInfo = () => {
    const mass = (Math.random() * 10 + 0.1).toFixed(2)
    const gravity = (Math.random() * 20 + 1).toFixed(2)
    const temperature = Math.floor(Math.random() * 1000 - 200)
    const atmosphere = Math.random() > 0.5 ? 'Yes' : 'No'
    const possibleLife = Math.random() > 0.8 ? 'Possible' : 'Unlikely'

    return `
      Mass: ${mass} Earth masses
      Surface Gravity: ${gravity} m/s²
      Average Temperature: ${temperature}°C
      Atmosphere: ${atmosphere}
      Potential for Life: ${possibleLife}
    `
  }

  const handleCreateExoplanet = useCallback(async () => {
    setPlanetInfo(generatePlanetInfo())
    setPlanetCount(prevCount => prevCount + 1)
    
    const achievement = achievementsService.unlockAchievement("Master of Atmospheres");
  if (achievement) {
    setAchievementName(achievement.name);
    setShowAchievement(true);
    setTimeout(() => setShowAchievement(false), 5000);}

  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white p-8">
        <Link href="/">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="w-full md:w-1/2 h-64 md:h-full mb-8 md:mb-0">
          <Canvas shadows camera={{ position: [0, 5, 50], fov: 60 }}>
            <ambientLight intensity={0.2} />
            <SceneLight color={starColor} intensity={starIntensity * 0.5} />
            <Suspense fallback={null}>
              <Planet 
                radius={radius} 
                color={color} 
                planetType={planetType} 
                satelliteCount={satelliteCount} 
                ringCount={ringCount} 
                textureType={textureType}
              />
              <Star color={starColor} intensity={starIntensity} distance={starDistance} size={starSize} />
            </Suspense>
            <OrbitControls enableZoom={true} maxDistance={20} minDistance={5} />
            <Stars radius={300} depth={100} count={5000} factor={4} saturation={0} fade speed={1} />
          </Canvas>
        </div>
        <div className="w-full glassmorphism md:w-1/2 space-y-6 p-6 bg-gray-800 rounded-lg overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4">Customize Your Exoplanet</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="radius">Radius</Label>
              <Slider
                id="radius"
                min={0.5}
                max={2}
                step={0.1}
                value={[radius]}
                onValueChange={(value) => setRadius(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="planetType">Planet Type</Label>
              <Select value={planetType} onValueChange={(value: 'water' | 'rock' | 'gas') => {
                setPlanetType(value)
                setTextureType(value)
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select planet type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="rock">Rock</SelectItem>
                  <SelectItem value="gas">Gas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={color} onValueChange={(value) => setColor(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select planet color" />
                </SelectTrigger>
                <SelectContent>
                  {contrastColors.map((c, index) => (
                    <SelectItem key={index} value={c}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: c }}></div>
                        {c}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="satelliteCount">Satellites</Label>
              <Slider
                id="satelliteCount"
                min={0}
                max={5}
                step={1}
                value={[satelliteCount]}
                onValueChange={(value) => setSatelliteCount(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="ringCount">Rings</Label>
              <Slider
                id="ringCount"
                min={0}
                max={5}
                step={1}
                value={[ringCount]}
                onValueChange={(value) => setRingCount(value[0])}
              />
            </div>
            <div>
              <Label htmlFor="starType">Star Type</Label>
              <Select value={starType} onValueChange={(value: 'redDwarf' | 'yellowDwarf' | 'giant') => setStarType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select star type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="redDwarf">Red Dwarf</SelectItem>
                  <SelectItem value="yellowDwarf">Yellow Dwarf</SelectItem>
                  <SelectItem value="giant">Giant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="starDistance">Star Distance</Label>
              <Slider
                id="starDistance"
                min={20}
                max={100}
                step={1}
                value={[starDistance]}
                onValueChange={(value) => setStarDistance(value[0])}
              />
            </div>
          </div>
          <Button 
            className="w-full mt-4 bg-gray-700" 
            onClick={handleCreateExoplanet}
          >
            Create Exoplanet
          </Button>
          {planetInfo && (
            <Card className="mt-4 bg-gray-700">
              <CardContent className="p-4">
                <h3 className="text-xl font-bold mb-2">Exoplanet Information</h3>
                <pre className="whitespace-pre-wrap">{planetInfo}</pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed bottom-4 right-4 bg-indigo-900 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3"
          >
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <Badge variant="secondary" className="bg-indigo-700 text-white mb-2">
                Achievement Unlocked!
              </Badge>
              <p>You've unlocked the {achievementName} achievement!</p>
            </div>
            <button onClick={() => setShowAchievement(false)} className="text-indigo-300 hover:text-white">
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
  )
}