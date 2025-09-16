import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'pt' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Função para obter um valor aninhado de um objeto a partir de uma chave string "a.b.c"
const getNestedTranslation = (obj: any, key: string): string | undefined => {
  return key.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};


export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [translations, setTranslations] = useState<any>(null);

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const [pt, en, es] = await Promise.all([
          fetch('./locales/pt.json').then(res => res.json()),
          fetch('./locales/en.json').then(res => res.json()),
          fetch('./locales/es.json').then(res => res.json()),
        ]);
        setTranslations({ pt, en, es });
      } catch (error) {
        console.error("Failed to load translations:", error);
      }
    };

    fetchTranslations();
  }, []);


  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = (key: string, options?: { [key: string]: string | number }): string => {
    if (!translations) {
      return key; // Retorna a chave enquanto as traduções estão carregando
    }
    const translation = getNestedTranslation(translations[language], key) || key;
    
    if (options) {
      return Object.entries(options).reduce((str, [key, value]) => {
        return str.replace(`{${key}}`, String(value));
      }, translation);
    }
    
    return translation;
  };
  
  // Impede a renderização do aplicativo até que as traduções sejam carregadas
  if (!translations) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};