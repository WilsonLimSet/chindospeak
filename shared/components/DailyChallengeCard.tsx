'use client';

import { BookOpen, Headphones, Mic, Zap, Trophy, Check } from 'lucide-react';
import { DailyChallenge } from '@/shared/types';
import { getChallengeDescription } from '@/shared/utils/challengeGenerator';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  primaryColor: string;
  onComplete?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Headphones,
  Mic,
  Zap
};

export default function DailyChallengeCard({ challenge, primaryColor, onComplete }: DailyChallengeCardProps) {
  const progress = Math.min((challenge.currentValue / challenge.targetValue) * 100, 100);
  const Icon = iconMap[challenge.type === 'review_count' ? 'BookOpen' :
    challenge.type === 'correct_streak' ? 'Zap' :
      challenge.type === 'listening_practice' ? 'Headphones' : 'Mic'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: `${primaryColor}10` }}
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" style={{ color: primaryColor }} />
          <span className="font-medium text-gray-800 dark:text-gray-200">Daily Challenge</span>
        </div>
        {challenge.completed && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Complete!</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {getChallengeDescription(challenge)}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Progress</span>
            <span className="font-medium" style={{ color: challenge.completed ? '#22c55e' : primaryColor }}>
              {challenge.currentValue}/{challenge.targetValue}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: challenge.completed ? '#22c55e' : primaryColor
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
