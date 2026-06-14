import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import ThreeErrorBoundary from './ThreeErrorBoundary';

function FloatingItem({ geometry, material, bounds = 22 }: any) {
  const meshRef = useRef<THREE.Group>(null);
  
  // Random scale for variety
  const randomScale = useMemo(() => Math.random() * 0.12 + 0.12, []);

  // Initial state for random positioning, drifting velocity, and rotation
  const { pos, vel, rotSpeed, phase } = useMemo(() => {
    // Center-focused with spreads
    return {
      pos: [
        (Math.random() - 0.5) * bounds,
        (Math.random() - 0.5) * (bounds * 0.7),
        (Math.random() - 0.5) * 8 - 4
      ],
      vel: [
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.002
      ],
      rotSpeed: [
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      ],
      phase: Math.random() * Math.PI * 2
    };
  }, [bounds]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Avoid huge jumps when tab is inactive
      const timeScale = Math.min(delta * 60, 2);
      const time = state.clock.getElapsedTime();
      
      // Slow fluid circulation/drift
      meshRef.current.position.x += vel[0] * timeScale + Math.sin(time * 0.5 + phase) * 0.0015 * timeScale;
      meshRef.current.position.y += vel[1] * timeScale + Math.cos(time * 0.5 + phase) * 0.0015 * timeScale;
      meshRef.current.position.z += vel[2] * timeScale;

      // Gentle rotation
      meshRef.current.rotation.x += rotSpeed[0] * timeScale;
      meshRef.current.rotation.y += rotSpeed[1] * timeScale;
      meshRef.current.rotation.z += rotSpeed[2] * timeScale;

      // Wrap around bounds (bounds represents visible box size)
      const halfW = bounds / 2;
      const halfH = (bounds * 0.75) / 2;
      
      if (meshRef.current.position.x > halfW) meshRef.current.position.x = -halfW;
      if (meshRef.current.position.x < -halfW) meshRef.current.position.x = halfW;
      
      if (meshRef.current.position.y > halfH) meshRef.current.position.y = -halfH;
      if (meshRef.current.position.y < -halfH) meshRef.current.position.y = halfH;
    }
  });

  return (
    <group ref={meshRef} position={pos as [number, number, number]} scale={randomScale}>
      {geometry(material)}
    </group>
  );
}

function AnimatedScene() {
  const items = useMemo(() => {
    // Subtle colors with low opacity and high transmission for glassmorphism look
    const materials = {
      brandLight: <meshPhysicalMaterial color="#818cf8" transmission={0.95} opacity={0.25} transparent roughness={0.1} thickness={0.4} clearcoat={1} />,
      brandPrimary: <meshPhysicalMaterial color="#6366f1" transmission={0.95} opacity={0.25} transparent roughness={0.1} thickness={0.4} clearcoat={1} />,
      brandMedium: <meshPhysicalMaterial color="#4f46e5" transmission={0.9} opacity={0.2} transparent roughness={0.2} thickness={0.4} />,
      brandDark: <meshPhysicalMaterial color="#4338ca" transmission={0.9} opacity={0.2} transparent roughness={0.2} thickness={0.4} />,
      brandDeep: <meshPhysicalMaterial color="#3730a3" transmission={0.9} opacity={0.2} transparent roughness={0.1} thickness={0.2} />
    };

    // Graduation Cap (Mortarboard) Geometry Builder
    const geometries = [
      (mat: any) => (
        <group>
          {/* Square flat top cap */}
          <mesh position={[0, 0.12, 0]} material={mat}>
            <boxGeometry args={[1.5, 0.05, 1.5]} />
          </mesh>
          {/* Head band (base) */}
          <mesh position={[0, -0.08, 0]} material={mat}>
            <cylinderGeometry args={[0.5, 0.55, 0.35, 16]} />
          </mesh>
          {/* Central button on top */}
          <mesh position={[0, 0.16, 0]} material={mat}>
            <sphereGeometry args={[0.08, 8, 8]} />
          </mesh>
          {/* Tassel cord (pointing slightly down and out) */}
          <mesh position={[0.4, 0.1, 0.4]} rotation={[0.2, 0, -0.2]} material={mat}>
            <boxGeometry args={[0.8, 0.02, 0.02]} />
          </mesh>
          {/* Tassel fringe hanging piece */}
          <mesh position={[0.78, 0.0, 0.4]} material={mat}>
            <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
          </mesh>
        </group>
      )
    ];

    const generated = [];
    const matKeys = Object.keys(materials);
    
    // Generate 32 floating caps
    for (let i = 0; i < 32; i++) {
      const geoParams = geometries[Math.floor(Math.random() * geometries.length)];
      const mat = materials[matKeys[Math.floor(Math.random() * matKeys.length)] as keyof typeof materials];
      generated.push(<FloatingItem key={i} geometry={geoParams} material={mat} bounds={22} />);
    }
    
    return generated;
  }, []);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, -10, -5]} intensity={0.6} color="#818cf8" />
      
      {items}
      
      <Environment preset="city" />
    </>
  );
}

export default function Hero3DBackground() {
  return (
    <ThreeErrorBoundary>
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.25]">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <AnimatedScene />
          </Suspense>
        </Canvas>
      </div>
    </ThreeErrorBoundary>
  );
}
