import { useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

export default function AnimatedCounter({ value, duration = 2, suffix = '', prefix = '', className = '' }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => {
    // Determine if value has decimals
    const isDecimal = value % 1 !== 0;
    const formattedNum = isDecimal ? current.toFixed(1) : Math.floor(current).toString();
    // Re-format with space as thousand separator for non-decimals
    const withSeparator = isDecimal ? formattedNum : Math.floor(current).toLocaleString('fr-FR');
    return prefix + withSeparator + suffix;
  });

  useEffect(() => {
    if (inView) {
      spring.set(value);
    }
  }, [inView, spring, value]);

  return <motion.span ref={ref} className={className}>{display}</motion.span>;
}
