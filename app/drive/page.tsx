"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import { UnifiedAudioService } from "@/shared/utils/audioService";
import { useWakeLock } from "@/shared/hooks/useWakeLock";
import { isAnswerCorrect } from "@/shared/utils/fuzzyMatch";
import { Flashcard, Category, DriveQuizState, DriveQuizDirection } from "@/shared/types";
import { Car, Square, Volume2, Mic, Loader2, Settings, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function DrivePage() {
  const { config, currentLanguage } = useLanguage();
  const { isPwa } = usePwa();

  const localStorage = useMemo(
    () => new UnifiedLocalStorage(`${config.code}-flashcards`),
    [config.code]
  );

  const audioService = useMemo(
    () => new UnifiedAudioService(config.voiceOptions),
    [config.voiceOptions]
  );

  const wakeLock = useWakeLock();

  // Settings state
  const [showSettings, setShowSettings] = useState(true);
  const [direction, setDirection] = useState<DriveQuizDirection>('mixed');
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);

  // Quiz state
  const [quizState, setQuizState] = useState<DriveQuizState>('idle');
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [currentDirection, setCurrentDirection] = useState<'translation_to_word' | 'word_to_translation'>('translation_to_word');
  const [cardsRemaining, setCardsRemaining] = useState(0);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);
  const [lastWasCorrect, setLastWasCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [tapMode, setTapMode] = useState(false); // iOS fallback mode

  // Refs
  const cardQueueRef = useRef<Flashcard[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const directionToggleRef = useRef(true);
  const isRunningRef = useRef(false);
  const errorCountRef = useRef(0);
  const correctCountRef = useRef(0);
  const currentCardRef = useRef<Flashcard | null>(null);
  const currentDirectionRef = useRef<'translation_to_word' | 'word_to_translation'>('translation_to_word');

  // Load categories on mount
  useEffect(() => {
    setCategories(localStorage.getCategories());
  }, [localStorage]);

  // Check speech recognition support on mount
  useEffect(() => {
    const hasRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setTapMode(!hasRecognition);
  }, []);

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognitionRef.current = recognition;
      return true;
    }
    return false;
  }, []);

  // Get quiz direction for current card
  const getQuizDirection = useCallback((): 'translation_to_word' | 'word_to_translation' => {
    if (direction === 'mixed') {
      directionToggleRef.current = !directionToggleRef.current;
      return directionToggleRef.current ? 'translation_to_word' : 'word_to_translation';
    }
    return direction;
  }, [direction]);

  // Generate prompt text
  const generatePrompt = useCallback((card: Flashcard, dir: 'translation_to_word' | 'word_to_translation'): string => {
    if (dir === 'translation_to_word') {
      const langName = currentLanguage === 'chinese' ? 'Chinese' : 'Indonesian';
      return `How do you say "${card.translation}" in ${langName}?`;
    } else {
      return `What does "${card.word}" mean?`;
    }
  }, [currentLanguage]);

  // Start listening for answer
  const startListening = useCallback((expectedLang: 'target' | 'english') => {
    if (!recognitionRef.current) {
      if (!initRecognition()) return;
    }

    const recognition = recognitionRef.current!;

    // Set language based on what we expect to hear
    if (expectedLang === 'english') {
      recognition.lang = 'en-US';
    } else {
      recognition.lang = currentLanguage === 'chinese' ? 'zh-CN' : 'id-ID';
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleAnswer(transcript);
    };

    recognition.onerror = (event) => {
      handleRecognitionError(event.error);
    };

    recognition.onend = () => {
      // Will be handled by state transitions
    };

    try {
      recognition.start();
      setQuizState('listening');
    } catch {
      handleRecognitionError('start-failed');
    }
  }, [currentLanguage, initRecognition]);

  // Handle user's answer
  const handleAnswer = useCallback(async (transcript: string) => {
    const card = currentCardRef.current;
    const dir = currentDirectionRef.current;

    if (!card || !isRunningRef.current) return;

    setQuizState('validating');
    setLastAnswer(transcript);

    const expectedAnswer = dir === 'translation_to_word'
      ? card.word
      : card.translation;

    const { correct } = isAnswerCorrect(
      transcript,
      expectedAnswer,
      currentLanguage,
      0.6
    );

    setLastWasCorrect(correct);

    // Update spaced repetition (unless practice mode)
    if (!practiceMode) {
      if (dir === 'translation_to_word') {
        localStorage.updateSpeakingReviewLevel(card.id, correct);
      } else {
        localStorage.updateListeningReviewLevel(card.id, correct);
      }
    }

    // Generate feedback
    setQuizState('speaking_feedback');

    let feedbackText: string;
    if (correct) {
      feedbackText = currentLanguage === 'chinese'
        ? `对！${card.word}`
        : `Correct! ${card.word}`;
    } else {
      feedbackText = currentLanguage === 'chinese'
        ? `答案是 ${expectedAnswer}`
        : `The answer is ${expectedAnswer}`;
    }

    try {
      await audioService.speak(feedbackText, 0.9, 1);
    } catch {
      // TTS failed silently
    }

    // Handle card queue
    if (correct) {
      cardQueueRef.current.shift();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      // Move to back of queue
      const failedCard = cardQueueRef.current.shift()!;
      cardQueueRef.current.push(failedCard);
    }

    setCardsReviewed(prev => prev + 1);
    setCardsRemaining(cardQueueRef.current.length);
    errorCountRef.current = 0;

    // Continue to next card
    await proceedToNext();
  }, [currentLanguage, practiceMode, localStorage, audioService]);

  // Handle tap mode response (iOS fallback)
  const handleTapResponse = useCallback(async (correct: boolean) => {
    const card = currentCardRef.current;
    const dir = currentDirectionRef.current;

    if (!card || !isRunningRef.current) return;

    setLastWasCorrect(correct);

    // Update spaced repetition (unless practice mode)
    if (!practiceMode) {
      if (dir === 'translation_to_word') {
        localStorage.updateSpeakingReviewLevel(card.id, correct);
      } else {
        localStorage.updateListeningReviewLevel(card.id, correct);
      }
    }

    // Generate feedback
    setQuizState('speaking_feedback');

    let feedbackText: string;
    if (correct) {
      feedbackText = currentLanguage === 'chinese' ? '好！' : 'Good!';
    } else {
      feedbackText = currentLanguage === 'chinese' ? '继续加油' : 'Keep practicing';
    }

    try {
      await audioService.speak(feedbackText, 0.9, 1);
    } catch {
      // TTS failed silently
    }

    // Handle card queue
    if (correct) {
      cardQueueRef.current.shift();
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
    } else {
      // Move to back of queue
      const failedCard = cardQueueRef.current.shift()!;
      cardQueueRef.current.push(failedCard);
    }

    setCardsReviewed(prev => prev + 1);
    setCardsRemaining(cardQueueRef.current.length);

    // Continue to next card
    await proceedToNext();
  }, [currentLanguage, practiceMode, localStorage, audioService]);

  // Handle recognition errors
  const handleRecognitionError = useCallback(async (error: string) => {
    if (!isRunningRef.current) return;

    errorCountRef.current += 1;

    if (errorCountRef.current >= 3) {
      // Skip this card after 3 failures
      setQuizState('speaking_feedback');

      const skipMessage = currentLanguage === 'chinese'
        ? "跳过这个"
        : "Let's skip this one";

      try {
        await audioService.speak(skipMessage, 0.9, 1);
      } catch {
        // TTS failed silently
      }

      // Move card to back
      if (cardQueueRef.current.length > 0) {
        const skippedCard = cardQueueRef.current.shift()!;
        cardQueueRef.current.push(skippedCard);
        setCardsRemaining(cardQueueRef.current.length);
      }

      errorCountRef.current = 0;
      await proceedToNext();
    } else {
      // Retry
      setQuizState('speaking_feedback');

      const retryMessage = currentLanguage === 'chinese'
        ? "请再说一次"
        : "Please try again";

      try {
        await audioService.speak(retryMessage, 0.9, 1);
      } catch {
        // TTS failed silently
      }

      // Wait a moment then listen again
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isRunningRef.current) {
        const expectedLang = currentDirectionRef.current === 'word_to_translation' ? 'english' : 'target';
        startListening(expectedLang);
      }
    }
  }, [currentLanguage, audioService, startListening]);

  // Proceed to next card
  const proceedToNext = useCallback(async () => {
    if (!isRunningRef.current) return;

    if (cardQueueRef.current.length === 0) {
      setQuizState('finished');
      isRunningRef.current = false;

      // Speak completion message
      const completeMessage = currentLanguage === 'chinese'
        ? `练习完成！答对了${correctCountRef.current}个`
        : `Practice complete! You got ${correctCountRef.current} correct`;

      try {
        await audioService.speak(completeMessage, 0.9, 1);
      } catch {
        // TTS failed silently
      }

      wakeLock.release();
      return;
    }

    // Small delay before next card
    await new Promise(resolve => setTimeout(resolve, 800));

    if (!isRunningRef.current) return;

    const nextCard = cardQueueRef.current[0];
    const nextDirection = getQuizDirection();

    // Update refs first (for callbacks)
    currentCardRef.current = nextCard;
    currentDirectionRef.current = nextDirection;
    // Update state for UI
    setCurrentCard(nextCard);
    setCurrentDirection(nextDirection);
    setQuizState('speaking_prompt');

    const prompt = generatePrompt(nextCard, nextDirection);

    try {
      await audioService.speak(prompt, 0.9, 1);
    } catch {
      // TTS failed silently
    }

    if (!isRunningRef.current) return;

    // Start listening or wait for tap
    if (tapMode) {
      setShowAnswer(false);
      setQuizState('listening'); // Reuse 'listening' state for tap mode
    } else {
      const expectedLang = nextDirection === 'word_to_translation' ? 'english' : 'target';
      startListening(expectedLang);
    }
  }, [currentLanguage, audioService, wakeLock, getQuizDirection, generatePrompt, startListening, tapMode]);

  // Start the quiz
  const handleStart = useCallback(async () => {
    // Load cards for review
    const listeningCards = localStorage.getFlashcardsForListeningReview();
    const speakingCards = localStorage.getFlashcardsForSpeakingReview();

    // Combine and deduplicate
    const cardMap = new Map<string, Flashcard>();
    [...listeningCards, ...speakingCards].forEach(card => {
      cardMap.set(card.id, card);
    });

    let allCards = Array.from(cardMap.values());

    // Filter by category if selected
    if (selectedCategoryId) {
      allCards = allCards.filter(c => c.categoryId === selectedCategoryId);
    }

    // Shuffle
    const shuffled = [...allCards].sort(() => Math.random() - 0.5);

    if (shuffled.length === 0) {
      // No cards to review
      setQuizState('finished');
      const noCardsMessage = currentLanguage === 'chinese'
        ? "没有需要复习的卡片"
        : "No cards due for review";

      try {
        await audioService.speak(noCardsMessage, 0.9, 1);
      } catch {
        // TTS failed silently
      }
      return;
    }

    // Initialize state
    cardQueueRef.current = shuffled;
    isRunningRef.current = true;
    errorCountRef.current = 0;
    correctCountRef.current = 0;
    setCardsRemaining(shuffled.length);
    setCardsReviewed(0);
    setCorrectCount(0);
    setLastAnswer(null);
    setLastWasCorrect(null);
    setShowSettings(false);

    // Request wake lock
    wakeLock.request();

    // Initialize recognition
    initRecognition();

    // Start first card
    const firstCard = shuffled[0];
    const firstDirection = getQuizDirection();

    // Update refs first (for callbacks)
    currentCardRef.current = firstCard;
    currentDirectionRef.current = firstDirection;
    // Update state for UI
    setCurrentCard(firstCard);
    setCurrentDirection(firstDirection);
    setQuizState('speaking_prompt');

    const prompt = generatePrompt(firstCard, firstDirection);

    try {
      await audioService.speak(prompt, 0.9, 1);
    } catch {
      // TTS failed silently
    }

    if (!isRunningRef.current) return;

    // Start listening or wait for tap
    if (tapMode) {
      setShowAnswer(false);
      setQuizState('listening');
    } else {
      const expectedLang = firstDirection === 'word_to_translation' ? 'english' : 'target';
      startListening(expectedLang);
    }
  }, [localStorage, selectedCategoryId, currentLanguage, audioService, wakeLock, initRecognition, getQuizDirection, generatePrompt, startListening, tapMode]);

  // Stop the quiz
  const handleStop = useCallback(() => {
    isRunningRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore
      }
    }

    audioService.cancelSpeech();
    wakeLock.release();

    setQuizState('idle');
    setShowSettings(true);
  }, [audioService, wakeLock]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore
        }
      }
      audioService.cancelSpeech();
    };
  }, [audioService]);

  const getStateIcon = () => {
    switch (quizState) {
      case 'speaking_prompt':
      case 'speaking_feedback':
        return <Volume2 className="w-20 h-20 animate-pulse" />;
      case 'listening':
        return tapMode ? <Car className="w-20 h-20" /> : <Mic className="w-20 h-20" />;
      case 'validating':
        return <Loader2 className="w-20 h-20 animate-spin" />;
      default:
        return <Car className="w-20 h-20" />;
    }
  };

  const getStateText = () => {
    switch (quizState) {
      case 'speaking_prompt':
        return currentLanguage === 'chinese' ? "正在出题..." : "Asking...";
      case 'listening':
        return tapMode
          ? (currentLanguage === 'chinese' ? "点击下方按钮" : "Tap below")
          : (currentLanguage === 'chinese' ? "请回答..." : "Listening...");
      case 'speaking_feedback':
        if (lastWasCorrect === true) {
          return currentLanguage === 'chinese' ? "正确！" : "Correct!";
        } else if (lastWasCorrect === false) {
          return currentLanguage === 'chinese' ? "再试试" : "Try again";
        }
        return currentLanguage === 'chinese' ? "..." : "...";
      case 'validating':
        return currentLanguage === 'chinese' ? "检查中..." : "Checking...";
      case 'finished':
        return currentLanguage === 'chinese' ? "完成！" : "Finished!";
      default:
        return currentLanguage === 'chinese' ? "准备就绪" : "Ready";
    }
  };

  // PWA check
  if (!isPwa) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <Car className="w-16 h-16 mx-auto mb-4" style={{ color: config.theme.primary }} />
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {currentLanguage === 'chinese' ? '驾驶模式' : 'Drive Mode'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {currentLanguage === 'chinese'
              ? '请安装应用以使用驾驶模式'
              : 'Install the app to use Drive Mode'}
          </p>
          <Link href="/">
            <button
              className="px-6 py-3 rounded-md text-white font-medium"
              style={{ backgroundColor: config.theme.primary }}
            >
              {currentLanguage === 'chinese' ? '返回首页' : 'Go to Home'}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Settings screen
  if (showSettings) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
          <Car className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} />
          {currentLanguage === 'chinese' ? '驾驶模式' : 'Drive Mode'}
        </h1>

        <div className={`rounded-lg p-4 mb-6 border ${tapMode ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
          <p className={`text-sm ${tapMode ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'}`}>
            {tapMode
              ? (currentLanguage === 'chinese'
                  ? '📱 点按模式：语音识别不支持，但你仍可以听音频并点按回答。'
                  : '📱 Tap Mode: Voice recognition not supported, but you can still hear audio and tap to answer.')
              : (currentLanguage === 'chinese'
                  ? '🚗 开始后，应用会自动出题并听取你的回答。无需触碰屏幕。'
                  : '🚗 Once started, the app will ask questions and listen for your answers automatically. No screen interaction needed.')}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            {currentLanguage === 'chinese' ? '设置' : 'Settings'}
          </h2>

          {/* Direction selector */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {currentLanguage === 'chinese' ? '练习方向' : 'Quiz Direction'}
            </label>
            <div className="space-y-2">
              {[
                { value: 'mixed' as const, label: currentLanguage === 'chinese' ? '混合（交替）' : 'Both (alternating)' },
                { value: 'translation_to_word' as const, label: currentLanguage === 'chinese' ? '英文 → 目标语言' : 'English → Target Language' },
                { value: 'word_to_translation' as const, label: currentLanguage === 'chinese' ? '目标语言 → 英文' : 'Target Language → English' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setDirection(option.value)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    direction === option.value
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: direction === option.value ? config.theme.primary : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category selector */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {currentLanguage === 'chinese' ? '分类' : 'Category'}
            </label>
            <div className="relative">
              <select
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(e.target.value || undefined)}
                className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10"
              >
                <option value="">
                  {currentLanguage === 'chinese' ? '全部分类' : 'All Categories'}
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Practice mode toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentLanguage === 'chinese' ? '练习模式（不更新复习进度）' : 'Practice Mode (no SRS updates)'}
              </span>
              <button
                onClick={() => setPracticeMode(!practiceMode)}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  practiceMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
                    practiceMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-5 rounded-xl text-white text-xl font-bold shadow-lg transition-transform active:scale-95"
          style={{ backgroundColor: config.theme.primary }}
        >
          {currentLanguage === 'chinese' ? '开始练习' : 'Start Practice'}
        </button>

        {!wakeLock.isSupported && (
          <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400 text-center">
            {currentLanguage === 'chinese'
              ? '⚠️ 屏幕常亮功能不支持，练习时屏幕可能会关闭'
              : '⚠️ Wake Lock not supported - screen may turn off during practice'}
          </p>
        )}

        {quizState === 'finished' && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-center text-green-800 dark:text-green-300">
              {currentLanguage === 'chinese'
                ? `上次练习：答对 ${correctCount}/${cardsReviewed} 个`
                : `Last session: ${correctCount}/${cardsReviewed} correct`}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Active session - minimal UI
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
      {/* Status indicator */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className={`w-48 h-48 rounded-full flex items-center justify-center mb-8 transition-colors ${
            quizState === 'listening' ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: quizState === 'listening'
              ? '#ef4444'
              : lastWasCorrect === true
                ? '#22c55e'
                : lastWasCorrect === false
                  ? '#f97316'
                  : config.theme.primary + '30'
          }}
        >
          <div style={{
            color: quizState === 'listening' || lastWasCorrect !== null
              ? 'white'
              : config.theme.primary
          }}>
            {getStateIcon()}
          </div>
        </div>

        <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {getStateText()}
        </p>

        {/* Progress */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          {currentLanguage === 'chinese'
            ? `已复习 ${cardsReviewed} | 剩余 ${cardsRemaining}`
            : `${cardsReviewed} reviewed | ${cardsRemaining} remaining`}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-500">
          {currentLanguage === 'chinese'
            ? `正确 ${correctCount}`
            : `${correctCount} correct`}
        </p>
      </div>

      {/* Tap mode controls (iOS fallback) */}
      {tapMode && quizState === 'listening' && currentCard && (
        <div className="w-full max-w-sm mb-8">
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-4 rounded-xl text-white text-lg font-bold shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: config.theme.primary }}
            >
              {currentLanguage === 'chinese' ? '显示答案' : 'Show Answer'}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Show the answer */}
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {currentDirection === 'translation_to_word'
                    ? (currentLanguage === 'chinese' ? '答案' : 'Answer')
                    : (currentLanguage === 'chinese' ? '意思' : 'Meaning')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentDirection === 'translation_to_word'
                    ? currentCard.word
                    : currentCard.translation}
                </p>
                {currentDirection === 'translation_to_word' && currentCard.pronunciation && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {currentCard.pronunciation}
                  </p>
                )}
              </div>

              {/* Got it / Again buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleTapResponse(false)}
                  className="py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold shadow-lg transition-transform active:scale-95"
                >
                  {currentLanguage === 'chinese' ? '再来' : 'Again'}
                </button>
                <button
                  onClick={() => handleTapResponse(true)}
                  className="py-4 rounded-xl bg-green-500 hover:bg-green-600 text-white text-lg font-bold shadow-lg transition-transform active:scale-95"
                >
                  {currentLanguage === 'chinese' ? '会了' : 'Got it'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Big stop button */}
      <button
        onClick={handleStop}
        className="w-28 h-28 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xl transition-all active:scale-95"
      >
        <Square className="w-12 h-12" />
      </button>

      {/* Last answer feedback (voice mode only) */}
      {!tapMode && lastAnswer && (
        <div className={`mt-8 p-4 rounded-lg max-w-sm ${
          lastWasCorrect ? 'bg-green-100 dark:bg-green-900/30' : 'bg-orange-100 dark:bg-orange-900/30'
        }`}>
          <p className="text-center text-sm text-gray-700 dark:text-gray-300">
            {currentLanguage === 'chinese' ? '你说：' : 'You said: '}&quot;{lastAnswer}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
