import { useLanguageStore, type LanguageMode } from '../store/languageStore';
import { translations, type TranslationKey } from '../constants/translations';

export function useTranslation() {
  const { language, setLanguage } = useLanguageStore();

  const t = (key: TranslationKey | string, fallback?: string): string => {
    const translationSet = translations[language] || translations.fr;
    
    // Check if the key exists in the current language set
    if (key in translationSet) {
      return (translationSet as any)[key];
    }
    
    // Fallback to French if current language doesn't have it
    const frenchSet = translations.fr;
    if (key in frenchSet) {
      return (frenchSet as any)[key];
    }

    return fallback !== undefined ? fallback : key;
  };

  return {
    t,
    language,
    setLanguage,
  };
}
