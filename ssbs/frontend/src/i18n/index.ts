import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

/* ── Language definitions ── */
export const VISIBLE_LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'ar', label: 'AR', flag: '🇲🇦' },
];

export const DASHBOARD_LANGUAGES = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'ar', label: 'AR', flag: '🇲🇦' },
];

const VALID_LANGS = ['en', 'fr', 'ar'];

export const isRTL = (lang: string) => lang === 'ar';
export const isDashboardLang = (lang: string) => ['en', 'fr'].includes(lang);

const STORAGE_KEY = 'fleetmark_lang';

// Clean up any stale 'ma' (Darija) value from older versions
const saved = localStorage.getItem(STORAGE_KEY);
if (saved && !VALID_LANGS.includes(saved)) {
  localStorage.setItem(STORAGE_KEY, 'en');
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en, fr, ar },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
  });

// Set direction on language change
const applyDirection = (lng: string) => {
  const dir = isRTL(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
  if (isRTL(lng)) {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
};

// Apply on init
applyDirection(i18n.language || 'en');

// Apply on change
i18n.on('languageChanged', applyDirection);

export default i18n;
