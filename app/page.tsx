"use client"
import { useEffect, useRef, useState, Suspense } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { useMediaQuery } from "react-responsive"
import Navbar from "@/src/components/ui/navBar"
import { BookOpen, Brain, Palette, Telescope } from "lucide-react"
import PayPalButton from "@/src/components/ui/paypalbutton"
import dynamic from "next/dynamic"
import { LoadingScreen } from "@/src/components/loadingScreen"
import ScrollProgress from "@/src/components/ui/scrollprogress"

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



export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { scrollYProgress } = useScroll()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  // Optimización: Usar useSpring para animaciones más suaves
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "30%"])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const planetScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.1])
  const textY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-20%"])

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 }
  const heroYSpring = useSpring(heroY, springConfig)
  const planetScaleSpring = useSpring(planetScale, springConfig)
  const textYSpring = useSpring(textY, springConfig)

  const features = [
    {
      icon: BookOpen,
      title: "Information Hub",
      description: "A fascinating resource that unveils the basics and captivating history of exoplanets.",
    },
    {
      icon: Brain,
      title: "ExoQuest",
      description: "An interactive trivia adventure that challenges and expands your cosmic knowledge.",
    },
    {
      icon: Palette,
      title: "ExoCreator",
      description: "A unique tool empowering you to craft your own exoplanets, fueling your creativity.",
    },
    {
      icon: Telescope,
      title: "ExoVis",
      description: "A dynamic portal connecting you to the latest exoplanet discoveries.",
    },
  ]

  useEffect(() => {
    // Optimización: Reducir tiempo de carga
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Navbar />
      <ScrollProgress progress={scrollYProgress} />

      {/* Hero Section con transición suave */}
      <motion.div
        ref={heroRef}
        className="hero-container relative flex items-center"
        style={{ y: heroYSpring, opacity: heroOpacity }}
      >
        {/* Fondo con video optimizado */}
        <div className="absolute inset-0 z-0">
          <div className="optimized-video-container w-full h-full">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover opacity-30"
              poster="/images/stars-bg.webp" 
            >
              <source src="/videos/space-background.mp4" type="video/mp4" />
              <source src="/videos/space-background.webm" type="video/webm" />
              {/* Fallback para navegadores que no soportan video */}
              <Image
                src="/images/stars-bg.webp"
                alt="Deep space background with nebulae and stars"
                fill
                priority
                quality={95}
                sizes="100vw"
                className="object-cover opacity-30"
              />
            </video>
          </div>
          {/* Difuminación negra gradual en la parte inferior */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black via-black/100 to-transparent" />
        </div>

        {/* Planeta con dimensiones fijas para evitar layout shifts */}
        <motion.div
          className="absolute right-[-20%] top-[-5%] w-[600px] h-[600px] md:w-[1200px] md:h-[1100px]"
          style={{ scale: planetScaleSpring }}
        >
          <div className="image-container">
            <Image
              src="/images/exoplanet.webp"
              alt="Detailed exoplanet with atmospheric effects"
              fill
              priority
              quality={95}
              sizes="(max-width: 768px) 600px, 800px"
              className="object-contain"
            />
          </div>
        </motion.div>

        {/* Contenido del hero */}
        <motion.div className="container mx-auto px-6 relative z-20" style={{ y: textYSpring }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
              Exploring Exoplanets
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl">
              ExoVerse is an international educational platform dedicated to exploring and understanding planets beyond
              our solar system.
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

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
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black via-black/100 to-transparent" />
        <Suspense fallback={<div className="h-screen bg-transparent" />}>
          <CosmicCreditsSection />
        </Suspense>
      </section>

      <PayPalButton />
    </main>
  )
}
