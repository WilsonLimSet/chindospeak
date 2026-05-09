"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/shared/contexts/LanguageContext";

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false);
  const { config } = useLanguage();

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Add event listeners for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 text-black px-2 text-center text-sm z-50"
      style={{
        backgroundColor: '#fbbf24',
        paddingTop: '0.5rem',
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))',
      }}
      role="status"
    >
      You are currently offline. Some features may be limited.
    </div>
  );
}