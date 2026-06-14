import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LanguageMode = 'fr' | 'en';

const STORAGE_KEY = 'campus-language';

interface LanguageState {
  language: LanguageMode;
  setLanguage: (language: LanguageMode) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'fr',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
