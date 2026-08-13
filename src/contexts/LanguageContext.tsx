'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Cache for translations
let translationCache: Record<string, any> = {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState('en');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('ltr');
  const [loaded, setLoaded] = useState(false);
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
    setDir(savedLang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
    
    // Load translations
    loadTranslations(savedLang);
  }, []);

  const loadTranslations = async (lang: string) => {
    try {
      // Check cache first
      if (translationCache[lang]) {
        setTranslations(translationCache[lang]);
        setLoaded(true);
        return;
      }

      // Load common translations
      let commonData = {};
      try {
        const commonRes = await fetch(`/locales/${lang}/common.json`);
        if (commonRes.ok) {
          commonData = await commonRes.json();
        }
      } catch (e) {
        console.warn(`Common translations not found for ${lang}`);
      }

      // Load admin translations
      let adminData = {};
      try {
        const adminRes = await fetch(`/locales/${lang}/admin.json`);
        if (adminRes.ok) {
          adminData = await adminRes.json();
        }
      } catch (e) {
        console.warn(`Admin translations not found for ${lang}`);
      }

      // Merge translations
      const merged = { ...commonData, admin: adminData };
      
      // Store in cache
      translationCache[lang] = merged;
      setTranslations(merged);
      setLoaded(true);
      
      console.log(`✅ Translations loaded for ${lang}:`, Object.keys(merged));
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
      // Fallback to empty translations
      setTranslations({});
      setLoaded(true);
    }
  };

  const changeLanguage = (lang: string) => {
    setLanguage(lang);
    setDir(lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Load translations for new language
    loadTranslations(lang);
  };

  const t = (key: string): string => {
    if (!loaded) return key;
    
    try {
      const keys = key.split('.');
      let value = translations;
      
      for (const k of keys) {
        if (value && value[k] !== undefined) {
          value = value[k];
        } else {
          return key;
        }
      }
      
      return value || key;
    } catch (e) {
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
