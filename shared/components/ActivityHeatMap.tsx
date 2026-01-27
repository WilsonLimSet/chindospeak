'use client';

import { useState } from 'react';
import { DailyActivity } from '@/shared/types';
import DayDetailModal from './DayDetailModal';

interface ActivityHeatMapProps {
  activities: DailyActivity[];
  primaryColor: string;
}

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

export default function ActivityHeatMap({ activities, primaryColor }: ActivityHeatMapProps) {
  const [selectedDay, setSelectedDay] = useState<DailyActivity | null>(null);

  // Group activities into weeks (7 days each)
  const weeks: DailyActivity[][] = [];
  const sortedActivities = [...activities].sort((a, b) => a.date.localeCompare(b.date));

  // Pad the start to align with day of week
  const firstDate = sortedActivities.length > 0 ? new Date(sortedActivities[0].date) : new Date();
  const startPadding = firstDate.getDay(); // 0 = Sunday

  let currentWeek: DailyActivity[] = [];

  // Add padding for alignment
  for (let i = 0; i < startPadding; i++) {
    currentWeek.push({ date: '', reviewCount: -1, correctCount: 0 }); // -1 indicates empty cell
  }

  for (const activity of sortedActivities) {
    currentWeek.push(activity);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Add remaining partial week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get month labels
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  sortedActivities.forEach((activity, index) => {
    const date = new Date(activity.date);
    const month = date.getMonth();
    if (month !== lastMonth) {
      const weekIndex = Math.floor((index + startPadding) / 7);
      monthLabels.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        weekIndex
      });
      lastMonth = month;
    }
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity</h3>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-1 ml-8">
          {monthLabels.map((m, i) => (
            <div
              key={i}
              className="text-xs text-gray-400 dark:text-gray-500"
              style={{
                marginLeft: i === 0 ? `${m.weekIndex * 14}px` : `${(m.weekIndex - monthLabels[i - 1].weekIndex - 1) * 14}px`,
                minWidth: '28px'
              }}
            >
              {m.label}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col justify-around mr-1" style={{ height: `${7 * 14 - 2}px` }}>
            {dayLabels.map((day, i) => (
              i % 2 === 1 && (
                <span key={day} className="text-xs text-gray-400 dark:text-gray-500 leading-none">
                  {day.slice(0, 1)}
                </span>
              )
            ))}
          </div>

          {/* Heat map grid */}
          <div className="flex gap-[2px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => {
                  if (day.reviewCount === -1) {
                    return <div key={dayIndex} className="w-3 h-3" />;
                  }
                  const intensity = getIntensityLevel(day.reviewCount);
                  return (
                    <button
                      key={dayIndex}
                      className="w-3 h-3 rounded-sm transition-transform hover:scale-125 hover:z-10"
                      style={{ backgroundColor: getIntensityColor(intensity, primaryColor) }}
                      onClick={() => setSelectedDay(day)}
                      title={`${day.date}: ${day.reviewCount} reviews`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
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
      </div>

      <DayDetailModal
        day={selectedDay}
        onClose={() => setSelectedDay(null)}
        primaryColor={primaryColor}
      />
    </div>
  );
}
