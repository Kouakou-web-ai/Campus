import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

function FloatingItem({ geometry, material, speed = 1, bounds = 15 }: any) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Initial state for random positioning and velocity
  const { pos, vel, rotSpeed } = useMemo(() => {
    return {
      pos: [
        (Math.random() - 0.5) * bounds,
        (Math.random() - 0.5) * (bounds * 0.8),
        (Math.random() - 0.5) * 5 - 2
      ],
      vel: [
        (Math.random() - 0.5) * 0.02 * speed,
        (Math.random() - 0.5) * 0.02 * speed,
        0
      ],
      rotSpeed: [
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.02
      ]
    };
  }, [bounds, speed]);

  useFrame(() => {
    if (meshRef.current) {
      // Update position for continuous scrolling
      meshRef.current.position.x += vel[0];
      meshRef.current.position.y += vel[1];
      
      // Update rotation
      meshRef.current.rotation.x += rotSpeed[0];
      meshRef.current.rotation.y += rotSpeed[1];
      meshRef.current.rotation.z += rotSpeed[2];

      // Wrap around the screen if it goes too far
      const halfBounds = bounds / 2;
      if (meshRef.current.position.x > halfBounds) meshRef.current.position.x = -halfBounds;
      if (meshRef.current.position.x < -halfBounds) meshRef.current.position.x = halfBounds;
      if (meshRef.current.position.y > halfBounds) meshRef.current.position.y = -halfBounds;
      if (meshRef.current.position.y < -halfBounds) meshRef.current.position.y = halfBounds;
    }
  });

  return (
    <group ref={meshRef} position={pos as [number, number, number]}>
      {geometry(material)}
    </group>
  );
}

function AnimatedScene() {
  const items = useMemo(() => {
    const materials = {
      brandLight: <meshPhysicalMaterial color="#818cf8" transmission={0.9} opacity={1} transparent roughness={0.2} thickness={0.5} clearcoat={1} />,
      brandPrimary: <meshPhysicalMaterial color="#6366f1" transmission={0.9} opacity={1} transparent roughness={0.2} thickness={0.5} clearcoat={1} />,
      brandMedium: <meshPhysicalMaterial color="#4f46e5" transmission={0.8} opacity={1} transparent roughness={0.3} thickness={0.5} />,
      brandDark: <meshPhysicalMaterial color="#4338ca" transmission={0.8} opacity={1} transparent roughness={0.3} thickness={0.5} />,
      brandDeep: <meshPhysicalMaterial color="#3730a3" transmission={0.8} opacity={1} transparent roughness={0.2} thickness={0.2} />
    };

    const geometries = [
      // Book
      (mat: any) => <mesh scale={0.3} material={mat}><boxGeometry args={[1.5, 2, 0.2]} /></mesh>,
      // Pencil
      (mat: any) => (
        <group scale={0.35}>
          <mesh material={mat}><cylinderGeometry args={[0.1, 0.1, 1.5, 6]} /></mesh>
          <mesh position={[0, 0.85, 0]}><coneGeometry args={[0.1, 0.3, 6]} /><meshPhysicalMaterial color="#475569" transmission={0.8} roughness={0.2} /></mesh>
        </group>
      ),
      // Folder
      (mat: any) => (
        <group scale={0.3}>
          <mesh material={mat}><boxGeometry args={[1.8, 1.4, 0.1]} /></mesh>
          <mesh position={[0.1, -0.1, 0.1]}><boxGeometry args={[1.7, 1.3, 0.05]} /><meshPhysicalMaterial color="#a5b4fc" transmission={0.8} roughness={0.2} thickness={0.2} /></mesh>
        </group>
      ),
      // Abstract Rings
      (mat: any) => (
        <group scale={0.35}>
          <mesh material={mat}><torusGeometry args={[0.5, 0.15, 16, 32]} /></mesh>
          <mesh><sphereGeometry args={[0.3, 32, 32]} /><meshPhysicalMaterial color="#818cf8" transmission={0.5} roughness={0.2} /></mesh>
        </group>
      )
    ];

    const generated = [];
    const matKeys = Object.keys(materials);
    
    // Generate 35 floating items
    for (let i = 0; i < 35; i++) {
      const geoParams = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = materials[matKeys[Math.floor(Math.random() * matKeys.length)] as keyof typeof materials];
      generated.push(<FloatingItem key={i} geometry={geoParams} material={mat} speed={Math.random() * 2 + 0.5} bounds={22} />);
    }
    
    return generated;
  }, []);

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#818cf8" />
      
      {items}
      
      <Environment preset="city" />
    </>
  );
}

export default function Hero3DBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.8]">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <AnimatedScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
