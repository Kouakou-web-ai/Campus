import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from '../../store/themeStore';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const init = useThemeStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return children;
}
