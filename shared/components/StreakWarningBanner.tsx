'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { StreakData } from '@/shared/types';

interface StreakWarningBannerProps {
  streakData: StreakData;
}

export default function StreakWarningBanner({ streakData }: StreakWarningBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { currentStreak, hasReviewedToday } = streakData;

  // Don't show if dismissed, no streak, or already reviewed today
  if (dismissed || currentStreak === 0 || hasReviewedToday) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-medium">Don't break your {currentStreak}-day streak!</span>
            {' '}Review at least one card today.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800/50 rounded-full transition-colors"
          aria-label="Dismiss warning"
        >
          <X className="w-4 h-4 text-amber-500" />
        </button>
      </div>
    </div>
  );
}
