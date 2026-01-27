'use client';

import { useEffect } from 'react';
import { Trophy, X } from 'lucide-react';
import { playSuccess } from '@/shared/utils/soundEffects';

interface ChallengeCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
}

export default function ChallengeCompletionModal({ isOpen, onClose, primaryColor }: ChallengeCompletionModalProps) {
  useEffect(() => {
    if (isOpen) {
      playSuccess();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xs w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" style={{ color: primaryColor }} />
            <span className="font-semibold text-gray-800 dark:text-gray-200">Challenge Complete</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
            You finished today's challenge. Come back tomorrow for a new one.
          </p>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-lg font-medium text-white text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
