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
  const lang = typeof window === 'undefined'
    ? getServerSideLanguage()
    : languageStore.get();
  
  return lang;
}

export function setLanguage(lang: string) {
  console.group('setLanguage');
  
  if (!translations.has(lang)) {
    console.warn(`Translation for language ${lang} not found`);
    console.groupEnd();
    return;
  }
  
  languageStore.set(lang as SupportedLanguage);
  console.groupEnd();
}

// Single interpolation function that handles {variable} format
export function interpolateVariables(text: string, variables?: Record<string, string | number>): string {
  if (!variables) return text;
  return Object.entries(variables).reduce((result, [key, value]) => {
    return result.replace(`{${key}}`, String(value));
  }, text);
}

export function useTranslations(lang: string = getCurrentLanguage()) {
  const translation = translations.get(lang) ?? translations.get('en');
  
  if (!translation) {
    console.error(`No translations found for language: ${lang}`);
    throw new Error(`No translations found for language: ${lang}`);
  }

  return {
    t: function translate(key: string, variables?: Record<string, string | number>): string {
      try {
        const keys = key.split('.');
        let value = translation;
        
        // Safely traverse the translation object
        for (const k of keys) {
          value = value[k as keyof typeof value] as any;
          
          if (value === undefined) {
            console.warn(`Translation key not found: ${key}`);
            return key;
          }
        }

        if (typeof value !== 'string') {
          console.warn(`Translation key ${key} is not a string`);
          return key;
        }

        return variables ? interpolateVariables(value, variables) : value;
      } catch (e) {
        console.warn(`Translation error:`, e);
        return key;
      }
    },
    lang
  };
}

// Add a global translation event
export function triggerTranslationUpdate() {
  window.dispatchEvent(new CustomEvent('translation-update'));
}