import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'campus-theme';

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  init: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'light',

      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },

      toggle: () => {
        const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
        get().setMode(next);
      },

      init: () => {
        applyTheme(get().mode);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const mode: ThemeMode = (state.mode as string) === 'dark' ? 'dark' : 'light';
        if (state.mode !== mode) state.mode = mode;
        applyTheme(mode);
      },
    },
  ),
);
