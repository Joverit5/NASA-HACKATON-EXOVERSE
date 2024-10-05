import Navbar from "@/components/ui/navBar";

export default function Exovis() {
    // Datos de ejemplo con distancias en años luz
    const exoplanets = [
        { name: 'Kepler-452b', distance: '1,400 light years' },
        { name: 'Proxima Centauri b', distance: '4.24 light years' },
        { name: 'TRAPPIST-1d', distance: '39 light years' },
        { name: 'HD 209458 b', distance: '150 light years' },
        { name: 'Gliese 581g', distance: '20.3 light years' },
        { name: 'LHS 1140 b', distance: '40 light years' },
        { name: 'HD 40307 g', distance: '42 light years' },
        { name: 'WASP-121 b', distance: '850 light years' },
        { name: 'LHS 3844 b', distance: '48 light years' },
        { name: 'K2-18 b', distance: '124 light years' },
        { name: 'GJ 357 d', distance: '31 light years' },
        { name: 'LHS 2665 b', distance: '37 light years' },
    ];

    return (
        <div>
          <div className="bg-gradient-to-br from-gray}-500 to-black-600">
            <Navbar /> {/* Navbar stays at the top */}
            <div className="p-14 max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Exoplanets Timeline</h1>
                
                <div className="flex flex-wrap justify-center relative">
                    {exoplanets.map((planet, index) => (
                        <div key={planet.name} className="flex flex-col items-center mb-16 mx-4">
                            {/* Tarjeta del exoplaneta - Aumentando el tamaño */}
                            <div className="bg-white shadow-lg p-8 rounded-lg text-center w-80 h-40">
                                <h2 className="text-2xl font-bold mb-2">{planet.name}</h2>
                                <p className="text-gray-600">{planet.distance}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>

    );
}