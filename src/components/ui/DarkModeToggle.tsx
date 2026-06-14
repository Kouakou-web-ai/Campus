import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('campus-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
      localStorage.setItem('campus-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
      localStorage.setItem('campus-theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((d) => !d)}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      className="relative w-12 h-6 rounded-full transition-all duration-500 focus-visible:outline-2 focus-visible:outline-indigo-500 focus-visible:outline-offset-2"
      style={{
        background: isDark
          ? 'linear-gradient(135deg,#312e81,#4338ca)'
          : 'linear-gradient(135deg,#e0e7ff,#c7d2fe)',
        boxShadow: isDark
          ? '0 0 12px rgba(99,102,241,0.4)'
          : '0 0 8px rgba(200,210,255,0.6)',
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-500"
        style={{
          transform: isDark ? 'translateX(24px)' : 'translateX(0)',
          background: isDark ? '#1e1b4b' : '#ffffff',
          boxShadow: isDark
            ? '0 0 8px rgba(129,140,248,0.5)'
            : '0 1px 4px rgba(0,0,0,0.15)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
