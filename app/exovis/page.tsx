"use client"
import Image from 'next/image';
import Navbar2 from "@/components/ui/navBar2";
import keplerImage from "/app/images/kepler.png";
import proximaCentauri from "/app/images/proximaCentauri.png";
import HD from "/app/images/HD.png";
import Pegasi from "/app/images/pegasi.png";
import GJ from "/app/images/gj.png";
import WASP from "/app/images/was.png";
import K2 from "/app/images/K2.png";
import Cancri from "/app/images/Cancri.png";
import HAT from "/app/images/HAT.png";
import starsImage from "/app/images/stars2.jpg";
import Lenis from 'lenis';
import { useEffect } from "react";

const exoplanets = [
    {
        name: "Kepler-452b",
        distance: "1,800 light-years",
        image: keplerImage,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/Kepler-452_b"
    },
    {
        name: "Proxima Centauri b",
        distance: "4 light-years",
        image: proximaCentauri,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/Proxima_Cen_b"
    },
    {
        name: "HD-209458b",
        distance: "159 light-years",
        image: HD,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/HD_209458_b"
    },
    {
        name: "51 Pegasi b",
        distance: "50 light-years",
        image: Pegasi,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/51_Peg_b"
    },
    {
        name: "GJ 357 d",
        distance: "30.8 light-years",
        image: GJ,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/GJ_357_d"
    },
    {
        name: "WASP-127b",
        distance: "522.6 light-years",
        image: WASP,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/WASP-127_b"
    },
    {
        name: "K2-18b",
        distance: "124 light-years",
        image: K2,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/K2-18_b"
    },
    {
        name: "55 Cancri e",
        distance: "40 light-years",
        image: Cancri,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/55_Cnc_e"
    },
    {
        name: "HAT-P-11b",
        distance: "123 light-years",
        image: HAT,
        info: "https://eyes.nasa.gov/apps/exo/#/planet/HAT-P-11_b"
    },
];

export default function Exovis() {
    useEffect(() => {
        const lenis = new Lenis();
    
        lenis.on("scroll", e => {
          console.log(e);
        });
    
        function raf(time:any) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }
    
        requestAnimationFrame(raf);
      }, []);
    return (        
        <div className="min-h-screen w-full">
            <div className="fixed inset-0 z-0">
                <Image
                    src={starsImage}
                    alt="Space background"
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                    priority
                />
            </div>
            <div className="relative z-10 min-h-screen bg-black bg-opacity-50">
                <Navbar2 />
                <div className="p-4 md:p-14 max-w-7xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white">Catalog of Some Exoplanets</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 relative">
                        {exoplanets.map((planet, index) => (
                            <div key={index} className="relative">
                                {index < exoplanets.length - 1 && (
                                    <div className={`absolute hidden sm:block z-0 ${getLineClass(index)}`}></div>
                                )}
                                <div className="bg-gray-800 bg-opacity-80 text-white rounded-lg shadow-lg p-4 flex flex-col items-center h-full relative z-10 mb-10">
                                <h2 className="text-xl font-semibold mt-2 mb-3">{planet.name}</h2>
                                <div className="relative w-full aspect-square mb-3">
                                    <Image 
                                        src={planet.image} 
                                        alt={planet.name} 
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-lg"
                                    />
                                </div>
                                <p className="mb-2">{planet.distance}</p>
                                <a href={planet.info} className="text-blue-400 hover:text-blue-300 mt-2 text-lg font-bold">More information...</a>
                            </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function getLineClass(index: number) {
    const baseClass = "bg-white";
    switch (index % 6) {
        case 0: return `${baseClass} w-full h-0.5 top-1/2 left-1/2`;
        case 1: return `${baseClass} w-full h-0.5 top-1/2 -right-1/2`;
        case 2: return `${baseClass} w-0.5 h-full left-1/2 top-1/2`;
        case 3: return `${baseClass} w-0.5 h-20 left-1/2 transform -translate-x-1/2 top-full`;
        case 4: return `${baseClass} w-full h-0.5 top-1/2 left-1/2`;
        case 5: return `${baseClass} w-0.5 h-full left-1/2 -top-1/2`;
        default: return '';
    }
}