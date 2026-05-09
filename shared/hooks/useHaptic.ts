"use client";

import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "warning" | "error" | "selection";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 35,
  selection: 8,
  success: [15, 50, 15],
  warning: [20, 80, 20],
  error: [40, 60, 40, 60, 40],
};

export function useHaptic() {
  return useCallback((pattern: HapticPattern = "light") => {
    if (typeof window === "undefined") return;
    const nav = window.navigator as Navigator & { vibrate?: (p: number | number[]) => boolean };
    if (typeof nav.vibrate !== "function") return;
    try {
      nav.vibrate(PATTERNS[pattern]);
    } catch {
      // Some browsers throw inside iframes or with strict permissions; ignore.
    }
  }, []);
}
