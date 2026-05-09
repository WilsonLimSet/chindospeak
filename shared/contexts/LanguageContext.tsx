"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BaseLanguageConfig, BaseLanguageService } from '@/language-configs/base.config';
import { chineseConfig, ChineseLanguageService } from '@/language-configs/chinese.config';
import { indonesianConfig, IndonesianLanguageService } from '@/language-configs/indonesian.config';

export type SupportedLanguage = 'chinese' | 'indonesian';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  config: BaseLanguageConfig;
  service: BaseLanguageService;
  switchLanguage: (language: SupportedLanguage) => void;
  availableLanguages: { key: SupportedLanguage; config: BaseLanguageConfig }[];
}

const languageConfigs = {
  chinese: { config: chineseConfig, service: ChineseLanguageService },
  indonesian: { config: indonesianConfig, service: IndonesianLanguageService }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export function LanguageProvider({ children, defaultLanguage = 'chinese' }: LanguageProviderProps) {
  // Always initialize with the default on first render so server and client agree.
  // The persisted preference is applied in useEffect below to avoid hydration mismatches.
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(defaultLanguage);
  const [service, setService] = useState<BaseLanguageService>(() =>
    new languageConfigs[defaultLanguage].service()
  );

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('preferred-language') as SupportedLanguage | null;
      if (savedLanguage && languageConfigs[savedLanguage] && savedLanguage !== currentLanguage) {
        setCurrentLanguage(savedLanguage);
        setService(new languageConfigs[savedLanguage].service());
      }
    } catch {
      // localStorage may be unavailable (private mode); fall back to default.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchLanguage = (language: SupportedLanguage) => {
    if (languageConfigs[language]) {
      setCurrentLanguage(language);
      setService(new languageConfigs[language].service());
      localStorage.setItem('preferred-language', language);
      
      // Update document language attribute
      document.documentElement.lang = languageConfigs[language].config.code;
    }
  };

  const availableLanguages = Object.entries(languageConfigs).map(([key, { config }]) => ({
    key: key as SupportedLanguage,
    config
  }));

  const contextValue: LanguageContextType = {
    currentLanguage,
    config: languageConfigs[currentLanguage].config,
    service,
    switchLanguage,
    availableLanguages
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}