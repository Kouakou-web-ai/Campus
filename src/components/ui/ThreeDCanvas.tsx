import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../store/themeStore';

interface Particle {
  x: number;
  y: number;
  z: number;
  tx: number;
  ty: number;
  tz: number;
  color: string;
}

const COLORS = {
  light: { particles: ['#6366f1', '#a855f7', '#06b6d4'], mesh: '99, 102, 241' },
  dark: { particles: ['#ffffff', '#cbd5e1', '#38bdf8'], mesh: '255, 255, 255' },
} as const;

export default function ThreeDCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shapeMode, setShapeMode] = useState<'sphere' | 'torus' | 'wave' | 'helix'>('sphere');
  const mode = useThemeStore((s) => s.mode);
  const themeColors = COLORS[mode];
  const themeRef = useRef(themeColors);

  themeRef.current = themeColors;

  const particles = useRef<Particle[]>([]);
  const rotation = useRef({ x: 0, y: 0 });
  const mouse = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isDown: false, lastX: 0, lastY: 0 });
  const morphProgress = useRef(1.0);

  // Initialize particles
  const initParticles = () => {
    const count = 180; // Increased count for richer density
    const pts: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const colorIndex = i % themeRef.current.particles.length;
      pts.push({
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        z: (Math.random() - 0.5) * 300,
        tx: 0,
        ty: 0,
        tz: 0,
        color: themeRef.current.particles[colorIndex],
      });
    }
    particles.current = pts;
    applyShape('sphere');
  };

  // Define target shapes
  const applyShape = (mode: 'sphere' | 'torus' | 'wave' | 'helix') => {
    const pts = particles.current;
    const count = pts.length;
    if (count === 0) return;

    if (mode === 'sphere') {
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y) * 130;
        const theta = phi * i;
        pts[i].tx = Math.cos(theta) * radius;
        pts[i].ty = y * 130;
        pts[i].tz = Math.sin(theta) * radius;
      }
    } else if (mode === 'torus') {
      const R = 90;
      const r = 35;
      for (let i = 0; i < count; i++) {
        const theta = (i / count) * Math.PI * 2 * 6;
        const phi = (i / count) * Math.PI * 2;
        pts[i].tx = (R + r * Math.cos(theta)) * Math.cos(phi);
        pts[i].ty = (R + r * Math.cos(theta)) * Math.sin(phi);
        pts[i].tz = r * Math.sin(theta);
      }
    } else if (mode === 'wave') {
      const cols = 15;
      const spacingX = 22;
      const spacingY = 22;
      for (let i = 0; i < count; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const x = (c - cols / 2) * spacingX;
        const y = (r - (count / cols) / 2) * spacingY;
        pts[i].tx = x;
        pts[i].ty = y;
        pts[i].tz = Math.sin(Math.sqrt(x*x + y*y) * 0.06) * 35;
      }
    } else if (mode === 'helix') {
      for (let i = 0; i < count; i++) {
        const strand = i % 2 === 0 ? 1 : -1;
        const t = (i / count) * Math.PI * 5;
        const r = 55;
        pts[i].tx = Math.cos(t + (strand * Math.PI)) * r;
        pts[i].ty = (i / count - 0.5) * 240;
        pts[i].tz = Math.sin(t + (strand * Math.PI)) * r;
      }
    }
    morphProgress.current = 0;
  };

  useEffect(() => {
    initParticles();
  }, []);

  // Update colors when theme change
  useEffect(() => {
    particles.current.forEach((p, i) => {
      const colorIndex = i % themeColors.particles.length;
      p.color = themeColors.particles[colorIndex];
    });
  }, [mode, themeColors.particles]);

  useEffect(() => {
    applyShape(shapeMode);
  }, [shapeMode]);

  // Autoplay cycle through shapes
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width;
    let height = canvas.height;

    const resize = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const fov = 400;

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Inertia rotation
      mouse.current.x += (mouse.current.targetX - mouse.current.x) * 0.08;
      mouse.current.y += (mouse.current.targetY - mouse.current.y) * 0.08;

      if (!mouse.current.isDown) {
        rotation.current.y += 0.003 + mouse.current.x * 0.0001;
        rotation.current.x += 0.0015 + mouse.current.y * 0.0001;
      } else {
        rotation.current.y += mouse.current.x * 0.004;
        rotation.current.x += mouse.current.y * 0.004;
      }

      const cosY = Math.cos(rotation.current.y);
      const sinY = Math.sin(rotation.current.y);
      const cosX = Math.cos(rotation.current.x);
      const sinX = Math.sin(rotation.current.x);

      if (morphProgress.current < 1.0) {
        morphProgress.current += 0.02;
        if (morphProgress.current > 1.0) morphProgress.current = 1.0;
      }

      const pts = particles.current;
      const projected: { x: number; y: number; z: number; color: string }[] = [];

      // Update, rotate and project particles
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += (p.tx - p.x) * 0.07;
        p.y += (p.ty - p.y) * 0.07;
        p.z += (p.tz - p.z) * 0.07;

        // Y-axis rotation
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // X-axis rotation
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // Interactive mouse push
        const dx = x1 - mouse.current.x * 60;
        const dy = y2 - mouse.current.y * 60;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 110) {
          const force = (110 - dist) * 0.12;
          x1 += (dx / dist) * force;
          y2 += (dy / dist) * force;
        }

        const scale = fov / (fov + z2);
        const projX = width / 2 + x1 * scale;
        const projY = height / 2 + y2 * scale;

        projected.push({ x: projX, y: projY, z: z2, color: p.color });
      }

      // Draw mesh connection lines
      ctx.lineWidth = 0.45;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const distSq = Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);

          if (distSq < 2800) {
            const opacity = (1 - Math.sqrt(distSq) / 52.9) * 0.14;
            ctx.strokeStyle = `rgba(${themeRef.current.mesh}, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle points (Z-ordered glow)
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const size = Math.max(0.8, ((fov - p.z) / fov) * 2.8);

        ctx.fillStyle = p.color;
        if (p.z < -20) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = p.color;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    if (mouse.current.isDown) {
      const deltaX = e.clientX - mouse.current.lastX;
      const deltaY = e.clientY - mouse.current.lastY;
      mouse.current.targetX = deltaX * 0.08;
      mouse.current.targetY = deltaY * 0.08;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;
    } else {
      mouse.current.targetX = x;
      mouse.current.targetY = y;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    mouse.current.isDown = true;
    mouse.current.lastX = e.clientX;
    mouse.current.lastY = e.clientY;
  };

  const handleMouseUp = () => {
    mouse.current.isDown = false;
    mouse.current.targetX = 0;
    mouse.current.targetY = 0;
  };

  return (
    <div ref={containerRef} className="w-full h-[320px] sm:h-[450px] relative group select-none">
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Control selectors */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-1 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-lg z-20">
        {(['sphere', 'torus', 'wave', 'helix'] as const).map((shape) => (
          <button
            key={shape}
            onClick={() => setShapeMode(shape)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
              shapeMode === shape
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100/50 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {shape === 'sphere' ? 'Sphère' : shape === 'torus' ? 'Tore' : shape === 'wave' ? 'Onde' : 'Hélice'}
          </button>
        ))}
      </div>
    </div>
  );
}
