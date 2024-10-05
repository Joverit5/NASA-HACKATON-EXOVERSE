import Navbar from "@/components/ui/navBar";
import keplerImage from "/app/images/kepler.png";
import proximaCentauri from "/app/images/proximaCentauri.png";
import HD from "/app/images/HD.png";
import Pegasi from "/app/images/pegasi.png";
import GJ from "/app/images/gj.png";
import WASP from "/app/images/was.png";
import K2 from "/app/images/K2.png";
import Cancri from "/app/images/Cancri.png";
import HAT from "/app/images/HAT.png";

const exoplanets = [
    {
        name: "Kepler-452b",
        distance: "100 light-years",
        image: keplerImage.src,
    },

    {
        name: "Proxima Centauri b",
        distance: "200 light-years",
        image: proximaCentauri.src,
    },

    {
        name: "HD-2009458b",
        distance: "300 light-years",
        image: HD.src,
    },

    {
        name: "51 Pegasi b",
        distance: "400 light-years",
        image: Pegasi.src,
    },
    {
      name: "GJ 357 d",
      distance: "400 light-years",
      image: GJ.src,
    },
    {
      name: "WASP-127b",
      distance: "400 light-years",
      image: WASP.src,
    },
    {
      name: "K2-18b",
      distance: "400 light-years",
      image: K2.src,
    },
    {
      name: "55 Cancri e",
      distance: "400 light-years",
      image: Cancri.src,
    },
    {
      name: "HAT-P-11b",
      distance: "400 light-years",
      image: HAT.src,
    },
];

export default function Exovis() {
    return (
        <div className="bg-gradient-to-br from-gray-500 to-black-600 min-h-screen">
            <Navbar /> {/* Navbar stays at the top */}
            <div className="p-14 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center text-white">Catalog of Some Exoplanets</h1>
                <div className="flex flex-wrap justify-center relative">
                    {exoplanets.map((planet, index) => (
                        <div key={index} className="bg-black rounded-lg shadow-lg m-4 p-6 w-80">
                            <h2 className="text-xl font-semibold mt-2">{planet.name}</h2>
                            <img src={planet.image} alt={planet.name} className="rounded-lg w-full h-32 object-cover mb-4" />
                            <p className="text-gray-600 mt-2">{planet.distance}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}