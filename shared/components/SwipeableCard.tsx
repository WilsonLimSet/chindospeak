'use client';

import { useState, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';
import { playSwipe } from '@/shared/utils/soundEffects';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  enabled?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
}

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  leftLabel = 'Again',
  rightLabel = 'Got It',
  leftColor = '#ef4444',
  rightColor = '#22c55e'
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (!enabled) return;
      setSwiping(true);
      // Limit the offset for visual effect
      const maxOffset = 100;
      const newOffset = Math.max(-maxOffset, Math.min(maxOffset, e.deltaX));
      setOffset(newOffset);
    },
    onSwipedLeft: () => {
      if (!enabled) return;
      if (offset < -50) {
        playSwipe();
        onSwipeLeft();
      }
      setOffset(0);
      setSwiping(false);
    },
    onSwipedRight: () => {
      if (!enabled) return;
      if (offset > 50) {
        playSwipe();
        onSwipeRight();
      }
      setOffset(0);
      setSwiping(false);
    },
    onTouchEndOrOnMouseUp: () => {
      setOffset(0);
      setSwiping(false);
    },
    trackMouse: false, // Only track touch for mobile
    trackTouch: true,
    delta: 10,
    preventScrollOnSwipe: true,
  });

  const showLeftIndicator = offset < -30;
  const showRightIndicator = offset > 30;
  const indicatorOpacity = Math.min(Math.abs(offset) / 80, 1);

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Swipe indicators */}
      {enabled && (
        <>
          {/* Left indicator (Again) */}
          <div
            className="absolute inset-y-0 left-0 w-20 flex items-center justify-center transition-opacity duration-150"
            style={{
              backgroundColor: leftColor,
              opacity: showLeftIndicator ? indicatorOpacity : 0,
            }}
          >
            <span className="text-white font-bold text-sm rotate-[-15deg]">
              {leftLabel}
            </span>
          </div>

          {/* Right indicator (Got It) */}
          <div
            className="absolute inset-y-0 right-0 w-20 flex items-center justify-center transition-opacity duration-150"
            style={{
              backgroundColor: rightColor,
              opacity: showRightIndicator ? indicatorOpacity : 0,
            }}
          >
            <span className="text-white font-bold text-sm rotate-[15deg]">
              {rightLabel}
            </span>
          </div>
        </>
      )}

      {/* Card content */}
      <div
        {...handlers}
        className="relative bg-white dark:bg-gray-800 transition-transform"
        style={{
          transform: enabled && swiping ? `translateX(${offset}px) rotate(${offset * 0.05}deg)` : 'none',
          touchAction: 'pan-y',
        }}
      >
        {children}
      </div>

      {/* Swipe hint - shown only briefly */}
      {enabled && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
          Swipe to answer
        </div>
      )}
    </div>
  );
}
