"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Navbar from "@/components/ui/navBar";
import { BookOpen, Brain, Palette, Telescope } from "lucide-react";
import PayPalButton from "@/components/ui/paypalbutton";
import FeaturesSection from "@/components/ui/feature-section"
import TeamMember from "@/components/ui/teammember";
import ScrollProgress from "@/components/ui/scrollprogress";
import backgroundImage from "/app/images/background.webp";
import Lenis from "lenis";
import David from "/app/images/David.png";
import Santiago from "/app/images/Santiago.jpg";
import Fabian from "/app/images/Fabián.jpg";
import Eduardo from "/app/images/Eduardo.jpg";
import Isabella from "/app/images/Isabella.jpg";
import Jose from "/app/images/Jose.jpg";
import exoplanetImage from "/app/images/exoplanet.webp";
import HistorySection from "@/components/ui/history-section";

export default function Home() {
  const { scrollYProgress } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);

  // Multiple parallax refs for different sections
  const heroRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);

  // Transform values for parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const planetScale = useTransform(scrollYProgress, [0, 0.5], [1, 1.2]);
  const textY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-30%"]);

  const features = [
    {
      icon: BookOpen,
      title: "Information Hub",
      description:
        "A fascinating resource that unveils the basics and captivating history of exoplanets.",
    },
    {
      icon: Brain,
      title: "ExoQuest",
      description:
        "An interactive trivia adventure that challenges and expands your cosmic knowledge.",
    },
    {
      icon: Palette,
      title: "ExoCreator",
      description:
        "A unique tool empowering you to craft your own exoplanets, fueling your creativity.",
    },
    {
      icon: Telescope,
      title: "ExoVis",
      description:
        "A dynamic portal connecting you to the latest exoplanet discoveries.",
    },
  ];

  const teamMembers = [
    {
      name: "Fabián Camilo Quintero Pareja",
      email: "parejaf@utb.edu.co",
      image: Fabian.src,
    },
    {
      name: "Santiago Quintero Pareja",
      email: "squintero@utb.edu.co",
      image: Santiago.src,
    },
    {
      name: "Eduardo Alejandro Negrín Pérez",
      email: "enegrin@utb.edu.co",
      image: Eduardo.src,
    },
    {
      name: "Isabella Sofía Arrieta Guardo",
      email: "arrietai@utb.edu.co",
      image: Isabella.src,
    },
    {
      name: "José Fernando González Ortiz",
      email: "joseortiz@utb.edu.co",
      image: Jose.src,
    },
    {
      name: "David Sierra Porta",
      email: "dporta@utb.edu.co",
      image: David.src,
    },
  ];
  useEffect(() => {
    // Initialize smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <Navbar />
      <ScrollProgress progress={scrollYProgress} />

    {/* Hero Section with Parallax */}
<motion.div
  ref={heroRef}
  className="relative min-h-screen flex items-center"
  style={{ y: heroY, opacity: heroOpacity }}
>
  {/* Background Gradient Overlay */}
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      background: "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 10))",
      zIndex: 1, // Asegúrate de que esté encima del fondo
    }}
  ></div>

  {/* Background Stars Layer */}
  <div
    className="absolute inset-0 bg-cover opacity-20"
    style={{
      backgroundImage: `url(${backgroundImage.src})`,
    }}
  />

  {/* Floating Planet Layer */}
  <motion.div
    className="absolute right-[-45%] top-0 w-[90%] h-[120%]"
    style={{ scale: planetScale }}
  >
    <Image
      src={exoplanetImage}
      alt="Exoplanet"
      fill
      className="object-cover"
      priority
    />
  </motion.div>

  {/* Content Layer */}
  <motion.div
    className="container mx-auto px-6 relative z-20"
    style={{ y: textY }}
  >
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2 }}
      className="max-w-3xl"
    >
      <h1 className="text-7xl md:text-8xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
        Exploring Exoplanets
      </h1>
      <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
        ExoVerse is an international educational platform dedicated to
        exploring and understanding planets beyond our solar system.
      </p>
    </motion.div>
  </motion.div>
</motion.div>

{/* Features Section with Floating Cards */}
<FeaturesSection features={features} />

      {/* History Section with Floating Cards */}
      <section id="history" ref={historyRef} className="relative py-32">
        <HistorySection />
      </section>

      {/* Team Section with Floating Cards */}
      <section className="relative py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-90" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-bold mb-16 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
          >
            Our Development Team
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <TeamMember {...member} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PayPalButton />
    </main>
  );
}
