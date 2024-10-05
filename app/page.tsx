import Image from "next/image";
import Navbar from "@/components/ui/navBar";
import exoplanetImage from '/app/exoplanet.jpg'; // Ensure the image path is correct

export default function Home() {
    return (
        <div>
            <Navbar />  {/* Navbar stays at the top */}

            {/* Main container for text and image side-by-side */}
            <div className="flex items-center justify-between p-14 max-w-7xl mx-auto min-h-screen">
                
                {/* Text on the left */}
                <div className="w-1/2 pr-8">
                    <h1 className="text-4xl font-bold mb-4">Exoplanets</h1>
                    <p className="text-lg">
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
        </div>
    );
}
