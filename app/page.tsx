"use client"
import Image from "next/image";
import Navbar from "@/components/ui/navBar";
import exoplanetImage from '/app/images/exoplanet.jpg'; 
import starsImage from '/app/images/stars.jpg';
import Lenis from "lenis";
import { useEffect } from "react";

export default function Home() {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            smoothWheel: true,
        });

        lenis.on("scroll", (e) => {
            console.log(e);
        });

        function raf(time:any) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);   
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
                            opacity: 0.5, 
                            zIndex: -1, 
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
                    The history of exoplanet discovery dates back to the early 1990s, when scientists first developed techniques to detect planets orbiting stars beyond our solar system. Before this period, the existence of planets outside of our solar system was purely hypothetical. Although many astronomers believed that exoplanets were likely abundant, none had been directly detected. The breakthrough came in 1992 when two planets were discovered orbiting a pulsar—a highly magnetized, rotating neutron star that emits beams of electromagnetic radiation.
                </p>
                <p className="text-lg mt-4">
                    In 1995, a groundbreaking discovery changed the course of planetary science. Swiss astronomers Michel Mayor and Didier Queloz detected 51 Pegasi b, the first exoplanet found orbiting a Sun-like star. This exoplanet was a "hot Jupiter," a gas giant located extremely close to its parent star, completing an orbit every four days. This discovery confirmed the existence of planetary systems beyond our own and opened the door to further exploration.
                </p>
                <p className="text-lg mt-4">
                    The next major leap in exoplanet research came with the launch of NASA's Kepler Space Telescope in 2009. Kepler was specifically designed to detect Earth-sized planets in the habitable zones of their stars, where conditions might allow for liquid water—and potentially life. Over the course of its mission, Kepler discovered over 2,600 confirmed exoplanets, vastly expanding our knowledge of planetary systems and revealing that small, rocky planets like Earth are common throughout the galaxy.
                </p>
                <p className="text-lg mt-4 mb-20">
                    Today, exoplanet research continues to thrive with missions like NASA's Transiting Exoplanet Survey Satellite (TESS) and the James Webb Space Telescope, which aim to find even more distant and faint exoplanets. Scientists are now focused on studying the atmospheres of these worlds to determine their composition and potential habitability. The discovery of exoplanets has broadened our understanding of the universe and opened exciting possibilities for the search for extraterrestrial life.
                </p>
            </div>
        </div>
    );
}