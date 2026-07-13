import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.chindospeak.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ChindoSpeak — Learn Mandarin and Indonesian from Reels",
    template: "%s | ChindoSpeak",
  },
  description:
    "Paste a TikTok, Instagram reel, or YouTube short. ChindoSpeak transcribes it, pulls out the phrases worth learning, and drills them with spaced repetition. Built for Chinese-Indonesian heritage speakers. Free on iPhone.",
  keywords: [
    "learn Mandarin",
    "learn Indonesian",
    "heritage speakers",
    "Chinese Indonesian",
    "spaced repetition",
    "flashcards from video",
    "language learning app",
  ],
  applicationName: "ChindoSpeak",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ChindoSpeak",
    title: "ChindoSpeak — Learn Mandarin and Indonesian from Reels",
    description:
      "Turn the reels you already watch into Mandarin and Indonesian flashcards. Spaced repetition across reading, listening, and speaking. Free on iPhone.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChindoSpeak — Learn Mandarin and Indonesian from Reels",
    description:
      "Turn the reels you already watch into Mandarin and Indonesian flashcards. Free on iPhone.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' },
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
