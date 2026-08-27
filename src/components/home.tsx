"use client"
import { useEffect, useRef, useState, Suspense } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import Navbar from "@/src/components/ui/navBar"
import { BookOpen, Brain, Palette, Telescope } from "lucide-react"
import PayPalButton from "@/src/components/ui/paypalbutton"
import dynamic from "next/dynamic"
import ScrollProgress from "@/src/components/ui/scrollprogress"
import { TransitCurve } from "@/src/components/transit-curve"
import type { ProcessedExoplanet } from "@/src/lib/exoplanetCatalog"

// Optimización: Lazy loading de componentes pesados
const FeaturesSection = dynamic(() => import("@/src/components/ui/feature-section"), {
  ssr: false,
  loading: () => <div className="h-96 bg-transparent" />,
})

const HistorySection = dynamic(() => import("@/src/components/ui/history-section"), {
  ssr: false,
  loading: () => <div className="h-96 bg-transparent" />,
})

const EnhancedStatisticsSection = dynamic(
  () => import("@/src/components/ui/statistics-section").then((mod) => mod.EnhancedStatisticsSection),
  {
    ssr: false,
    loading: () => <div className="h-96 bg-transparent" />,
  },
)

const CosmicCreditsSection = dynamic(() => import("@/src/components/ui/cosmic-credits"), {
  ssr: false,
  loading: () => <div className="h-screen bg-transparent" />,
})

export default function Home({ featured }: { featured: ProcessedExoplanet | null }) {
  const { scrollYProgress } = useScroll()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  // Optimización: Usar useSpring para animaciones más suaves
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%","30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const planetScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const textY = useTransform(scrollYProgress, [0, 0.3], ["0%","-20%"])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const heroYSpring = useSpring(heroY, springConfig)
  const planetScaleSpring = useSpring(planetScale, springConfig)
  const textYSpring = useSpring(textY, springConfig)

  const features = [
    {
      icon: BookOpen,
      title:"Information Hub",
      description:"A fascinating resource that unveils the basics and captivating history of exoplanets.",
    },
    {
      icon: Brain,
      title:"ExoQuest",
      description:"An interactive trivia adventure that challenges and expands your cosmic knowledge.",
    },
    {
      icon: Palette,
      title:"ExoCreator",
      description:"A unique tool empowering you to craft your own exoplanets, fueling your creativity.",
    },
    {
      icon: Telescope,
      title:"ExoVis",
      description:"A dynamic portal connecting you to the latest exoplanet discoveries.",
    },
  ]


  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-ink">
      <Navbar />
      <ScrollProgress progress={scrollYProgress} />

      {/* Hero: the transit curve is the first thing on the page, and it is the
          navigation. Scroll position maps to time along the crossing. */}
      <motion.section
        ref={heroRef}
        className="hero-container relative flex flex-col justify-center"
        style={{ opacity: heroOpacity }}
      >
        <div className="container mx-auto px-6 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.2, 0, 0, 1] }}
          >
            <p className="font-mono text-xs tracking-[0.18em] uppercase text-mint mb-6">
              {featured ? `${featured.discoveryMethod} · ${featured.discoveryYear ??"year unrecorded"}` :"NASA Exoplanet Archive"}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-normal leading-[1.02] tracking-tight max-w-4xl text-balance">
              {featured ? featured.name :"Exploring Exoplanets"}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-ink-dim leading-relaxed max-w-2xl">
              Every planet here entered the record the same way: as a dip in its
              star's light. Scroll to walk the crossing.
            </p>
          </motion.div>
        </div>

        {featured && (
          <motion.div
            className="container mx-auto px-6 relative z-20 mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.72, delay: 0.12 }}
          >
            <TransitCurve planet={featured} />

            <dl className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-px bg-rule border border-rule">
              {[
                ["Host star", featured.hostStar],
                ["Distance", featured.distance],
                ["Radius", featured.radius],
                ["Orbital period", featured.orbitalPeriod],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface px-4 py-4">
                  <dt className="font-mono text-xs tracking-[0.14em] uppercase text-ink-faint">{label}</dt>
                  <dd className="font-mono text-lg text-ink mt-2 tabular-nums">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        )}
      </motion.section>

      {/* Transición suave entre hero y features */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />

      {/* Features Section con transición */}
      <div className="relative -mt-16 pt-32">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
        <Suspense fallback={<div className="h-96 bg-transparent" />}>
          <FeaturesSection features={features} />
        </Suspense>
      </div>

      {/* Statistics Section con transición */}
      <div className="relative -mt-16 pt-32">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
        <Suspense fallback={<div className="h-96 bg-transparent" />}>
          <EnhancedStatisticsSection />
        </Suspense>
      </div>

      {/* History Section con transición */}
      <section id="history" className="relative -mt-16 pt-32">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent" />
        <Suspense fallback={<div className="h-96 bg-transparent" />}>
          <HistorySection />
        </Suspense>
      </section>

      {/* Credits Section con transición suave */}
      <section id="credits" className="relative -mt-16 pt-32">
        <Suspense fallback={<div className="h-screen bg-transparent" />}>
          <CosmicCreditsSection />
        </Suspense>
      </section>

      <PayPalButton />
      <footer className="p-4 text-center text-indigo-200 relative z-10">
        <div className="flex justify-center space-x-8 text-sm text-ink-faint">
                <span>© {new Date().getFullYear()} Exoverse</span>
                <span>•</span>
                <span>Exploring the cosmos</span>
        </div>
      </footer>
    </main>
  )
}
