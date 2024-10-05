import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  radius: number;
  widthSegments: number;
  heightSegments: number;
  color: string;
}

const Planet: React.FC<PlanetProps> = ({ radius, widthSegments, heightSegments, color }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, widthSegments, heightSegments]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const App: React.FC = () => {
  const [radius, setRadius] = React.useState(1);
  const [widthSegments, setWidthSegments] = React.useState(32);
  const [heightSegments, setHeightSegments] = React.useState(32);
  const [color, setColor] = React.useState('#ff0000');

  return (
    <div>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Planet radius={radius} widthSegments={widthSegments} heightSegments={heightSegments} color={color} />
        <OrbitControls />
      </Canvas>
      <div>
        <label>
          Radio:
          <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
        </label>
        <label>
          Segmentos de Ancho:
          <input type="number" value={widthSegments} onChange={(e) => setWidthSegments(Number(e.target.value))} />
        </label>
        <label>
          Segmentos de Alto:
          <input type="number" value={heightSegments} onChange={(e) => setHeightSegments(Number(e.target.value))} />
        </label>
        <label>
          Color:
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
    </div>
  );
};

export default App;