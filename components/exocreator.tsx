"use client"

import React, { useRef, useState, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, useTexture, SpotLight } from '@react-three/drei'
import * as THREE from 'three'

// Import components from shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PlanetProps {
  radius: number
  color: string
  planetType: 'water' | 'rock' | 'gas'
  satelliteCount: number
  ringCount: number
  textureType: string
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

const Satellite: React.FC<{ radius: number, orbitRadius: number, speed: number }> = ({ radius, orbitRadius, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed
    meshRef.current.position.x = Math.cos(angle) * orbitRadius
    meshRef.current.position.z = Math.sin(angle) * orbitRadius
    meshRef.current.position.y = Math.sin(angle * 0.5) * orbitRadius * 0.2
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color="#888" roughness={0.5} metalness={0.5} />
    </mesh>
  )
}

const Planet: React.FC<PlanetProps> = ({ radius, color, planetType, satelliteCount, ringCount, textureType }) => {
  const meshRef = useRef<THREE.Mesh>(null!)
  const texture = useMemo(() => createProceduralTexture(textureType, color), [textureType, color])

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

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
      {Array.from({ length: ringCount }, (_, i) => (
        <mesh rotation={[-Math.PI / 2, 0, 0]} key={i}>
          <ringGeometry args={[radius + 1.8 + i * 0.1, radius + 2.2 + i * 0.1, 64]} />
          <meshStandardMaterial color="#aaa" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

const Star: React.FC<{ color: THREE.Color, intensity: number }> = ({ color, intensity }) => {
  const { scene } = useThree()
  const lightRef = useRef<THREE.PointLight>(null!)

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.set(50, 30, -100)
    }
  })

  return (
    <group>
      <mesh position={[50, 30, -100]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <pointLight ref={lightRef} color={color} intensity={intensity} distance={1000} decay={2} />
    </group>
  )
}

const SceneLight: React.FC<{ color: THREE.Color, intensity: number }> = ({ color, intensity }) => {
  return (
    <SpotLight
      position={[10, 10, 10]}
      angle={0.3}
      penumbra={1}
      intensity={intensity}
      color={color}
      castShadow
      shadow-mapSize={[2048, 2048]}
    />
  )
}

export default function ExoCreator() {
  const [radius, setRadius] = useState(1)
  const [color, setColor] = useState('#ff6b6b')
  const [planetType, setPlanetType] = useState<'water' | 'rock' | 'gas'>('water')
  const [satelliteCount, setSatelliteCount] = useState(1)
  const [ringCount, setRingCount] = useState(0)
  const [starType, setStarType] = useState<'redDwarf' | 'yellowDwarf' | 'giant'>('yellowDwarf')
  const [textureType, setTextureType] = useState('water')

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
        return 1.5
      case 'yellowDwarf':
        return 2
      case 'giant':
        return 3
      default:
        return 2
    }
  }, [starType])

  const textures = [
    { name: 'Water', value: 'water' },
    { name: 'Rock', value: 'rock' },
    { name: 'Gas', value: 'gas' },
  ]

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-white p-8">
      <div className="w-full md:w-1/2 h-64 md:h-full mb-8 md:mb-0">
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <SceneLight color={starColor} intensity={starIntensity} />
          <Suspense fallback={null}>
            <Planet 
              radius={radius} 
              color={color} 
              planetType={planetType} 
              satelliteCount={satelliteCount} 
              ringCount={ringCount} 
              textureType={textureType}
            />
            <Star color={starColor} intensity={starIntensity} />
          </Suspense>
          <OrbitControls enableZoom={true} maxDistance={20} minDistance={5} />
          <Stars radius={300} depth={100} count={5000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>
      <div className="w-full md:w-1/2 space-y-6 p-6 bg-gray-800 rounded-lg overflow-y-auto">
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
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-12 p-1 bg-transparent"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-grow"
              />
            </div>
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
              max={3}
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
        </div>
        <Button className="w-full mt-4" onClick={() => alert("Planet created!")}>
          Create Exoplanet
        </Button>
      </div>
    </div>
  )
}