"use client";

import { usePwa } from "@/shared/contexts/PwaContext";
import Navigation from "./Navigation";

export default function ConditionalNavigation() {
  const { isPwa } = usePwa();

  // Only show navigation for PWA users
  if (!isPwa) return null;

  return <Navigation />;
}
