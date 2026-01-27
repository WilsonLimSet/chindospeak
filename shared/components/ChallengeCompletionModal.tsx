'use client';

import { useEffect, useState } from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';

interface ChallengeCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
}

export default function ChallengeCompletionModal({ isOpen, onClose, primaryColor }: ChallengeCompletionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-bounce-in">
        {/* Confetti effect */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#fbbf24', '#22c55e', '#3b82f6', '#ec4899'][i % 4]
                }}
              />
            ))}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-6 text-center relative">
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <Trophy className="w-10 h-10" style={{ color: primaryColor }} />
          </div>

          <div className="flex items-center justify-center gap-1 mb-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Challenge Complete!
            </h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Amazing work! You've completed today's challenge. Keep up the great learning!
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 rounded-lg font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Continue Learning
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
        @keyframes confetti {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(400px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          width: 10px;
          height: 10px;
          animation: confetti 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
