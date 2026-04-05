import React, { createContext, useContext, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const LangContext = createContext(null);
const STORAGE_KEY = 'finflow_language';

function getInitialLanguage() {
  const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (saved && ['en', 'hi', 'te'].includes(saved)) return saved;
  return 'en';
}

function deepGet(obj, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function interpolate(template, params) {
  if (typeof template !== 'string' || !params) return template;
  return Object.keys(params).reduce(
    (acc, k) => acc.replace(new RegExp(`{{${k}}}`, 'g'), String(params[k])),
    template
  );
}

export function LangProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  const setLanguage = (lang) => {
    if (!['en', 'hi', 'te'].includes(lang)) return;
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, lang);
    }
  };

  const t = (key, params) => {
    const langPack = translations[language] || translations.en;
    const value = deepGet(langPack, key);
    const fallback = deepGet(translations.en, key);
    return interpolate(value !== undefined ? value : fallback !== undefined ? fallback : key, params);
  };

  const value = useMemo(() => ({ language, setLanguage, t }), [language]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error('useLang must be used inside LangProvider');
  }
  return ctx;
}
