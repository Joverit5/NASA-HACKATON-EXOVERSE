'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimation, useScroll } from 'framer-motion'

export default function ParallaxStars() {
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()

  useEffect(() => {
    const updateParallax = () => {
      if (containerRef.current) {
        const yPos = scrollY.get()
        const parallaxEffect = yPos * 0.5
        controls.set({ y: parallaxEffect })
      }
    }

    const unsubscribe = scrollY.onChange(updateParallax)
    return () => unsubscribe()
  }, [controls, scrollY])

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
      animate={controls}
    >
      {[...Array(200)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1 + 'px',
            height: Math.random() * 2 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            zIndex: Math.floor(Math.random() * 3) - 1,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </motion.div>
  )
}

