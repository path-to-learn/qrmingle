import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import pt from './pt.json';
import ar from './ar.json';
import ja from './ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      pt: { translation: pt },
      ar: { translation: ar },
      ja: { translation: ja },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'fr', 'pt', 'ar', 'ja'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'qrmingle-language',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
