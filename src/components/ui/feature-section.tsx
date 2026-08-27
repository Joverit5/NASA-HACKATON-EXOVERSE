"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { Star } from 'lucide-react'
import {FeatureCard}  from "./featurecard"

// Reusing the TwinklingStar component from the history section
const TwinklingStar = ({ delay = 0, scale = 1 }: { delay?: number; scale?: number }) => (
  <motion.div
    initial={{ opacity: 0.1 }}
    animate={{ opacity: [0.1, 1, 0.1] }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease:"easeInOut"
    }}
    className="absolute"
    style={{
      transform: `scale(${scale})`
    }}
  >
    <Star className="text-ink" size={4} />
  </motion.div>
)

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeaturesSectionProps {
  features: Feature[];
}

export default function FeaturesSection({ features }: FeaturesSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end","end start"],
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%","50%"])
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
      className="relative py-32 overflow-hidden bg-black"
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
            className="text-6xl font-bold text-ink"
          >
            What ExoVerse Does
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-xl text-ink-faint max-w-2xl mx-auto"
          >
            Explore the cutting-edge features that make ExoVerse your gateway to the wonders of exoplanets.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
            >
              <FeatureCard {...feature} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

