"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isRunningAsPwa, getPwaInstallMessage } from '@/shared/utils/pwaUtils';

interface PwaContextType {
  isPwa: boolean;
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  isPromptVisible: boolean;
}

const PwaContext = createContext<PwaContextType>({
  isPwa: false,
  showInstallPrompt: () => {},
  hideInstallPrompt: () => {},
  isPromptVisible: false,
});

export const usePwa = () => useContext(PwaContext);

interface PwaProviderProps {
  children: ReactNode;
  appName?: string;
  primaryColor?: string;
}

export function PwaProvider({ children, appName = "Language Learning App", primaryColor = "#ef4444" }: PwaProviderProps) {
  const [isPwa, setIsPwa] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    setIsPwa(isRunningAsPwa());
    
    // Check if we've shown the prompt in this session
    const hasShown = sessionStorage.getItem('hasShownPwaPrompt') === 'true';
    setHasShownPrompt(hasShown);
  }, []);

  const showInstallPrompt = () => {
    if (!isPwa && !isPromptVisible && !hasShownPrompt) {
      setIsPromptVisible(true);
      // Mark that we've shown the prompt in this session
      sessionStorage.setItem('hasShownPwaPrompt', 'true');
      setHasShownPrompt(true);
    }
  };

  const hideInstallPrompt = () => {
    setIsPromptVisible(false);
  };

  return (
    <PwaContext.Provider value={{ isPwa, showInstallPrompt, hideInstallPrompt, isPromptVisible }}>
      {children}
      {isPromptVisible && !isPwa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Install {appName}</h2>
            
            <div className="mb-6 text-black dark:text-white">
              <p className="mb-4">{getPwaInstallMessage()}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">For the best experience, please install the app to your device.</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={hideInstallPrompt}
                className="px-4 py-2 text-white rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
}