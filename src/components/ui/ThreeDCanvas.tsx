import { useEffect, useRef, useState, useMemo } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import ThreeErrorBoundary from './ThreeErrorBoundary';

const COLORS = {
  light: { particles: ['#4f46e5', '#6366f1', '#818cf8'], mesh: '79, 70, 229' },
  dark: { particles: ['#818cf8', '#6366f1', '#a5b4fc'], mesh: '129, 140, 248' },
} as const;

function Particles({ shapeMode }: { shapeMode: 'sphere' | 'torus' | 'wave' | 'helix' }) {
  const mode = useThemeStore((s) => s.mode);
  const themeColors = COLORS[mode];
  const count = 180;

  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create arrays for targets
  const targets = useMemo(() => {
    const pts = new Array(count).fill(0).map(() => new THREE.Vector3());
    if (shapeMode === 'sphere') {
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y) * 130;
        const theta = phi * i;
        pts[i].set(Math.cos(theta) * radius, y * 130, Math.sin(theta) * radius);
      }
    } else if (shapeMode === 'torus') {
      const R = 90;
      const r = 35;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 * 6;
        const phi = (i / count) * Math.PI * 2;
        pts[i].set((R + r * Math.cos(theta)) * Math.cos(phi), (R + r * Math.cos(theta)) * Math.sin(phi), r * Math.sin(theta));
      }
    } else if (shapeMode === 'wave') {
      const cols = 15;
      const spacingX = 22;
      const spacingY = 22;
      for (let i = 0; i < count; i++) {
        const c = i % cols;
        const row = Math.floor(i / cols);
        const x = (c - cols / 2) * spacingX;
        const y = (row - (count / cols) / 2) * spacingY;
        pts[i].set(x, y, Math.sin(Math.sqrt(x * x + y * y) * 0.06) * 35);
      }
    } else if (shapeMode === 'helix') {
      for (let i = 0; i < count; i++) {
        const strand = i % 2 === 0 ? 1 : -1;
        const t = (i / count) * Math.PI * 5;
        const rad = 55;
        pts[i].set(Math.cos(t + (strand * Math.PI)) * rad, (i / count - 0.5) * 240, Math.sin(t + (strand * Math.PI)) * rad);
      }
    }
    return pts;
  }, [shapeMode]);

  const currentPositions = useRef(new Array(count).fill(0).map(() => new THREE.Vector3((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300)));
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!meshRef.current) return;
    for (let i = 0; i < count; i++) {
      currentPositions.current[i].lerp(targets[i], 0.05);
      dummy.position.copy(currentPositions.current[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.rotation.y += 0.002;
    meshRef.current.rotation.x += 0.001;
  });

  useEffect(() => {
    if (!meshRef.current) return;
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      color.set(themeColors.particles[i % themeColors.particles.length]);
      meshRef.current.setColorAt(i, color);
    }
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [themeColors]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[3.2, 20, 20]} />
      <meshStandardMaterial vertexColors roughness={0.25} metalness={0.15} />
    </instancedMesh>
  );
}

// CSS fallback if WebGL unavailable
function CSSParticleFallback() {
  return (
    <div className="w-full h-[320px] sm:h-[450px] relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border border-indigo-100 dark:border-indigo-900/40">
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-indigo-400/30 dark:bg-indigo-400/20 animate-float"
          style={{
            width: `${6 + (i % 5) * 4}px`,
            height: `${6 + (i % 5) * 4}px`,
            left: `${(i * 7.3) % 100}%`,
            top: `${(i * 11.7) % 100}%`,
            animationDelay: `${(i * 0.3) % 4}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <span className="text-3xl">🎓</span>
          </div>
          <p className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">Visualisation Interactive</p>
        </div>
      </div>
    </div>
  );
}

export default function ThreeDCanvas() {
  const [shapeMode, setShapeMode] = useState<'sphere' | 'torus' | 'wave' | 'helix'>('sphere');
  const [dpr, setDpr] = useState(1.5);
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const interval = setInterval(() => {
      setShapeMode((current) => {
        if (current === 'sphere') return 'torus';
        if (current === 'torus') return 'wave';
        if (current === 'wave') return 'helix';
        return 'sphere';
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <ThreeErrorBoundary fallback={<CSSParticleFallback />}>
      <div className="w-full h-[320px] sm:h-[450px] relative group select-none">
        <Canvas dpr={dpr} camera={{ position: [0, 0, 400], fov: 45 }} style={{ cursor: 'grab' }}>
          <ambientLight intensity={1.2} />
          <directionalLight position={[150, 150, 150]} intensity={1.5} />
          <pointLight position={[-150, -150, 150]} intensity={0.8} color={mode === 'dark' ? '#818cf8' : '#4f46e5'} />
          <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(2)} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          <Particles shapeMode={shapeMode} />
        </Canvas>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-lg z-20">
          {(['sphere', 'torus', 'wave', 'helix'] as const).map((shape) => (
            <button
              key={shape}
              onClick={() => setShapeMode(shape)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${shapeMode === shape
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
            >
              {shape === 'sphere' ? 'Sphère' : shape === 'torus' ? 'Tore' : shape === 'wave' ? 'Onde' : 'Hélice'}
            </button>
          ))}
        </div>
      </div>
    </ThreeErrorBoundary>
  );
}
