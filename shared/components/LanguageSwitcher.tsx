"use client";

import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { currentLanguage, config, switchLanguage, availableLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSwitch = (languageKey: string) => {
    switchLanguage(languageKey as any);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
        title={`Switch to ${availableLanguages.find(l => l.key !== currentLanguage)?.config.name}`}
      >
        <Globe className="w-3 h-3 text-white" />
        <span className="text-xs font-medium text-white">{config.nativeName}</span>
        <ChevronDown 
          className={`w-3 h-3 transition-transform text-white ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-20">
            {availableLanguages.map(({ key, config: langConfig }) => (
              <button
                key={key}
                onClick={() => handleLanguageSwitch(key)}
                className={`w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md text-sm ${
                  currentLanguage === key ? 'bg-gray-50 dark:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {langConfig.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {langConfig.nativeName}
                    </div>
                  </div>
                  {currentLanguage === key && (
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: langConfig.theme.primary }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}