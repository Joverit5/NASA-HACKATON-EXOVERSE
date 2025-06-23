"use client"

import { motion, useScroll, useTransform, MotionValue } from "framer-motion"
import { useRef, useEffect } from "react"
import Image from "next/image"
import { Star } from 'lucide-react'
import planet1 from "@/public/images/poltergeist.webp"
import tess from "@/public/images/tessinspacerender16by9-jpg.webp";
import planet2 from "@/public/images/pegasib.webp"
import planet3 from "@/public/images/Gliese.webp"
import Kepler from "@/public/images/Kepler2.webp"
import exoplanetImage from "/public/images/exoplanet.webp";
import centauri from "/public/images/proximaCentauri.webp";
import telescope from "/public/images/telescope.webp";
// Custom Star component with random twinkling animation
const TwinklingStar = ({ delay = 0, scale = 1 }: { delay?: number; scale?: number }) => (
  <motion.div
    initial={{ opacity: 0.1 }}
    animate={{ opacity: [0.1, 1, 0.1] }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute"
    style={{
      transform: `scale(${scale})`
    }}
  >
    <Star className="text-white" size={4} />
  </motion.div>
)

// Custom text reveal animation
const RevealText = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: "easeOut" }}
    viewport={{ once: true }}
  >
    {children}
  </motion.div>
)

// Timeline Event component
interface TimelineEventProps {
  year: string
  title: string
  description: string
  image: string
  align?: "left" | "right"
}

const TimelineEvent = ({ year, title, description, image, align = "left" }: TimelineEventProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })

  const x = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [align === "left" ? -100 : 100, 0, align === "left" ? -100 : 100]
  )

  return (
    <motion.div
      ref={containerRef}
      className={`flex items-center gap-8 ${
        align === "right" ? "flex-row-reverse" : ""
      } my-32`}
      style={{ x }}
    >
      <div className="w-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative aspect-square rounded-full overflow-hidden border border-white/10"
        >
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>
      </div>
      <div className="w-1/2 space-y-4">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-sm font-mono text-blue-400"
        >
          {year}
        </motion.span>
        <RevealText>
          <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            {title}
          </h3>
        </RevealText>
        <RevealText>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </RevealText>
      </div>
    </motion.div>
  )
}

export default function HistorySection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"])
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  
  // Generate random star positions
  const stars = Array.from({ length: 100 }, (_, i) => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 3,
    scale: Math.random() * 0.5 + 0.5
  }))

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-32 overflow-hidden bg-black"
    >
      {/* Parallax Stars Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute"
            style={{ top: star.top, left: star.left }}
          >
            <TwinklingStar delay={star.delay} scale={star.scale} />
          </div>
        ))}
      </motion.div>

      {/* Content Container */}
      <motion.div
        className="container mx-auto px-4 relative z-10"
        style={{ opacity }}
      >
        {/* Section Header */}
        <div className="text-center mb-24 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          >
            Journey Through Time
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto"
          >
            Discover the fascinating history of exoplanet exploration and the remarkable discoveries that have shaped our understanding of the cosmos.
          </motion.p>
        </div>

        {/* Timeline Events */}
        <div className="relative">
          {/* Vertical Timeline Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />

          <TimelineEvent
            year="1992"
            title="First Exoplanets Discovered"
            description="Astronomers detected the first confirmed planets outside our solar system, orbiting a pulsar named PSR B1257+12."
            image={planet1.src}
            align="left"
          />

          <TimelineEvent
            year="1995"
            title="51 Pegasi b"
            description="Michel Mayor and Didier Queloz discovered the first exoplanet orbiting a Sun-like star, revolutionizing our understanding of planetary systems."
            image={planet2.src}
            align="right"
          />

          <TimelineEvent
            year="2005"
            title="Discovery of Gliese 581c – A Potentially Habitable World"
            description="Astronomers detect Gliese 581c, a rocky exoplanet orbiting the red dwarf star Gliese 581, located about 20 light-years away in the constellation Libra."
            image={planet3.src}
            align="left"
          />

          <TimelineEvent
            year="2009"
            title="Kepler Mission"
            description="NASA launched the Kepler Space Telescope, which would go on to discover thousands of exoplanets and revolutionize our understanding of planetary systems."
            image={Kepler.src}
            align="right"
          />

          <TimelineEvent
            year="2015"
            title="Kepler’s Thousandth Exoplanet and the TRAPPIST-1 Discovery"
            description="By 2015, Kepler confirms over 1,000 exoplanets, cementing its place as a cornerstone of exoplanet research. Among its notable discoveries is TRAPPIST-1, a system of seven Earth-sized planets orbiting a single ultra-cool dwarf star located 39 light-years from Earth."
            image={exoplanetImage.src}
            align="left"
          />
                    <TimelineEvent
            year="2016"
            title="Proxima Centauri b – A Nearby Earth-Like Planet"
            description="Scientists discover Proxima Centauri b, an Earth-sized exoplanet orbiting Proxima Centauri, the closest star to the Sun at just 4.24 light-years away."
            image={centauri.src}
            align="right"
          />
                    <TimelineEvent
            year="2021"
            title="TESS Expands the Hunt for Exoplanets"
            description="NASA’s Transiting Exoplanet Survey Satellite (TESS) identifies thousands of new exoplanet candidates by scanning nearly the entire sky. Designed to follow up on Kepler’s work, TESS focuses on bright and nearby stars, making the discovered planets easier to study with ground-based telescopes."
            image={tess.src}
            align="left"
          />
          <TimelineEvent
            year="2022"
            title="Webb Telescope Era"
            description="The James Webb Space Telescope began its mission, providing unprecedented views of exoplanet atmospheres and advancing our search for habitable worlds."
            image={telescope.src}
            align="right"
          />
        </div>
      </motion.div>
    </section>
  )
}

