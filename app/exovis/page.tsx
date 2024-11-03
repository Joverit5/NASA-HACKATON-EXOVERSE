"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import dynamic from "next/dynamic";
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trophy, Info, Rocket, Brain, ChartBar, Star, X } from "lucide-react"
import Lenis from "@studio-freight/lenis"
import { Thermometer, Globe, Orbit, ExternalLink } from "lucide-react"
import { achievementsService } from "@/pages/api/achievements"
import keplerImage from "/app/images/kepler.png"
import proximaCentauri from "/app/images/proximaCentauri.png"
import HD from "/app/images/HD.png"
import Pegasi from "/app/images/pegasi.png"
import GJ from "/app/images/gj.png"
import WASP from "/app/images/was.png"
import K2 from "/app/images/K2.png"
import Cancri from "/app/images/Cancri.png"
import HAT from "/app/images/HAT.png"
import Navbar2 from "@/components/ui/navBar2";
const CoverParticles = dynamic(() => import("@/components/ui/star_particles"), {
  ssr: false,
  loading: () => <div className="h-screen bg-blue-950" />,
});

type Achievement = {
  name: string;
  unlocked: boolean;
}

const exoplanets = [
  {
    name: "Kepler-452b",
    distance: "1,800 light-years",
    image: keplerImage,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/Kepler-452_b",
    description: "Known as Earth's cousin, this planet orbits a sun-like star and could potentially support life.",
  },
  {
    name: "Proxima Centauri b",
    distance: "4 light-years",
    image: proximaCentauri,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/Proxima_Cen_b",
    description: "The closest known exoplanet to our solar system, orbiting the star Proxima Centauri.",
  },
  {
    name: "HD-209458b",
    distance: "159 light-years",
    image: HD,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/HD_209458_b",
    description: "One of the first exoplanets discovered through the transit method, known for its inflated atmosphere.",
  },
  {
    name: "51 Pegasi b",
    distance: "50 light-years",
    image: Pegasi,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/51_Peg_b",
    description: "The first exoplanet discovered orbiting a sun-like star, revolutionizing our understanding of planetary systems.",
  },
  {
    name: "GJ 357 d",
    distance: "30.8 light-years",
    image: GJ,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/GJ_357_d",
    description: "A super-Earth exoplanet that could potentially host life, orbiting within its star's habitable zone.",
  },
  {
    name: "WASP-127b",
    distance: "522.6 light-years",
    image: WASP,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/WASP-127_b",
    description: "One of the puffiest and least dense exoplanets known, with a mysterious cloud-free atmosphere.",
  },
  {
    name: "K2-18b",
    distance: "124 light-years",
    image: K2,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/K2-18_b",
    description: "A super-Earth exoplanet with potential water vapor in its atmosphere, orbiting within the habitable zone.",
  },
  {
    name: "55 Cancri e",
    distance: "40 light-years",
    image: Cancri,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/55_Cnc_e",
    description: "A super-Earth that might be covered in oceans of lava, with potential diamond-rich interior.",
  },
  {
    name: "HAT-P-11b",
    distance: "123 light-years",
    image: HAT,
    info: "https://eyes.nasa.gov/apps/exo/#/planet/HAT-P-11_b",
    description: "A Neptune-sized exoplanet known for its clear skies and potential water vapor in its atmosphere.",
  },
]

export default function ExoplanetCatalog() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [showAchievement, setShowAchievement] = useState(false)
  const [achievementName, setAchievementName] = useState("")
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null)
  const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null)
  const [showInfoBox, setShowInfoBox] = useState<string | null>(null)

  useEffect(() => {
    fetchAchievements()

    const lenis = new Lenis()
    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, []);
    const fetchAchievements = async () => {
      try {
        const response = await fetch("/api/achievements");
        if (response.ok) {
          const achievements = await response.json();
          setUnlockedAchievements(
            achievements
              .filter((a: Achievement) => a.unlocked)
              .map((a: Achievement) => a.name)
          );
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      }
    };
    const achievement = achievementsService.unlockAchievement(
      "Superland Discoverer"
    );
    if (achievement) {
      setAchievementName(achievement.name);
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 5000);
    }

    const handlePlanetClick = (planetName: string) => {
      if (showInfoBox === planetName) {
        setShowInfoBox(null)
      } else {
        setShowInfoBox(planetName)
      }
    }
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative">
            <CoverParticles />
      <div className="relative z-10">
        <Navbar2/>
        <main className="container mx-auto px-4 py-12">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Catalog of Exoplanets
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exoplanets.map((planet, index) => (
              <motion.div
                key={planet.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card 
                  className="relative bg-black/50 border-white/10 backdrop-blur-sm overflow-hidden group"
                  onMouseEnter={() => setHoveredPlanet(planet.name)}
                  onMouseLeave={() => setHoveredPlanet(null)}
                >
                  <CardHeader>
                    <CardTitle className="text-xl text-center">{planet.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative w-64 h-64 mb-4">
                      <motion.div
                        animate={{
                          scale: hoveredPlanet === planet.name ? 1.1 : 1,
                          rotate: hoveredPlanet === planet.name ? 360 : 0
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full rounded-full overflow-hidden cursor-pointer"
                        onClick={() => setExpandedPlanet(planet.name)}
                      >
                        <Image
                          src={planet.image}
                          alt={planet.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-full"
                        />
                        <AnimatePresence>
                          {hoveredPlanet === planet.name && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 text-center"
                            >
                              <p className="text-sm">{planet.description}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full" />
                    </div>
                    <p className="flex items-center gap-2 text-sm text-white/80">
                      <Star className="h-4 w-4" />
                      Distance: {planet.distance}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button 
                      variant="outline" 
                      className="group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                      asChild
                    >
                      <a href={planet.info} target="_blank" rel="noopener noreferrer">
                        <Info className="mr-2 h-4 w-4" />
                        More Information
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </main>

        <footer className="border-t border-white/10 mt-12">
          <div className="container mx-auto p-4 text-center text-sm text-white/60">
            © 2024 Exoverse. Exploring the cosmos, one planet at a time.
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="fixed top-3/4 left-1 transform -translate-x-1/2 bg-indigo-900 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50"
          >
            <Trophy className="h-6 w-6 text-yellow-400" />
            <div>
              <Badge variant="secondary" className="bg-primary-foreground text-primary mb-2">
                Achievement Unlocked!
              </Badge>
              <p>You've unlocked the {achievementName} achievement!</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:text-primary-foreground/80"
              onClick={() => setShowAchievement(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
     
    </div>
  )
}


