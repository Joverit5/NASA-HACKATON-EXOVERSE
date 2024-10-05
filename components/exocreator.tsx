"use client"

import React, { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
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
  planetType: 'water' | 'rock'
  satelliteCount: number
  ringCount: number
}

const createPlanetTextures = (type: 'water' | 'rock', color: string) => {
  const canvas = document.createElement('canvas');
  const displacementCanvas = document.createElement('canvas');
  canvas.width = displacementCanvas.width = 1024;
  canvas.height = displacementCanvas.height = 512;

  const context = canvas.getContext('2d')!;
  const displacementContext = displacementCanvas.getContext('2d')!;

  const gradient = context.createLinearGradient(0, 0, 0, 512);
  const displacementGradient = displacementContext.createLinearGradient(0, 0, 0, 512);

  if (type === 'water') {
    // Water texture
    gradient.addColorStop(0, `hsl(${parseInt(color.slice(1, 3), 16)}, 100%, 20%)`);
    gradient.addColorStop(1, `hsl(${parseInt(color.slice(1, 3), 16)}, 100%, 50%)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 512);

    // Displacement map (simulated relief for water waves)
    displacementGradient.addColorStop(0, 'rgba(100, 100, 255, 1)');
    displacementGradient.addColorStop(1, 'rgba(200, 200, 255, 1)');
    displacementContext.fillStyle = displacementGradient;
    displacementContext.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const radius = Math.random() * 2;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `hsla(${parseInt(color.slice(1, 3), 16)}, 100%, ${40 + Math.random() * 20}%, 0.1)`;
      context.fill();

      displacementContext.beginPath();
      displacementContext.arc(x, y, radius, 0, Math.PI * 2);
      displacementContext.fillStyle = `rgba(255, 255, 255, 0.1)`;
      displacementContext.fill();
    }
  } else {
    // Rock texture
    gradient.addColorStop(0, `hsl(${parseInt(color.slice(1, 3), 16)}, 20%, 20%)`);
    gradient.addColorStop(1, `hsl(${parseInt(color.slice(1, 3), 16)}, 20%, 40%)`);
    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 512);

    // Displacement map (simulated relief for craters)
    displacementGradient.addColorStop(0, 'rgba(80, 80, 80, 1)');
    displacementGradient.addColorStop(1, 'rgba(160, 160, 160, 1)');
    displacementContext.fillStyle = displacementGradient;
    displacementContext.fillRect(0, 0, 1024, 512);

    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const radius = Math.random() * 4;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `hsla(${parseInt(color.slice(1, 3), 16)}, 20%, ${20 + Math.random() * 20}%, 0.3)`;
      context.fill();

      displacementContext.beginPath();
      displacementContext.arc(x, y, radius, 0, Math.PI * 2);
      displacementContext.fillStyle = `rgba(255, 255, 255, 0.2)`;
      displacementContext.fill();
    }
  }

  return {
    texture: new THREE.CanvasTexture(canvas),
    displacementMap: new THREE.CanvasTexture(displacementCanvas),
  };
};

const createStarColor = (starType: 'redDwarf' | 'yellowDwarf' | 'giant') => {
  switch (starType) {
    case 'redDwarf':
      return new THREE.Color(0xff4500); // Red dwarf
    case 'yellowDwarf':
      return new THREE.Color(0xffff00); // Yellow dwarf (like the Sun)
    case 'giant':
      return new THREE.Color(0xffd700); // Giant
    default:
      return new THREE.Color(0xffff00); // Yellow dwarf by default
  }
};

const Satellite: React.FC<{ radius: number, orbitRadius: number, speed: number }> = ({ radius, orbitRadius, speed }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const angle = clock.getElapsedTime() * speed;
      meshRef.current.position.x = Math.cos(angle) * orbitRadius;
      meshRef.current.position.z = Math.sin(angle) * orbitRadius;
      meshRef.current.position.y = Math.sin(angle * 0.5) * orbitRadius * 0.2; // Add some vertical movement
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color="#888" />
    </mesh>
  );
};

const Planet: React.FC<PlanetProps> = ({ radius, color, planetType, satelliteCount, ringCount }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { texture, displacementMap } = useMemo(() => createPlanetTextures(planetType, color), [planetType, color]);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          displacementMap={displacementMap}
          displacementScale={0.05}
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
  );
}

const Star: React.FC<{ color: THREE.Color }> = ({ color }) => {
  return (
    <mesh position={[50, 30, -100]}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial color={color} />
      <pointLight color={color} intensity={1} distance={1000} />
    </mesh>
  );
};

export default function ExoCreator() {
  const [radius, setRadius] = useState(1)
  const [color, setColor] = useState('#ff6b6b')
  const [planetType, setPlanetType] = useState<'water' | 'rock'>('water')
  const [satelliteCount, setSatelliteCount] = useState(1)
  const [ringCount, setRingCount] = useState(0)
  const [starType, setStarType] = useState<'redDwarf' | 'yellowDwarf' | 'giant'>('yellowDwarf')

  const starColor = useMemo(() => createStarColor(starType), [starType]);

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
        <Canvas shadows camera={{ position: [0, 5, 10], fov: 60 }}>
          <ambientLight intensity={0.3} />
          <Planet radius={radius} color={color} planetType={planetType} satelliteCount={satelliteCount} ringCount={ringCount} />
          <Star color={starColor} />
          <OrbitControls enableZoom={true} maxDistance={20} minDistance={5} />
          <Stars radius={300} depth={100} count={5000} factor={4} saturation={0} fade speed={1} />
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
          <Label htmlFor="planetType">Planet Type</Label>
          <Select value={planetType} onValueChange={(value: 'water' | 'rock') => setPlanetType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select planet type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="rock">Rock</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="control-group">
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
        <div className="control-group">
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
        <div className="control-group">
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
        <Button className="mt-4" onClick={() => alert("Planet created!")}>
          Create Exoplanet
        </Button>
      </div>
    </div>
  )
}