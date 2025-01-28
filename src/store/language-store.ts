// store/languageStore.ts
import { atom } from 'nanostores';
import { LANG_STORAGE_KEY } from '../i18n/config';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'uk' | 'pt' | 'it';

function getInitialLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') {
    return 'en'; // Default for SSR
  }

  const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
  if (storedLang && isValidLanguage(storedLang)) {
    return storedLang as SupportedLanguage;
  }

  // Try to match browser language
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  if (isValidLanguage(browserLang)) {
    return browserLang;
  }

  return 'en';
}

function isValidLanguage(lang: string): lang is SupportedLanguage {
  const validLanguages: SupportedLanguage[] = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'uk', 'pt', 'it'];
  return validLanguages.includes(lang as SupportedLanguage);
}

export const languageStore = {
  private: atom<SupportedLanguage>(getInitialLanguage()),
  
  get(): SupportedLanguage {
    return this.private.get();
  },
  
  set(value: SupportedLanguage): void {

    if (isValidLanguage(value)) {

      this.private.set(value);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(LANG_STORAGE_KEY, value);
        document.documentElement.setAttribute('lang', value);
        
        // Dispatch multiple events
        window.dispatchEvent(new CustomEvent('language-change', {
          detail: { language: value }
        }));
        window.dispatchEvent(new CustomEvent('translation-update'));
      }
    } else {
      console.warn('Invalid language:', value);
    }
    
    console.groupEnd();
  },
  
  subscribe(callback: (value: SupportedLanguage) => void): () => void {
    return this.private.subscribe((value) => {
      callback(value);
    });
  }
};

// For use in Astro components during SSR
export function getServerSideLanguage(): SupportedLanguage {
  return 'en';
}