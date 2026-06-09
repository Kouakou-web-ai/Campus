import { type ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  threshold?: number;
}

export default function RevealOnScroll({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 600,
  threshold = 0.12,
}: RevealOnScrollProps) {
  const { ref, inView } = useInView({ threshold, once: true });

  const transforms: Record<string, string> = {
    up: 'translateY(32px)',
    down: 'translateY(-32px)',
    left: 'translateX(32px)',
    right: 'translateX(-32px)',
    none: 'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : transforms[direction],
        transition: `opacity ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
