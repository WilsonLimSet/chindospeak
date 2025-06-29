"use client";

import { usePathname } from 'next/navigation';

export default function ConditionalFloatingLanguageSwitcher() {
  const pathname = usePathname();
  
  // Don't show floating button anywhere - users can go to home page to switch languages
  return null;
}