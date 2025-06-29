import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import OfflineDetector from '@/shared/components/OfflineDetector';
import InstallPrompt from './components/InstallPrompt';
import InstallInstructions from './components/InstallInstructions';
import ConditionalFloatingLanguageSwitcher from '@/shared/components/ConditionalFloatingLanguageSwitcher';
import { Analytics } from '@vercel/analytics/react';
import { PwaProvider } from '@/shared/contexts/PwaContext';
import { LanguageProvider } from '@/shared/contexts/LanguageContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChindoSpeak - Language Learning",
  description: "Learn Chinese and Indonesian with spaced repetition flashcards",
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/icon-192x192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ChindoSpeak"
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <LanguageProvider>
          <PwaProvider appName="ChindoSpeak">
            <Navigation />
            <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              {children}
            </main>
            <OfflineDetector />
            <InstallPrompt />
            <InstallInstructions />
            <ConditionalFloatingLanguageSwitcher />
            <Analytics />
          </PwaProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}