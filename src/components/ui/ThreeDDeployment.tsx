import { useEffect, useRef } from 'react';
import { useThemeStore } from '../../store/themeStore';

export default function ThreeDDeployment() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mode = useThemeStore((s) => s.mode);

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

    // Grid details
    const cols = 28;
    const rows = 18;
    const totalPoints = cols * rows;
    const spacing = 26;
    const fov = 300;

    // Generate normalized text points for "KAYIM"
    const generateTextPoints = (targetCount: number): { x: number; y: number }[] => {
      const offscreen = document.createElement('canvas');
      const ow = 300;
      const oh = 100;
      offscreen.width = ow;
      offscreen.height = oh;
      const octx = offscreen.getContext('2d');
      if (!octx) return [];

      octx.fillStyle = '#000';
      octx.fillRect(0, 0, ow, oh);
      octx.fillStyle = '#fff';
      octx.font = 'bold 50px sans-serif';
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText('KAYIM', ow / 2, oh / 2);

      const imgData = octx.getImageData(0, 0, ow, oh);
      const data = imgData.data;

      const candidates: { x: number; y: number }[] = [];
      for (let y = 0; y < oh; y++) {
        for (let x = 0; x < ow; x++) {
          const idx = (y * ow + x) * 4;
          if (data[idx] > 128) {
            candidates.push({
              x: (x - ow / 2) / (ow / 2),
              y: (y - oh / 2) / (oh / 2),
            });
          }
        }
      }

      if (candidates.length === 0) {
        for (let i = 0; i < targetCount; i++) {
          candidates.push({
            x: Math.sin((i / targetCount) * Math.PI * 2),
            y: Math.cos((i / targetCount) * Math.PI * 2),
          });
        }
      }

      const points: { x: number; y: number }[] = [];
      for (let i = 0; i < targetCount; i++) {
        const index = Math.floor((i / targetCount) * candidates.length);
        points.push(candidates[index]);
      }
      return points;
    };

    const textPoints = generateTextPoints(totalPoints);

    // Precompute connections for the text particles to draw wireframe
    const textConnections: [number, number][] = [];
    const maxDist = 0.09; // normalized distance threshold
    for (let i = 0; i < textPoints.length; i++) {
      for (let j = i + 1; j < textPoints.length; j++) {
        const dx = textPoints[i].x - textPoints[j].x;
        const dy = textPoints[i].y - textPoints[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          textConnections.push([i, j]);
        }
      }
    }

    let time = 0;
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouse.targetX = x * 150;
      mouse.targetY = y * 150;
    };

    window.addEventListener('mousemove', handleMouseMove);

    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const renderLoop = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        time += 0.06;

        // Cycle between Wave (5s), Transition (2s), Text (5s), Transition (2s)
        const cycleTime = 14;
        const currentSec = (time * 0.7) % cycleTime;
        let morphProgress = 0;

        if (currentSec < 5) {
          morphProgress = 0;
        } else if (currentSec < 7) {
          const t = (currentSec - 5) / 2;
          morphProgress = t * t * (3 - 2 * t);
        } else if (currentSec < 12) {
          morphProgress = 1;
        } else {
          const t = (currentSec - 12) / 2;
          morphProgress = 1 - t * t * (3 - 2 * t);
        }

        mouse.x += (mouse.targetX - mouse.x) * 0.1;
        mouse.y += (mouse.targetY - mouse.y) * 0.1;

        const isDark = mode === 'dark';
        const color1 = isDark ? '#818cf8' : '#4f46e5'; // Indigo
        const color2 = isDark ? '#c084fc' : '#9333ea'; // Purple

        // Parse colors once per frame to optimize performance
        const r1 = parseInt(color1.substring(1, 3), 16);
        const g1 = parseInt(color1.substring(3, 5), 16);
        const b1 = parseInt(color1.substring(5, 7), 16);

        const r2 = parseInt(color2.substring(1, 3), 16);
        const g2 = parseInt(color2.substring(3, 5), 16);
        const b2 = parseInt(color2.substring(5, 7), 16);

        const textScaleX = Math.min(width * 0.35, 230);
        const textScaleY = Math.min(height * 0.35, 80);

        const projectedPoints: { x: number; y: number; z: number; color: string }[] = [];

        // Calculate particle positions and project them
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;

            // Wave coordinate
            const wx = (c - cols / 2) * spacing;
            const wy = (r - rows / 2) * spacing;
            const dist = Math.sqrt(wx * wx + wy * wy);
            let wz = Math.sin(dist * 0.04 - time) * 35;
            wz += Math.cos(wx * 0.02 + time) * 15;

            // Text coordinate
            const tp = textPoints[idx];
            const tx = tp.x * textScaleX;
            const ty = tp.y * textScaleY;
            const tz = Math.sin(tp.x * 5 + time) * 8;

            // Blend positions based on morphProgress
            let bx = wx * (1 - morphProgress) + tx * morphProgress;
            let by = wy * (1 - morphProgress) + ty * morphProgress;
            let bz = wz * (1 - morphProgress) + tz * morphProgress;

            // Mouse distortion
            const dx = bx - mouse.x;
            const dy = by - mouse.y;
            const mouseDist = Math.sqrt(dx * dx + dy * dy);
            if (mouseDist < 120) {
              const push = (120 - mouseDist) * 0.45;
              bz += push;
            }

            // Camera rotation
            const angleX = 0.5;
            const angleY = 0.5 + time * 0.015;

            const cosX = Math.cos(angleX);
            const sinX = Math.sin(angleX);
            const cosY = Math.cos(angleY);
            const sinY = Math.sin(angleY);

            // Rotate Y
            let x1 = bx * cosY - bz * sinY;
            let z1 = bz * cosY + bx * sinY;

            // Rotate X
            let y2 = by * cosX - z1 * sinX;
            let z2 = z1 * cosX + by * sinX;

            // Project to 2D screen
            const scale = fov / (fov + z2 + 200);
            const projX = width / 2 + x1 * scale;
            const projY = height / 2 + y2 * scale;

            // Colors interpolation
            const waveRatio = (c + r) / (cols + rows);
            const wColorR = waveRatio > 0.5 ? r1 : r2;
            const wColorG = waveRatio > 0.5 ? g1 : g2;
            const wColorB = waveRatio > 0.5 ? b1 : b2;

            const textRatio = (tp.x + 1) / 2;
            const tColorR = r2 + textRatio * (r1 - r2);
            const tColorG = g2 + textRatio * (g1 - g2);
            const tColorB = b2 + textRatio * (b1 - b2);

            const finalR = Math.round(wColorR * (1 - morphProgress) + tColorR * morphProgress);
            const finalG = Math.round(wColorG * (1 - morphProgress) + tColorG * morphProgress);
            const finalB = Math.round(wColorB * (1 - morphProgress) + tColorB * morphProgress);

            const finalColor = `rgb(${finalR}, ${finalG}, ${finalB})`;

            projectedPoints.push({ x: projX, y: projY, z: z2, color: finalColor });
          }
        }

        // Draw wave grid lines
        if (morphProgress < 0.99) {
          ctx.beginPath();
          ctx.strokeStyle = isDark
            ? `rgba(99, 102, 241, ${0.08 * (1 - morphProgress)})`
            : `rgba(99, 102, 241, ${0.05 * (1 - morphProgress)})`;
          ctx.lineWidth = 0.6;

          for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
              const idx = r * cols + c;
              const p = projectedPoints[idx];

              if (c < cols - 1) {
                const pRight = projectedPoints[r * cols + (c + 1)];
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(pRight.x, pRight.y);
              }

              if (r < rows - 1) {
                const pBottom = projectedPoints[(r + 1) * cols + c];
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(pBottom.x, pBottom.y);
              }
            }
          }
          ctx.stroke();
        }

        // Draw text connection wireframe
        if (morphProgress > 0.01) {
          ctx.beginPath();
          ctx.strokeStyle = isDark
            ? `rgba(168, 85, 247, ${0.15 * morphProgress})`
            : `rgba(79, 70, 229, ${0.1 * morphProgress})`;
          ctx.lineWidth = 0.7;

          for (let i = 0; i < textConnections.length; i++) {
            const [idxA, idxB] = textConnections[i];
            const pA = projectedPoints[idxA];
            const pB = projectedPoints[idxB];
            ctx.moveTo(pA.x, pA.y);
            ctx.lineTo(pB.x, pB.y);
          }
          ctx.stroke();
        }

        // Draw particle nodes
        for (let i = 0; i < projectedPoints.length; i++) {
          const p = projectedPoints[i];
          const size = Math.max(0.6, (1.8 * (fov / (fov + p.z + 200))));

          ctx.fillStyle = p.color;

          if (p.z < -40) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.color;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
      observer.disconnect();
    };
  }, [mode]);

  return (
    <div ref={containerRef} className="w-full h-[300px] sm:h-[450px] relative select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full cursor-pointer" />
    </div>
  );
}
