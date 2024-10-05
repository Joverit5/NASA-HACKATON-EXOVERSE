"use client"

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Importamos los componentes de shadcn/ui
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface PlanetProps {
  radius: number
  widthSegments: number
  heightSegments: number
  color: string
}

const Planet: React.FC<PlanetProps> = ({ radius, widthSegments, heightSegments, color }) => {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, widthSegments, heightSegments]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

export default function ExoCreator() {
  const [radius, setRadius] = useState(1)
  const [widthSegments, setWidthSegments] = useState(32)
  const [heightSegments, setHeightSegments] = useState(32)
  const [color, setColor] = useState('#ff6b6b')

  return (
    <div className="exocreator">
      <style jsx>{`
        .exocreator {
          display: flex;
          flex-direction: column;
          height: 100vh;
          background-color: #1a202c;
          color: white;
          padding: 2rem;
        }
        @media (min-width: 768px) {
          .exocreator {
            flex-direction: row;
          }
        }
        .canvas-container {
          width: 100%;
          height: 16rem;
          margin-bottom: 2rem;
        }
        @media (min-width: 768px) {
          .canvas-container {
            width: 50%;
            height: 100%;
            margin-bottom: 0;
          }
        }
        .controls-container {
          width: 100%;
          padding: 1.5rem;
          background-color: #2d3748;
          border-radius: 0.5rem;
        }
        @media (min-width: 768px) {
          .controls-container {
            width: 50%;
          }
        }
        .control-group {
          margin-bottom: 1rem;
        }
        .control-group label {
          display: block;
          margin-bottom: 0.5rem;
        }
      `}</style>
      <div className="canvas-container">
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Planet radius={radius} widthSegments={widthSegments} heightSegments={heightSegments} color={color} />
          <OrbitControls enableZoom={false} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </div>
      <div className="controls-container">
        <h2 className="text-2xl font-bold mb-4">Customize Your Exoplanet</h2>
        <div className="control-group">
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
        <div className="control-group">
          <Label htmlFor="widthSegments">Width Segments</Label>
          <Slider
            id="widthSegments"
            min={3}
            max={64}
            step={1}
            value={[widthSegments]}
            onValueChange={(value) => setWidthSegments(value[0])}
          />
        </div>
        <div className="control-group">
          <Label htmlFor="heightSegments">Height Segments</Label>
          <Slider
            id="heightSegments"
            min={2}
            max={64}
            step={1}
            value={[heightSegments]}
            onValueChange={(value) => setHeightSegments(value[0])}
          />
        </div>
        <div className="control-group">
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
        <Button className="w-full mt-4">Save Exoplanet</Button>
      </div>
    </div>
  )
}