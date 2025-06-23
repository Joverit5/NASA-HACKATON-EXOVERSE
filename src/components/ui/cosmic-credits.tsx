"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import Image from "next/image"
import { Circle, Github, Linkedin, Mail, User } from "lucide-react"
import { teamMembers } from "@/src/data/team-members"

const ConstellationLine = ({
  start,
  end,
  delay = 0,
}: {
  start: { x: number; y: number }
  end: { x: number; y: number }
  delay?: number
}) => (
  <motion.svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1, delay }}
  >
    <motion.line
      x1={`${start.x}%`}
      y1={`${start.y}%`}
      x2={`${end.x}%`}
      y2={`${end.y}%`}
      stroke="url(#constellation-gradient)"
      strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 2, delay, ease: "easeInOut" }}
    />
    <defs>
      <linearGradient id="constellation-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#60A5FA" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  </motion.svg>
)

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
      ease: "easeInOut",
    }}
  />
)

const TeamMemberCard = ({ member, index }: { member: (typeof teamMembers)[0]; index: number }) => {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: true, margin: "-50px" })

  return (
    <motion.div
      ref={cardRef}
      className="group relative"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carta principal con glassmorphism mejorado */}
      <motion.div
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl"
        whileHover={{ scale: 1.02, y: -5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Efecto de brillo en hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-purple-500/20 opacity-0"
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Header con imagen */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-purple-600/30" />
          <Image
            src={member.image || "/placeholder.svg"}
            alt={member.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="300px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Icono flotante */}
          <motion.div
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
          >
            <User className="w-5 h-5 text-white" />
          </motion.div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white leading-tight">{member.name}</h3>
            <p className="text-sm text-blue-300 font-medium leading-relaxed">{member.role}</p>
          </div>

          {/* Línea decorativa */}
          <motion.div
            className="h-px bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isInView ? 1 : 0 }}
            transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
          />

          {/* Enlaces sociales */}
          <div className="flex gap-3 pt-2">
            <motion.div
              className="p-2 bg-white/5 hover:bg-white/15 rounded-xl transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Github className="w-4 h-4 text-white" />
            </motion.div>
            <motion.div
              className="p-2 bg-white/5 hover:bg-white/15 rounded-xl transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Linkedin className="w-4 h-4 text-white" />
            </motion.div>
            <motion.div
              className="p-2 bg-white/5 hover:bg-white/15 rounded-xl transition-all duration-300 cursor-pointer border border-white/10 hover:border-white/20"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Efecto de partículas en hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [-10, -20, -10],
                opacity: [0.5, 1, 0.5],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Sombra dinámica */}
      <motion.div
        className="absolute inset-0 -z-10 bg-blue-500/20 rounded-3xl blur-xl"
        animate={{
          scale: isHovered ? 1.1 : 0.95,
          opacity: isHovered ? 0.6 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

const InteractiveBluePoint = ({ member }: { member: (typeof teamMembers)[0] }) => {
  const [isHovered, setIsHovered] = useState(false)
  const pointRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(pointRef, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={pointRef}
      className="absolute cursor-pointer z-20"
      style={{
        transform: "translate(-50%, -50%)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : {}}
      transition={{ duration: 0.8, delay: Math.random() * 2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Punto azul principal */}
      <motion.div
        className="relative"
        animate={{
          scale: isHovered ? 1.3 : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Circle
          className="w-6 h-6 text-blue-400 fill-blue-400"
          style={{ filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))" }}
        />

        {/* Efecto de brillo pulsante */}
        <motion.div
          className="absolute inset-0 bg-blue-400 rounded-full blur-md"
          animate={{
            opacity: [0.4, 0.8, 0.4],
            scale: [0.8, 1.6, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* Anillos concéntricos */}
        <motion.div
          className="absolute inset-0 border-2 border-blue-400/30 rounded-full"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
      </motion.div>

      {/* Tooltip con nombre */}
      <motion.div
        className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 whitespace-nowrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 10,
        }}
        transition={{ duration: 0.2 }}
      >
        <p className="text-sm text-white font-medium">{member.name}</p>
      </motion.div>
    </motion.div>
  )
}

const BlueParticleField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(80)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400"
          style={{
            width: Math.random() * 4 + 2 + "px",
            height: Math.random() * 4 + 2 + "px",
            left: Math.random() * 100 + "%",
            top: Math.random() * 100 + "%",
            filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))",
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
            y: [0, -20, 0],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
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
    offset: ["start end", "end start"],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const parallaxYSpring = useSpring(parallaxY, { stiffness: 100, damping: 30 })

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-blue-950/10 to-black"
    >
      {/* Nebulosas flotantes de fondo */}
      <FloatingNebula className="w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-500 top-10 left-10" delay={0} />
      <FloatingNebula className="w-80 h-80 bg-gradient-to-r from-indigo-500 to-blue-500 top-1/3 right-20" delay={2} />
      <FloatingNebula className="w-64 h-64 bg-gradient-to-r from-cyan-500 to-blue-500 bottom-20 left-1/4" delay={4} />

      {/* Campo de puntos azules parallax */}
      <motion.div className="absolute inset-0" style={{ y: parallaxYSpring }}>
        <BlueParticleField />
      </motion.div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex flex-col justify-center py-20">
        {/* Título */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            Cosmic Architects
          </motion.h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Meet the stellar team behind ExoVerse, where passion for astronomy meets cutting-edge technology
          </p>
        </motion.div>

        {/* Grid de tarjetas del equipo */}
        <div className="container mx-auto px-6 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>


        {/* Mensaje final */}
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Together, we're pushing the boundaries of space education and making the wonders of the universe accessible
            to everyone. Join us on this incredible journey through the cosmos.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
