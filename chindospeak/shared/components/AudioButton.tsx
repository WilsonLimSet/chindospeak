"use client";

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { UnifiedAudioService } from '@/shared/utils/audioService';
import { VoiceConfig } from '@/shared/types';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  isPlayingExternal?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
  voiceConfig: VoiceConfig[];
  iconType?: 'svg' | 'lucide';
  primaryColor?: string;
}

export default function AudioButton({ 
  text, 
  className = '', 
  size = 'md',
  showText = false,
  isPlayingExternal,
  onPlayStateChange,
  voiceConfig,
  iconType = 'lucide',
  primaryColor = '#3b82f6'
}: AudioButtonProps) {
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioService] = useState(() => new UnifiedAudioService(voiceConfig));
  
  // Use external playing state if provided, otherwise use internal state
  const isPlaying = isPlayingExternal !== undefined ? isPlayingExternal : isPlayingInternal;
  
  // Sync internal state with external state if provided
  useEffect(() => {
    if (isPlayingExternal !== undefined) {
      setIsPlayingInternal(isPlayingExternal);
    }
  }, [isPlayingExternal]);

  const handlePlay = async () => {
    if (isPlaying) {
      audioService.cancelSpeech();
      setIsPlayingInternal(false);
      if (onPlayStateChange) onPlayStateChange(false);
      return;
    }

    setError(null);
    setIsPlayingInternal(true);
    if (onPlayStateChange) onPlayStateChange(true);

    try {
      await audioService.speak(text, 0.9, 1);
    } catch (err) {
      setError('Speech failed');
      console.error('Speech error:', err);
    } finally {
      setIsPlayingInternal(false);
      if (onPlayStateChange) onPlayStateChange(false);
    }
  };

  // Determine icon size based on the size prop
  const iconSizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];

  // Determine button size based on the size prop
  const buttonSizeClass = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }[size];

  const renderIcon = () => {
    if (iconType === 'lucide') {
      return isPlaying ? (
        <VolumeX className={iconSizeClass} />
      ) : (
        <Volume2 className={iconSizeClass} />
      );
    } else {
      // SVG icons for compatibility
      return isPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      );
    }
  };

  return (
    <button
      onClick={handlePlay}
      className={`flex items-center justify-center ${buttonSizeClass} rounded-full text-white hover:opacity-90 transition-all ${className} ${error ? 'bg-red-500' : ''}`}
      style={{ backgroundColor: error ? '#ef4444' : primaryColor }}
      title={error || 'Play audio'}
      disabled={error !== null}
      aria-label={isPlaying ? 'Stop audio' : 'Play audio'}
    >
      {renderIcon()}
      {showText && <span className="ml-2">{isPlaying ? 'Stop' : 'Play'}</span>}
    </button>
  );
}