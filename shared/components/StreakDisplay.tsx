'use client';

import { Flame } from 'lucide-react';
import { StreakData } from '@/shared/types';

interface StreakDisplayProps {
  streakData: StreakData;
  primaryColor: string;
}

export default function StreakDisplay({ streakData, primaryColor }: StreakDisplayProps) {
  const { currentStreak, longestStreak, hasReviewedToday } = streakData;

  const isActive = currentStreak > 0 && hasReviewedToday;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="p-2 rounded-full"
            style={{
              backgroundColor: isActive ? `${primaryColor}20` : '#f3f4f6'
            }}
          >
            <Flame
              className={`w-6 h-6 ${isActive ? '' : 'text-gray-400'}`}
              style={{ color: isActive ? primaryColor : undefined }}
              fill={isActive ? primaryColor : 'none'}
            />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-2xl font-bold"
                style={{ color: currentStreak > 0 ? primaryColor : '#9ca3af' }}
              >
                {currentStreak}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                day streak
              </span>
            </div>
            {!hasReviewedToday && currentStreak > 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Review today to continue
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-gray-500">Best</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {longestStreak} day{longestStreak !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
