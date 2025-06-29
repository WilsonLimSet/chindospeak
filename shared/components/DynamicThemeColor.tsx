"use client";

import { useEffect } from 'react';
import { useLanguage } from '@/shared/contexts/LanguageContext';

export default function DynamicThemeColor() {
  const { config } = useLanguage();

  useEffect(() => {
    // Update theme-color meta tag
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', config.theme.primary);

    // Update Apple status bar style to match
    let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBarMeta) {
      appleStatusBarMeta = document.createElement('meta');
      appleStatusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(appleStatusBarMeta);
    }
    // Use default to blend with navigation color
    appleStatusBarMeta.setAttribute('content', 'default');

    // Update manifest theme color if possible
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      // Create a dynamic manifest
      const manifest = {
        name: "ChindoSpeak - Language Learning",
        short_name: "ChindoSpeak", 
        description: "Learn Chinese and Indonesian with spaced repetition flashcards",
        start_url: "/",
        display: "standalone",
        background_color: config.theme.background,
        theme_color: config.theme.primary,
        orientation: "portrait",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192", 
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png", 
            purpose: "any maskable"
          }
        ],
        categories: ["education", "productivity", "reference"],
        lang: "en",
        dir: "ltr",
        prefer_related_applications: false
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
      const manifestUrl = URL.createObjectURL(blob);
      manifestLink.setAttribute('href', manifestUrl);
    }
  }, [config.theme.primary, config.theme.background]);

  return null;
}