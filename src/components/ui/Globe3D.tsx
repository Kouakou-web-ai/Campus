import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// University dots on sphere surface (lon/lat converted to XYZ)
const UNIVERSITY_POINTS = [
  { lat: 5.35, lon: -4.0 },   // Abidjan
  { lat: 6.82, lon: -5.27 },  // Bouaké
  { lat: 7.69, lon: -5.03 },  // Korhogo
  { lat: 5.85, lon: -5.37 },  // San Pédro
  { lat: 6.37, lon: -6.55 },  // Man
  { lat: 6.9,  lon: -5.62 },  // Yamoussoukro
  { lat: 7.48, lon: -7.65 },  // Odienné
];

function latLonToXYZ(lat: number, lon: number, radius: number = 1.01) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.y += delta * 0.15;
    if (pointsRef.current) pointsRef.current.rotation.y += delta * 0.15;
  });

  const positions = new Float32Array(
    UNIVERSITY_POINTS.flatMap(({ lat, lon }) => {
      const v = latLonToXYZ(lat, lon);
      return [v.x, v.y, v.z];
    })
  );

  return (
    <>
      {/* Globe wireframe */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Inner glow sphere */}
      <Sphere args={[0.98, 32, 32]}>
        <meshStandardMaterial
          color="#4f46e5"
          transparent
          opacity={0.06}
        />
      </Sphere>

      {/* University points */}
      <Points ref={pointsRef} positions={positions}>
        <PointMaterial
          size={0.06}
          color="#a5b4fc"
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </Points>
    </>
  );
}

interface Globe3DProps {
  className?: string;
}

export default function Globe3D({ className = '' }: Globe3DProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2.8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-5, -3, -5]} intensity={0.4} color="#c4b5fd" />
        <Suspense fallback={null}>
          <GlobeMesh />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI * 0.3}
          maxPolarAngle={Math.PI * 0.7}
        />
      </Canvas>
    </div>
  );
}
