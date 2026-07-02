import React, { useRef, useEffect } from 'react';

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Degré max d'inclinaison
  scale?: number; // Échelle lors du survol
  style?: React.CSSProperties;
}

export default function ThreeDCard({
  children,
  className = '',
  maxTilt = 15,
  scale = 1.02,
  style = {},
}: ThreeDCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const shineRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const shine = shineRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Position X de la souris dans la carte
    const y = e.clientY - rect.top;  // Position Y de la souris dans la carte

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const px = x / rect.width;
      const py = y / rect.height;

      // Calculer les angles d'inclinaison (inversé pour l'axe X)
      const tiltX = (0.5 - py) * maxTilt;
      const tiltY = (px - 0.5) * maxTilt;

      // Appliquer le transform 3D
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      // Déplacer l'effet de reflet (Shine)
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255, 255, 255, 0.2) 0%, transparent 60%)`;
        shine.style.opacity = '1';
      }
    });
  };

  const handleMouseEnter = () => {
    const card = cardRef.current;
    if (!card) return;
    // Transition très courte pour éviter le lag tout en gardant une légère fluidité
    card.style.transition = 'transform 50ms ease-out';
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    const shine = shineRef.current;
    if (!card) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // Remettre à zéro doucement
    card.style.transition = 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    if (shine) {
      shine.style.transition = 'opacity 500ms ease';
      shine.style.opacity = '0';
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform rounded-2xl ${className}`}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      }}
    >
      {/* Reflet de lumière 3D */}
      <div
        ref={shineRef}
        className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 z-10 mix-blend-overlay"
      />
      
      {/* Contenu principal (avec petit effet de décalage 3D pour la profondeur) */}
      <div style={{ transform: 'translateZ(20px)' }} className="transition-transform duration-300 h-full">
        {children}
      </div>
    </div>
  );
}
