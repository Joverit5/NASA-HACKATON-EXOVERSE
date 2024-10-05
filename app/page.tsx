"use client"

import Image from "next/image";
import Navbar from "@/components/ui/navBar";
import exoplanetImage from '/app/exoplanet.jpg'; 
import starsImage from '/app/stars.jpg';
import Head from 'next/head';

export default function Home() {
    return (
        <div>
            <Navbar />  {/* Navbar stays at the top */}
            <div 
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `url(${starsImage.src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'repeat',
                            opacity: 0.5, // Ajusta la opacidad según lo desees
                            zIndex: -1, // Asegura que las estrellas estén detrás de la imagen del exoplaneta
                        }}
                    ></div>
            {/* Main container for text and image side-by-side */}
            <div className="flex items-center justify-between p-14 max-w-7xl mx-auto min-h-screen">
                
                {/* Text on the left */}
                <div className="w-1/2 pr-8">
                    <h1 className="text-4xl font-bold mb-4">Exoplanets</h1>
                    <p className="text-lg" >
                        Exoplanets are planets that orbit stars outside of our solar system.
                        These alien worlds come in various sizes, compositions, and conditions. 
                        Some of them might even host life! The discovery of exoplanets has opened up 
                        a new field in astronomy, revealing thousands of these distant worlds and 
                        expanding our understanding of the universe.
                    </p>
                </div>
                
                {/* Image on the right */}
                <div className="w-1/2">
                    <Image 
                        src={exoplanetImage} 
                        alt="Exoplanet" 
                        width={700} 
                        height={700} 
                        className="object-contain"
                    />
                </div>

                
            </div>

            <div className="p-14 max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold mb-4">A Bit of History...</h2>
                <p className="text-lg">
                    The quest to discover exoplanets dates back to the early 1990s when astronomers began to 
                    detect planets orbiting stars beyond our solar system. The first confirmed discovery came 
                    in 1992, when two planets were found orbiting a pulsar—remnants of a supernova explosion. 
                    But it wasn't until 1995 that the first exoplanet orbiting a Sun-like star was detected. 
                    This breakthrough came with the discovery of 51 Pegasi b, a massive gas giant similar to 
                    Jupiter but much closer to its parent star.
                </p>
                <p className="text-lg mt-4">
                    Since then, advancements in technology, especially space-based observatories like Kepler 
                    and TESS, have revolutionized the search for exoplanets. These missions have revealed that 
                    exoplanets are not rare at all, but rather common throughout the galaxy. Scientists now 
                    estimate that there are more planets than stars in the Milky Way, with billions of them 
                    potentially habitable. This astonishing discovery has profound implications for the 
                    possibility of life elsewhere in the universe and continues to inspire the exploration 
                    of these distant worlds.
                </p>
            </div>
        </div>
    );
}