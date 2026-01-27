'use client';

import { useState, useMemo } from 'react';
import { DailyActivity } from '@/shared/types';
import DayDetailModal from './DayDetailModal';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ActivityHeatMapProps {
  activities: DailyActivity[];
  primaryColor: string;
}

// App launch date - only show activity from this date onwards
const APP_START_DATE = new Date('2026-01-27');

function getIntensityLevel(reviewCount: number): number {
  if (reviewCount === 0) return 0;
  if (reviewCount <= 5) return 1;
  if (reviewCount <= 15) return 2;
  if (reviewCount <= 30) return 3;
  return 4;
}

function getIntensityColor(level: number, primaryColor: string): string {
  const colors = [
    '#e5e7eb', // Level 0 - gray-200
    `${primaryColor}30`, // Level 1 - 30% opacity
    `${primaryColor}50`, // Level 2 - 50% opacity
    `${primaryColor}70`, // Level 3 - 70% opacity
    primaryColor // Level 4 - full color
  ];
  return colors[level] || colors[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function ActivityHeatMap({ activities, primaryColor }: ActivityHeatMapProps) {
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);

  // Current month being viewed (default to current month)
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());

  // Filter activities to only include those from APP_START_DATE onwards
  const filteredActivities = useMemo(() => {
    return activities.filter(a => new Date(a.date) >= APP_START_DATE);
  }, [activities]);

  // Create activity map for quick lookup
  const activityMap = useMemo(() => {
    const map = new Map<string, DailyActivity>();
    filteredActivities.forEach(a => map.set(a.date, a));
    return map;
  }, [filteredActivities]);

  // Generate days for the current view month
  const monthData = useMemo(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startPadding = firstDayOfMonth.getDay(); // 0 = Sunday

    const days: (DailyActivity | null)[] = [];

    // Add padding for alignment
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewYear, viewMonth, day);
      const dateStr = date.toISOString().split('T')[0];

      // Check if this date is before app start or in the future
      if (date < APP_START_DATE || date > today) {
        days.push({ date: dateStr, reviewCount: -1, correctCount: 0 }); // -1 = inactive
      } else {
        const activity = activityMap.get(dateStr);
        days.push(activity || { date: dateStr, reviewCount: 0, correctCount: 0 });
      }
    }

    // Group into weeks
    const weeks: (DailyActivity | null)[][] = [];
    let currentWeek: (DailyActivity | null)[] = [];

    for (const day of days) {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add remaining partial week
    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [viewYear, viewMonth, activityMap, today]);

  // Navigation handlers
  const canGoBack = viewYear > APP_START_DATE.getFullYear() ||
    (viewYear === APP_START_DATE.getFullYear() && viewMonth > APP_START_DATE.getMonth());

  const canGoForward = viewYear < today.getFullYear() ||
    (viewYear === today.getFullYear() && viewMonth < today.getMonth());

  const goToPreviousMonth = () => {
    if (!canGoBack) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (!canGoForward) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Activity</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            disabled={!canGoBack}
            className={`p-1 rounded ${canGoBack ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[120px] text-center">
            {formatMonthYear(new Date(viewYear, viewMonth))}
          </span>
          <button
            onClick={goToNextMonth}
            disabled={!canGoForward}
            className={`p-1 rounded ${canGoForward ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'opacity-30 cursor-not-allowed'}`}
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayLabels.map((day, i) => (
          <div key={i} className="text-xs text-gray-400 dark:text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1">
        {monthData.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              if (day === null) {
                // Padding cell
                return <div key={dayIndex} className="w-full aspect-square" />;
              }

              if (day.reviewCount === -1) {
                // Inactive cell (before app start or future)
                return (
                  <div
                    key={dayIndex}
                    className="w-full aspect-square rounded-sm bg-gray-100 dark:bg-gray-700 opacity-30"
                  />
                );
              }

              const intensity = getIntensityLevel(day.reviewCount);
              const dayNumber = new Date(day.date).getDate();

              return (
                <button
                  key={dayIndex}
                  className="w-full aspect-square rounded-sm transition-transform hover:scale-110 hover:z-10 relative flex items-center justify-center"
                  style={{ backgroundColor: getIntensityColor(intensity, primaryColor) }}
                  onClick={() => setSelectedDay(day)}
                  title={`${day.date}: ${day.reviewCount} reviews`}
                >
                  <span className={`text-xs ${intensity >= 3 ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                    {dayNumber}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1 mt-3">
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-1">Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: getIntensityColor(level, primaryColor) }}
          />
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">More</span>
      </div>

      <DayDetailModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        primaryColor={primaryColor}
      />
    </div>
  );
}
