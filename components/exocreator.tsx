"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  Suspense,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  useTexture,
  SpotLight,
  Environment,
  AccumulativeShadows,
  RandomizedLight,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronUp,
  ChevronLeft,
  Trophy,
  Sun,
  Satellite as SatelliteIcon,
  CircleDot,
  HelpCircle,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
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
];

const createProceduralTexture = (type: string, color: string) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext("2d")!;

  const baseColor = new THREE.Color(color);
  const darkerColor = new THREE.Color(color).multiplyScalar(0.5);

  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, `#${baseColor.getHexString()}`);
  gradient.addColorStop(1, `#${darkerColor.getHexString()}`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 512);

  if (type === "rock") {
    for (let i = 0; i < 10000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      const radius = Math.random() * 3 + 1;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${Math.random() * 255}, ${
        Math.random() * 255
      }, ${Math.random() * 255}, 0.3)`;
      context.fill();
    }
  } else if (type === "water") {
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 512;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20);
      context.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
      context.lineWidth = Math.random() * 2 + 1;
      context.stroke();
    }
  } else if (type === "gas") {
    for (let i = 0; i < 20; i++) {
      const y = Math.random() * 512;
      const height = Math.random() * 100 + 50;
      const bandGradient = context.createLinearGradient(0, y, 0, y + height);
      bandGradient.addColorStop(
        0,
        `rgba(255, 255, 255, ${Math.random() * 0.2})`
      );
      bandGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      context.fillStyle = bandGradient;
      context.fillRect(0, y, 1024, height);
    }
  }

  return new THREE.CanvasTexture(canvas);
};

interface SatelliteProps {
  radius: number;
  orbitRadius: number;
  speed: number;
}
interface PlanetControlsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  planetProps: {
    radius: number;
    type: string;
    color: string;
    satelliteCount: number;
    ringCount: number;
    starType: string;
    starDistance: number;
    textureType: string;
  };
  onPropChange: (prop: string, value: any) => void;
  onGeneratePlanetInfo: () => void;
}
const Satellite: React.FC<SatelliteProps> = ({
  radius,
  orbitRadius,
  speed,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const color = useMemo(
    () => contrastColors[Math.floor(Math.random() * contrastColors.length)],
    []
  );
  const texture = useMemo(
    () =>
      createProceduralTexture(
        ["rock", "water", "gas"][Math.floor(Math.random() * 3)],
        color
      ),
    [color]
  );

  useFrame(({ clock }) => {
    const angle = clock.getElapsedTime() * speed;
    meshRef.current.position.x = Math.cos(angle) * orbitRadius;
    meshRef.current.position.z = Math.sin(angle) * orbitRadius;
    meshRef.current.position.y = Math.sin(angle * 0.5) * orbitRadius * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial
        map={texture}
        color={color}
        roughness={0.5}
        metalness={0.5}
      />
    </mesh>
  );
};

interface PlanetProps {
  radius: number;
  color: string;
  satelliteCount: number;
  ringCount: number;
  textureType: string;
}

const Planet: React.FC<PlanetProps> = ({
  radius,
  color,
  satelliteCount,
  ringCount,
  textureType,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const texture = useMemo(
    () => createProceduralTexture(textureType, color),
    [textureType, color]
  );

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  const ringDistances = useMemo(() => {
    let distances = [radius + 0.5];
    for (let i = 1; i < ringCount; i++) {
      distances.push(distances[i - 1] + 0.3);
    }
    return distances;
  }, [radius, ringCount]);

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
          radius={radius * 0.1}
          orbitRadius={radius + 1 + i * 0.5}
          speed={0.5 + i * 0.2}
        />
      ))}
      {ringCount > 0 &&
        ringDistances.map((distance, i) => (
          <mesh rotation={[Math.PI / 2, 0, 0]} key={i}>
            <ringGeometry args={[distance, distance + 0.1, 64]} />
            <meshStandardMaterial
              color={contrastColors[i % contrastColors.length]}
              side={THREE.DoubleSide}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}
    </group>
  );
};

interface StarProps {
  color: THREE.Color;
  intensity: number;
  distance: number;
  size: number;
}

const Star: React.FC<StarProps> = ({ color, intensity, distance, size }) => {
  const lightRef = useRef<THREE.PointLight>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (lightRef.current && glowRef.current) {
      const time = clock.getElapsedTime();
      const glowIntensity = Math.sin(time * 2) * 0.1 + 0.9;
      lightRef.current.position.set(distance, 30, -100);
      glowRef.current.position.set(distance, 30, -100);

      const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial;
      glowMaterial.opacity = glowIntensity;
    }
  });

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
      <pointLight
        ref={lightRef}
        color={color}
        intensity={intensity * 5}
        distance={1000}
        decay={1}
      />
    </group>
  );
};
const ExoCreator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("planet");
  const [planetProps, setPlanetProps] = useState({
    radius: 1,
    type: "rock",
    color: "#4ECDC4",
    satelliteCount: 1,
    ringCount: 0,
    starType: "yellowDwarf",
    starDistance: 50,
    textureType: "rock",
  });
  const [planetInfo, setPlanetInfo] = useState<string | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const [achievementName, setAchievementName] = useState("");
  const [hasUnlockedAchievement, setHasUnlockedAchievement] = useState(false);

  const handlePropChange = (prop: string, value: any) => {
    setPlanetProps((prev) => ({ ...prev, [prop]: value }));
  };

  const starColor = useMemo(() => {
    switch (planetProps.starType) {
      case "redDwarf":
        return new THREE.Color(0xff4500);
      case "yellowDwarf":
        return new THREE.Color(0xffff00);
      case "giant":
        return new THREE.Color(0xffd700);
      default:
        return new THREE.Color(0xffff00);
    }
  }, [planetProps.starType]);

  const starIntensity = useMemo(() => {
    switch (planetProps.starType) {
      case "redDwarf":
        return 12;
      case "yellowDwarf":
        return 18;
      case "giant":
        return 30;
      default:
        return 18;
    }
  }, [planetProps.starType]);

  const starSize = useMemo(() => {
    switch (planetProps.starType) {
      case "redDwarf":
        return 3;
      case "yellowDwarf":
        return 5;
      case "giant":
        return 15;
      default:
        return 5;
    }
  }, [planetProps.starType]);

  const generatePlanetInfo = () => {
    const mass = (Math.random() * 10 + 0.1).toFixed(2);
    const gravity = (Math.random() * 20 + 1).toFixed(2);
    const temperature = Math.floor(Math.random() * 1000 - 200);
    const atmosphere = Math.random() > 0.5 ? "Yes" : "No";
    const possibleLife = Math.random() > 0.8 ? "Possible" : "Unlikely";

    return `
      Mass: ${mass} Earth masses
      Surface Gravity: ${gravity} m/s²
      Average Temperature: ${temperature}°C
      Atmosphere: ${atmosphere}
      Potential for Life: ${possibleLife}
    `;
  };

  const handleCreateExoplanet = useCallback(() => {
    setPlanetInfo(generatePlanetInfo());
    if (!hasUnlockedAchievement) {
      setShowAchievement(true);
      setAchievementName("Master of Atmospheres");
      setHasUnlockedAchievement(true);
      setTimeout(() => setShowAchievement(false), 5000);
    }
  }, [hasUnlockedAchievement]);

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-white/50 backdrop-blur-md"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="bg-black/50 backdrop-blur-md rounded-full px-4 py-2 text-sm text-white/80">
          You are 1,799 light-years from Earth
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/50 backdrop-blur-md"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/50 backdrop-blur-md"
        >
          <Maximize2 className="h-5 w-5" />
        </Button>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 15], fov: 60 }}>
        <EnhancedLighting />
        <Suspense fallback={null}>
          <Planet {...planetProps} />
          <Star
            color={starColor}
            intensity={starIntensity}
            distance={planetProps.starDistance}
            size={starSize}
          />
        </Suspense>
        <OrbitControls enableZoom={true} maxDistance={20} minDistance={5} />
        <Stars
          radius={300}
          depth={100}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
      </Canvas>

      <PlanetControls
        activeTab={activeTab}
        onTabChange={setActiveTab}
        planetProps={planetProps}
        onPropChange={handlePropChange}
        onGeneratePlanetInfo={handleCreateExoplanet}
      />

      {planetInfo && (
        <Card className="absolute bottom-4 right-4 w-80 bg-gray-800/80 backdrop-blur-md text-white border-none">
          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-2">Planet Information</h3>
            <pre className="whitespace-pre-wrap text-sm">{planetInfo}</pre>
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-md text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3"
          >
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white mb-2"
              >
                Achievement Unlocked!
              </Badge>
              <p>You've unlocked the {achievementName} achievement!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const PlanetControls: React.FC<PlanetControlsProps> = ({
  activeTab,
  onTabChange,
  planetProps,
  onPropChange,
  onGeneratePlanetInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="fixed bottom-0 left-0 right-0 z-10 w-full max-w-md mx-auto"
    >
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full bg-gray-800/80 backdrop-blur-md rounded-t-xl">
          <ChevronUp className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="bg-gray-800/80 backdrop-blur-md p-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeTab === 'planet' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full ${
                activeTab === 'planet' ? ' text-white' : ' text-white/80'
              }`}
              onClick={() => onTabChange('planet')}
            >
              <CircleDot className="h-4 w-4 mr-2" />
              Planet
            </Button>
            <Button
              variant={activeTab === 'star' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full ${
                activeTab === 'star' ? 'text-white' : ' text-white/80'
              }`}
              onClick={() => onTabChange('star')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Star
            </Button>
            <Button
              variant={activeTab === 'system' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-full ${
                activeTab === 'system' ? 'text-white' : ' text-white/80'
              }`}
              onClick={() => onTabChange('system')}
            >
              <SatelliteIcon className="h-4 w-4 mr-2" />
              System
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'planet' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="planet-size" className="text-sm text-white/80 mb-2 block">Size</label>
                  <Slider
                    id="planet-size"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[planetProps.radius]}
                    onValueChange={([value]) => onPropChange('radius', value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-white/80 mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {contrastColors.map((color, index) => (
                      <button
                        key={index}
                        className={`w-6 h-6 rounded-full ${planetProps.color === color ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onPropChange('color', color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={planetProps.type === 'rock' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      onPropChange('type', 'rock')
                      onPropChange('textureType', 'rock')
                    }}
                  >
                    Rocky
                  </Button>
                  <Button
                    variant={planetProps.type === 'gas' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      onPropChange('type', 'gas')
                      onPropChange('textureType', 'gas')
                    }}
                  >
                    Gas
                  </Button>
                  <Button
                    variant={planetProps.type === 'water' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => {
                      onPropChange('type', 'water')
                      onPropChange('textureType', 'water')
                    }}
                  >
                    Ocean
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'star' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="star-distance" className="text-sm text-white/80 mb-2 block">Distance</label>
                  <Slider
                    id="star-distance"
                    min={20}
                    max={100}
                    step={1}
                    value={[planetProps.starDistance]}
                    onValueChange={([value]) => onPropChange('starDistance', value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={planetProps.starType === 'redDwarf' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => onPropChange('starType', 'redDwarf')}
                  >
                    Red Dwarf
                  </Button>
                  <Button
                    variant={planetProps.starType === 'yellowDwarf' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => onPropChange('starType', 'yellowDwarf')}
                  >
                    Yellow Dwarf
                  </Button>
                  <Button
                    variant={planetProps.starType === 'giant' ? 'default' : 'outline'}
                    size="sm"
                    className="rounded-full"
                    onClick={() => onPropChange('starType', 'giant')}
                  >
                    Giant
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4"
              >
                <div>
                  <label htmlFor="satellite-count" className="text-sm text-white/80 mb-2 block">Satellites</label>
                  <Slider
                    id="satellite-count"
                    min={0}
                    max={5}
                    step={1}
                    value={[planetProps.satelliteCount]}
                    onValueChange={([value]) => onPropChange('satelliteCount', value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="ring-count" className="text-sm text-white/80 mb-2 block">Rings</label>
                  <Slider
                    id="ring-count"
                    min={0}
                    max={5}
                    step={1}
                    value={[planetProps.ringCount]}
                    onValueChange={([value]) => onPropChange('ringCount', value)}
                    className="w-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="outline" 
            className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
            onClick={onGeneratePlanetInfo}
          >
            Generate Planet Info
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
const EnhancedLighting = () => {
  return (
    <>
      <Environment preset="sunset" />
      <AccumulativeShadows temporal frames={100} scale={10}>
        <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
      </AccumulativeShadows>
      <ContactShadows
        opacity={0.5}
        scale={10}
        blur={1}
        far={10}
        resolution={256}
        color="#000000"
      />
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
};

export default ExoCreator;
