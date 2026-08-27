"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Circle, Github, Linkedin, Mail, User } from "lucide-react"
import { teamMembers } from "@/src/data/team-members"

const FloatingNebula = ({
  className,
  delay = 0,
}: {
  className: string
  delay?: number
}) => (
  <motion.div
    className={`absolute rounded-full opacity-20 blur-3xl ${className}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0.8, 1.2, 0.8],
      opacity: [0.1, 0.3, 0.1],
      rotate: [0, 180, 360],
    }}
    transition={{
      duration: 20,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      ease:"easeInOut",
    }}
  />
)


const BlueParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400"
          style={{
            width: Math.random() * 4 + 2 +"px",
            height: Math.random() * 4 + 2 +"px",
            left: Math.random() * 100 +"%",
            top: Math.random() * 100 +"%",
            filter:"drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))",
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Number.POSITIVE_INFINITY,
            ease:"easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}

export default function CosmicCreditsSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end","end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%","30%"])
  const parallaxYSpring = useSpring(parallaxY, { stiffness: 100, damping: 30 })

  return (
    
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-blue-950/10 to-black"
    >
      
      {/* Nebulosas flotantes de fondo */}
      <FloatingNebula className="w-96 h-96 bg-rule top-10 left-10" delay={0} />
      <FloatingNebula className="w-80 h-80 bg-rule top-1/3 right-20" delay={2} />
      <FloatingNebula className="w-64 h-64 bg-rule bottom-20 left-1/4" delay={4} />

      {/* Campo de puntos azules parallax */}
      <motion.div className="absolute inset-0" style={{ y: parallaxYSpring }}>
        <BlueParticleField />
      </motion.div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-20">
        {/* Título */}
        <section id ="credits" className="py-24 relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-ink">
                  Our Stellar Team
                </span>
              </h2>
              <p className="id=credits text-xl text-slate-300 max-w-3xl mx-auto">
                Meet the brilliant minds behind ExoVerse, where passion for astronomy meets cutting-edge technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="w-full max-w-[280px]"
                >
                  <Card className="aspect-square w-full bg-slate-900/50 border-slate-700/50 hover:bg-slate-800/50 transition-all duration-tick group overflow-hidden">
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 p-0.5">
                          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                            <Image
                              src={member.image ||"/placeholder.svg"}
                              alt={member.name}
                              width={80}
                              height={80}
                              className="object-cover w-full h-full rounded-full"
                              priority={index < 3}
                            />
                          </div>
                        </div>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-500/20 blur-xl group-hover:blur-2xl transition-all duration-tick" />
                      </div>

                      <div className="text-center space-y-2 flex-1 flex flex-col justify-center">
                        <h3 className="text-base font-semibold text-ink group-hover:text-cyan-300 transition-colors duration-tick leading-tight">
                          {member.name}
                        </h3>
                        <p className="text-xs text-slate-400 leading-tight">{member.email}</p>
                        <div className="flex justify-center gap-3 pt-3">
                          {member.github ? (
                            <a
                              href={member.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-surface hover:bg-white/15 transition-all duration-tick border border-rule hover:border-rule"
                            >
                              <Github className="w-4 h-4 text-ink" />
                            </a>
                          ) : (
                            <span className="p-1.5 bg-surface border border-rule opacity-40 cursor-not-allowed">
                              <Github className="w-4 h-4 text-ink" />
                            </span>
                          )}
                          {member.linkedin ? (
                            <a
                              href={member.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-surface hover:bg-white/15 transition-all duration-tick border border-rule hover:border-rule"
                            >
                              <Linkedin className="w-4 h-4 text-ink" />
                            </a>
                          ) : (
                            <span className="p-1.5 bg-surface border border-rule opacity-40 cursor-not-allowed">
                              <Linkedin className="w-4 h-4 text-ink" />
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            {/* Mensaje final */}
            <motion.div
              className="text-center px-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
                <div className="h-8" />
                <p className="text-lg text-ink-faint max-w-3xl mx-auto leading-relaxed">
                Together, we're pushing the boundaries of space education and making the wonders of the universe accessible
                to everyone. Join us on this incredible journey through the cosmos.
                </p>
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  )
}
