import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import ptTranslations from './locales/pt.json';

// Get saved language from localStorage or default to English
const savedLanguage = localStorage.getItem('myflow-language') || 'en';

// Translation resources
const resources = {
  en: {
    translation: enTranslations,
  },
  pt: {
    translation: ptTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

// Save language preference when it changes
i18n.on('languageChanged', (lng: string) => {
  localStorage.setItem('myflow-language', lng);
});

export default i18n;

// Made with Bob
