"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform, useInView, useSpring } from "framer-motion"
import Image from "next/image"
//import nebula from "/public/images/nebula-bg.webp"

interface StatProps {
  value: number
  label: string
  sublabel: string
  image: string
  className?: string
}

const stats: StatProps[] = [
  { 
    value: 5463, 
    label:"Exoplanets",
    sublabel:"Confirmed",
    image:"/images/Cancri.webp",
    className:"md:col-start-1 md:col-end-3 md:row-start-1"
  },
  { 
    value: 64, 
    label:"Potentially habitable",
    sublabel:"Exoplanets",
    image:"/images/kepler.webp",
    className:"md:col-start-3 md:col-end-5 md:row-start-2"
  },
  { 
    value: 3916, 
    label:"Planetary",
    sublabel:"Systems",
    image:"/images/pegasi.webp",
    className:"md:col-start-1 md:col-end-3 md:row-start-3"
  }
]

function CountingNumber({ value }: { value: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin:"-100px" })
  
  const spring = useSpring(0, {
    stiffness: 50,
    damping: 60,
    duration: 500
  })

  useEffect(() => {
    if (inView) {
      spring.set(value)
    }
  }, [inView, spring, value])

  return (
    <motion.span ref={ref} className="font-mono text-7xl md:text-8xl font-light leading-none tracking-tight tabular-nums text-ink">
      {useTransform(spring, (latest) => Math.round(latest).toLocaleString())}
    </motion.span>
  )
}

function Stat({ value, label, sublabel, image, className ="" }: StatProps) {
  return (
    <motion.div 
      className={`flex flex-col items-center gap-4 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type:"spring", stiffness: 300, damping: 10 }}
    >
      <div className="relative w-48 h-48 md:w-64 md:h-64 mb-8 group">
        <Image
          src={image}
          alt={`Illustration for ${label}`}
          fill
          className="object-cover rounded-full transition-transform duration-tick-3 group-hover:scale-110"
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-tick-3" />
      </div>
      <CountingNumber value={value} />
      <div className="flex flex-col items-center gap-2">
        <div className="text-3xl text-ink font-medium text-center">
          {label}
        </div>
        <div className="text-xl text-ink-faint text-center">
          {sublabel}
        </div>
      </div>
    </motion.div>
  )
}

export function EnhancedStatisticsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end","end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const nebulaY = useTransform(scrollYProgress, [0, 1], ["0%","30%"])
  const starsY = useTransform(scrollYProgress, [0, 1], ["0%","50%"])

  return (
    <section 
      ref={containerRef} 
      className="relative py-40 min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/*<motion.div 
        className="absolute inset-0 z-0"
        style={{ y: nebulaY }}
      >
        <Image
          src={nebula}
          alt="Nebula background"
          fill
          className="object-cover opacity-40"
          priority
        />
      </motion.div>*/}

      <motion.div 
        className="absolute inset-0 z-1"
        style={{ y: starsY }}
      >
        <div className="absolute inset-0 bg-repeat bg-cover opacity-70"></div>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-void via-transparent to-void"></div>

      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-32"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-ink">
            Cosmic Discoveries
          </h2>
          <p className="text-xl text-ink-faint max-w-2xl mx-auto">
            Unveiling the mysteries of our vast universe, one exoplanet at a time
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-20 md:gap-10 max-w-6xl mx-auto relative">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: index * 0.3 }}
              className={`w-full ${stat.className}`}
            >
              <Stat {...stat} />
            </motion.div>
          ))}
          
          {/* Círculos adicionales cerca de la primera estadística */}
          <motion.div 
            className="absolute left-[10%] top-[10%] w-[200px] h-[200px] border border-rule rounded-full opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 150, repeat: Infinity, ease:"linear" }}
          />
          <motion.div 
            className="absolute left-[5%] top-[15%] w-[100px] h-[100px] border border-gray-600 rounded-full opacity-30"
            animate={{ rotate: -360 }}
            transition={{ duration: 100, repeat: Infinity, ease:"linear" }}
          />
          <motion.div 
            className="absolute left-[15%] top-[5%] w-[150px] h-[150px] border border-gray-500 rounded-full opacity-25"
            animate={{ rotate: 360 }}
            transition={{ duration: 120, repeat: Infinity, ease:"linear" }}
          />
          {/* Decorative elements */}
          <motion.div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-rule rounded-full opacity-10"
            animate={{ rotate: 360 }}
            transition={{ duration: 200, repeat: Infinity, ease:"linear" }}
          />
          <motion.div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-gray-600 rounded-full opacity-15"
            animate={{ rotate: -360 }}
            transition={{ duration: 150, repeat: Infinity, ease:"linear" }}
          />
          <motion.div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-gray-500 rounded-full opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease:"linear" }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-32"
        >
          <p className="text-xl text-ink-faint max-w-3xl mx-auto leading-relaxed">
            Our journey through the cosmos continues, as we uncover new worlds and expand our understanding of the universe.
          </p>
        </motion.div>
      </div>
    </section>
  )
}


