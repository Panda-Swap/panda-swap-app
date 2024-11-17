import { type TranslationKeys, languageNames } from './config';
import type { SupportedLanguage } from '../store/language-store';
import { languageStore, getServerSideLanguage } from '../store/language-store';

const translations = new Map<string, TranslationKeys>();

// Dynamically import all translation files from the translations directory
const translationModules = import.meta.glob('./translations/*.ts', { eager: true });

// Process and store all available translations
for (const path in translationModules) {
  const langCode = path.match(/\.\/translations\/(.+)\.ts$/)?.[1];
  if (langCode) {
    const module = translationModules[path] as { default: TranslationKeys };
    translations.set(langCode, module.default);
  }
}

// Get available languages based on loaded translations
export function getAvailableLanguages(): Record<string, string> {
  const available: Record<string, string> = {};
  for (const lang of translations.keys()) {
    available[lang] = languageNames[lang] || lang.toUpperCase();
  }
  return available;
}

export function getCurrentLanguage(): string {
  return typeof window === 'undefined' 
    ? getServerSideLanguage()
    : languageStore.get();
}

export function setLanguage(lang: string) {
  if (!translations.has(lang)) {
    console.warn(`Translation for language ${lang} not found`);
    return;
  }
  
  languageStore.set(lang as SupportedLanguage);
  window.dispatchEvent(new CustomEvent('language-change', { 
    detail: { language: lang } 
  }));
}

// Single interpolation function that handles {variable} format
export function interpolateVariables(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text;
  return Object.entries(variables).reduce((result, [key, value]) => {
    return result.replace(`{${key}}`, String(value));
  }, text);
}

export function useTranslations(lang: string = getCurrentLanguage()) {
  const translation = translations.get(lang) ?? translations.get(getCurrentLanguage())!;
  
  return {
    t: function translate(key: string, variables?: Record<string, string | number>): string {
      try {
        const keys = key.split('.');
        let value = translation;
        
        // Safely traverse the translation object
        for (const k of keys) {
          value = value[k as keyof typeof value] as any;
          if (value === undefined) throw new Error(`Translation key not found: ${key}`);
        }

        if (typeof value !== 'string') {
          throw new Error(`Translation key ${key} is not a string`);
        }

        return variables ? interpolateVariables(value, variables) : value;
      } catch (e) {
        console.warn(`Translation error:`, e);
        return key;
      }
    }
  };
}