"use client"

import { useCallback, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim"; 



const CoverParticles = () => {
    const [ init, setInit ] = useState(false);
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
            //await loadBasic(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    return ( 
        init && 
        <div className="w-[0px]"><Particles
        id="tsparticles"
        options={{
            fpsLimit: 120,
            interactivity: {
                events: {
                  onClick: {
                    enable: true,
                    mode: "repulse"
                  },
                  onHover: {
                    enable: true,
                    mode: "bubble"
                  }
                },
                modes: {
                  bubble: {
                    distance: 200,
                    duration: 2,
                    opacity: 1,
                    size: 0,
                    speed: 3
                  },
                  repulse: {
                    distance: 400,
                    duration: 0.4
                  }
                }
              },
              particles: {
                color: { value: "#ffffff" },
                number: {
                  density: {
                    enable: true
                  },
                  value: 600
                },
                opacity: {
                  animation: {
                    enable: true,
                    speed: 5
                  },
                  value: { min: 0.3, max: 1 }
                },
                shape: {
                  type: "circle"
                },
                size: {
                  value: 1
                }
              },
            detectRetina: true,
        }}
    />
    </div>
     );
}
 
export default CoverParticles;