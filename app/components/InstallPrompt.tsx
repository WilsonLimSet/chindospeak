"use client";

import { useState, useEffect } from 'react';
import { markPwaAsInstalled } from '@/shared/utils/pwaUtils';
import { useLanguage } from '@/shared/contexts/LanguageContext';

const DISMISS_KEY = 'install-prompt-dismissed-at';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { config } = useLanguage();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const evt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(evt);

      // Respect a recent dismissal — don't re-prompt every visit.
      try {
        const dismissed = window.localStorage.getItem(DISMISS_KEY);
        if (dismissed && Date.now() - Number(dismissed) < SNOOZE_MS) {
          return;
        }
      } catch {
        // localStorage unavailable; show the prompt.
      }
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)) {
      markPwaAsInstalled();
    }

    const handleInstalled = () => {
      markPwaAsInstalled();
      setShowPrompt(false);
    };
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      markPwaAsInstalled();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore quota / private mode
    }
  };

  if (!showPrompt) return null;

  return (
    <div
      className="fixed left-4 right-4 text-white p-4 rounded-lg shadow-lg z-50"
      style={{
        backgroundColor: config.theme.primary,
        bottom: 'calc(1rem + env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium">Install {config.ui.appName}</p>
          <p className="text-sm">Add to your home screen for the best experience with audio features</p>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="bg-white px-4 py-2 rounded-md font-medium"
            style={{ color: config.theme.primary }}
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/80 text-xs underline"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}