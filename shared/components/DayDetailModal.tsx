'use client';

import { X, BookOpen, CheckCircle } from 'lucide-react';
import { DailyActivity } from '@/shared/types';

interface DayDetailModalProps {
  day: DailyActivity | null;
  onClose: () => void;
  primaryColor: string;
}

export default function DayDetailModal({ day, onClose, primaryColor }: DayDetailModalProps) {
  if (!day) return null;

  const date = new Date(day.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const accuracy = day.reviewCount > 0
    ? Math.round((day.correctCount / day.reviewCount) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xs w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-800 dark:text-gray-200">{formattedDate}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {day.reviewCount === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No reviews on this day
            </p>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {day.reviewCount}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    cards reviewed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {accuracy}%
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    accuracy ({day.correctCount}/{day.reviewCount} correct)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
