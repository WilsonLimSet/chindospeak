"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PwaWrapper from "@/shared/components/PwaWrapper";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import Link from "next/link";

export default function Navigation() {
  const pathname = usePathname();
  const { config } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Update document theme attribute when language changes
  useEffect(() => {
    document.documentElement.setAttribute('data-language', config.code.split('-')[0]);
  }, [config.code]);

  return (
    <nav 
      className="text-white p-2 sm:p-4 sticky top-0 z-20 shadow-lg backdrop-blur-sm"
      style={{ 
        backgroundColor: config.theme.primary,
        backgroundImage: `linear-gradient(135deg, ${config.theme.primary} 0%, ${config.theme.secondary} 100%)`
      }}
    >
      <div className="container mx-auto flex justify-between items-center max-w-6xl px-2">
        <Link href="/" className="flex-shrink-0">
          <span className="text-sm sm:text-lg font-bold tracking-tight text-white">
            ChindoSpeak
          </span>
        </Link>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="flex space-x-1 sm:space-x-2">
            <NavLink href="/review" current={pathname === "/review"} config={config}>
              {config.ui.navigation.review}
            </NavLink>
            <NavLink href="/listen" current={pathname === "/listen"} config={config}>
              {config.ui.navigation.listen}
            </NavLink>
            <NavLink href="/speak" current={pathname === "/speak"} config={config}>
              {config.ui.navigation.speak}
            </NavLink>
            <NavLink href="/manage" current={pathname === "/manage"} config={config}>
              {config.ui.navigation.manage}
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ 
  href, 
  current, 
  children, 
  config 
}: { 
  href: string; 
  current: boolean; 
  children: React.ReactNode;
  config: any;
}) {
  // Check if the content uses complex script (Chinese characters, etc.)
  const isComplexScript = config.features.complexScript && 
    typeof children === 'string' && 
    /[\u4e00-\u9fff\u3400-\u4dbf]/.test(children);
  
  return (
    <Link
      href={href}
      className={`px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg whitespace-nowrap ${
        isComplexScript ? 'text-base sm:text-lg md:text-xl font-medium' : 'text-sm sm:text-base md:text-lg font-medium'
      } ${
        current 
          ? 'text-white bg-white/20 shadow-lg' 
          : 'text-white/90 hover:text-white hover:bg-white/10'
      } transition-all duration-200`}
    >
      {children}
    </Link>
  );
}