"use client"
import Image from "next/image";
import Navbar from "@/components/ui/navBar";
import exoplanetImage from '/app/images/exoplanet.jpg'; 
import starsImage from '/app/images/stars.jpg';
import Lenis from "lenis";
import { useEffect } from "react";
import David from "/app/images/David.png";
import Santiago from "/app/images/Santiago.jpg"
import Fabian from "/app/images/Fabián.jpg";
import Eduardo from "/app/images/Eduardo.jpg"
import Isabella from "/app/images/Isabella.jpg";
import Jose from "/app/images/Jose.jpg";
import grupalPhoto from "/app/images/grupal.jpg";
import { BookOpen, Brain, Palette, Telescope } from 'lucide-react';

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
        <div className="bg-black text-white">
            <Navbar />
            
            {/* Exoplanets Section with Stars Background */}
            <div className="relative">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                    style={{
                        backgroundImage: `url(${starsImage.src})`,
                    }}
                ></div>
                <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-14 max-w-7xl mx-auto min-h-screen relative z-10">
                    <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-6 md:mb-0">
                        <h1 className="text-4xl font-bold mb-4">Exoplanets</h1>
                        <p className="text-lg">
                            Exoplanets are planets that orbit stars outside of our solar system.
                            These alien worlds come in various sizes, compositions, and conditions. 
                            Some of them might even host life! The discovery of exoplanets has opened up 
                            a new field in astronomy, revealing thousands of these distant worlds and 
                            expanding our understanding of the universe.
                        </p>
                    </div>
                    <div className="w-full md:w-1/2">
                        <Image 
                            src={exoplanetImage} 
                            alt="Exoplanet" 
                            width={700} 
                            height={700} 
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>

            {/* A Bit of History Section */}
            <div className="p-6 md:p-14 max-w-7xl mx-auto">
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
                <p className="text-lg mt-4">
                    Today, exoplanet research continues to thrive with missions like NASA's Transiting Exoplanet Survey Satellite (TESS) and the James Webb Space Telescope, which aim to find even more distant and faint exoplanets. Scientists are now focused on studying the atmospheres of these worlds to determine their composition and potential habitability. The discovery of exoplanets has broadened our understanding of the universe and opened exciting possibilities for the search for extraterrestrial life.
                </p>
            </div>

            {/* What ExoVerse Does Section with Stars Background */}
            <div className="relative p-6 md:p-14">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                    style={{
                        backgroundImage: `url(${starsImage.src})`,
                    }}
                ></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <section id="what-we-do" className="mb-14">
                        <h2 className="text-4xl font-bold mb-6 text-center">What ExoVerse Does</h2>
                        <p className="mb-10 text-lg text-center">
                            ExoVerse invites you on an exciting journey through the vast realm of exoplanets, offering:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <BookOpen className="w-12 h-12 mb-4 text-blue-400" />
                                <h3 className="text-xl font-semibold mb-2">Information Hub</h3>
                                <p>A fascinating resource that unveils the basics and captivating history of exoplanets.</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Brain className="w-12 h-12 mb-4 text-green-400" />
                                <h3 className="text-xl font-semibold mb-2">ExoQuest</h3>
                                <p>An interactive trivia adventure that challenges and expands your cosmic knowledge.</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Palette className="w-12 h-12 mb-4 text-purple-400" />
                                <h3 className="text-xl font-semibold mb-2">ExoCreator</h3>
                                <p>A unique tool empowering you to craft your own exoplanets, fueling your creativity and understanding of the cosmos.</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Telescope className="w-12 h-12 mb-4 text-red-400" />
                                <h3 className="text-xl font-semibold mb-2">ExoVis</h3>
                                <p>A dynamic portal connecting you to the latest exoplanet discoveries, keeping you at the forefront of astronomical breakthroughs.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Benefits and Aspirations Section */}
            <div className="p-6 md:p-14 max-w-7xl mx-auto text-white">
                <section id="benefits" className="mb-14">
                    <h2 className="text-4xl font-bold mb-6">Benefits and Aspirations</h2>
                    <p className="mb-4 text-lg">
                        ExoVerse breaks barriers and transcends traditional education by offering:
                    </p>
                    <ul className="list-disc pl-6">
                        <li className="mb-4 text-lg"><strong>Accessibility:</strong> Breaking down obstacles to space education, making it available to underserved communities and igniting curiosity across diverse backgrounds.</li>
                        <li className="mb-4 text-lg"><strong>Engagement:</strong> Transforming complex astronomical concepts into exciting, digestible content that captivates learners of all ages.</li>
                        <li className="mb-4 text-lg"><strong>Inspiration:</strong> Fostering a passion for astronomy and planetary sciences in the next generation of space enthusiasts.</li>
                        <li className="mb-4 text-lg"><strong>Scientific Literacy:</strong> Enhancing public understanding of exoplanets and their relevance in our quest to comprehend the universe.</li>
                        <li className="mb-4 text-lg"><strong>Community Building:</strong> Bringing people together through the wonder of cosmic exploration, creating a shared space for learning and discovery.</li>
                    </ul>
                </section>
            </div>

            {/* Development Team Section with Stars Background */}
            <div className="relative p-6 md:p-14">
                <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
                    style={{
                        backgroundImage: `url(${starsImage.src})`,
                    }}
                ></div>
                <div className="max-w-7xl mx-auto relative z-10">
                    <section id="team" className="mb-14">
                        <h2 className="text-4xl font-bold mb-6 text-center">Our Development Team</h2>
                        <p className="mb-5 text-center">We are a team of fifth-semester systems engineering students from the Universidad Tecnológica de Bolívar (UTB), driven by our passion for innovation and space exploration. We are also members of the Astronomy and Data Science Research Group in the Faculty of Basic Sciences.</p>
                        <p className="mb-10 text-center">The research group aims to foster investigations in areas related to astronomy and data science, providing students with opportunities to develop innovative technological solutions for global challenges. Learn more about the <a href="https://www.utb.edu.co/investigacion/apoyo-a-la-investigacion/semilleros-de-investigacion/semillero-astronomia-ciencia-de-datos/" className="underline">group</a>.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image src={David} alt="David" width={200} height={200} className="rounded-full mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-center">David Sierra Porta</h3>
                                <p className="text-center text-gray-400">dporta@utb.edu.co</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image src={Santiago} alt="Santiago" width={200} height={200} className="rounded-full mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Santiago Quintero Pareja</h3>
                                <p className="text-center text-gray-400">squintero@utb.edu.co</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image src={Fabian} alt="Fabián" width={200} height={200} className="rounded-full mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Fabián Camilo Quintero Pareja</h3>
                                <p className="text-center text-gray-400">parejaf@utb.edu.co</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image src={Eduardo} alt="Eduardo" width={200} height={200} className="rounded-full mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Eduardo Alejandro Negrín Pérez</h3>
                                <p className="text-center text-gray-400">enegrin@utb.edu.co</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image src={Isabella} alt="Isabella" width={200} height={200} className="rounded-full mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-center">Isabella Sofía Arrieta Guardo</h3>
                                <p className="text-center text-gray-400">arrietai@utb.edu.co</p>
                            </div>
                            <div className="bg-gray-800 rounded-lg p-6 shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image src={Jose} alt="José" width={200} height={200} className="rounded-full mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2 text-center">José Fernando González Ortiz</h3>
                                <p className="text-center text-gray-400">joseortiz@utb.edu.co</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}