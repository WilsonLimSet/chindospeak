"use client";

import { useState } from 'react';
import { Globe, X } from 'lucide-react';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function FloatingLanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { config } = useLanguage();

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
        style={{ backgroundColor: config.theme.primary }}
        aria-label="Switch Language"
      >
        <Globe className="w-6 h-6" />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Language</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select which language you want to learn:
              </p>
              <LanguageSwitcher onLanguageChange={() => setIsOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}