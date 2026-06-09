import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown';
  className?: string;
}

export default function ThemeToggle({ variant = 'icon', className = '' }: ThemeToggleProps) {
  const { mode, toggle } = useThemeStore();

  if (variant === 'dropdown') {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`btn btn-ghost btn-sm btn-circle ${className}`}
        aria-label="Changer le thème"
        title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {mode === 'dark' ? <Sun size={18} className="text-content" /> : <Moon size={18} className="text-content" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`p-2 rounded-xl hover:bg-surface-raised text-content-secondary hover:text-content transition-colors ${className}`}
      aria-label={mode === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={mode === 'dark' ? 'Mode clair' : 'Mode sombre'}
    >
      {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
