"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import { UnifiedAudioService } from "@/shared/utils/audioService";
import { Flashcard } from "@/shared/types";
import Link from "next/link";
import { playCorrect, playIncorrect } from "@/shared/utils/soundEffects";
import CategoryFilterModal from "@/shared/components/CategoryFilterModal";
import FilterButton from "@/shared/components/FilterButton";

export default function SpeakPage() {
  const { config, currentLanguage } = useLanguage();
  const { isPwa } = usePwa();
  const localStorage = useMemo(() => new UnifiedLocalStorage(`${config.code}-flashcards`), [config.code]);
  const audioService = useMemo(() => new UnifiedAudioService(config.voiceOptions), [config.voiceOptions]);

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkipFeedback, setShowSkipFeedback] = useState(false);

  useEffect(() => {
    const allCategories = localStorage.getCategories();
    const categoryNames = allCategories.map(cat => cat.name);
    setCategories(categoryNames);
    loadCardsForReview();
  }, []);

  useEffect(() => {
    loadCardsForReview();
  }, [selectedCategory]);

  const totalCards = useMemo(() => {
    return cards.length + stats.correct + stats.skipped;
  }, [cards.length, stats.correct, stats.skipped]);

  const loadCardsForReview = () => {
    let cardsToReview = localStorage.getFlashcardsForSpeakingReview();

    if (selectedCategory === null) {
      cardsToReview = cardsToReview.filter(card => !card.categoryId);
    } else if (selectedCategory !== undefined) {
      const allCategories = localStorage.getCategories();
      const category = allCategories.find(cat => cat.name === selectedCategory);
      if (category) {
        cardsToReview = cardsToReview.filter(card => card.categoryId === category.id);
      }
    }

    const shuffled = [...cardsToReview].sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsFinished(shuffled.length === 0);
    setStats({ correct: 0, incorrect: 0, skipped: 0 });
  };

  const currentCard = cards[currentCardIndex] || null;

  const playAudio = useCallback(async () => {
    if (!currentCard || isPlaying) return;

    setIsPlaying(true);
    try {
      await audioService.speak(currentCard.word, 0.9, 1);
    } catch (error) {
      console.error('Audio playback failed:', error);
    } finally {
      setIsPlaying(false);
    }
  }, [currentCard, audioService, isPlaying]);

  const handleShowAnswer = async () => {
    setShowAnswer(true);
    // Auto-play audio when revealing answer
    setTimeout(() => playAudio(), 300);
  };

  const handleResult = (successful: boolean) => {
    if (!currentCard) return;

    if (successful) {
      playCorrect();
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      playIncorrect();
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    localStorage.updateSpeakingReviewLevel(currentCard.id, successful);
    localStorage.updateChallengeProgress(1, 'speaking_practice');

    if (!successful) {
      // Move card to back of queue
      setCards(prevCards => {
        if (prevCards.length <= 1) return prevCards;
        const newCards = [...prevCards];
        const [removed] = newCards.splice(currentCardIndex, 1);
        newCards.push(removed);
        return newCards;
      });
    } else {
      // Remove card from queue
      setCards(prevCards => prevCards.filter((_, i) => i !== currentCardIndex));
      if (currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(0);
      }
    }

    if (cards.length <= 1 && successful) {
      setIsFinished(true);
    }

    setShowAnswer(false);
  };

  const handleSkip = () => {
    if (!currentCard) return;

    setShowSkipFeedback(true);
    setTimeout(() => setShowSkipFeedback(false), 500);

    setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));

    // Remove card without affecting spaced repetition
    setCards(prevCards => prevCards.filter((_, i) => i !== currentCardIndex));

    if (currentCardIndex >= cards.length - 1) {
      setCurrentCardIndex(0);
    }

    if (cards.length <= 1) {
      setIsFinished(true);
    }

    setShowAnswer(false);
  };

  if (!isPwa) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {config.ui.navigation.speak}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Install the app to use speaking practice features
          </p>
          <Link href="/">
            <button
              className="px-6 py-3 rounded-md text-white font-medium"
              style={{ backgroundColor: config.theme.primary }}
            >
              Go to Create Page
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {config.ui.navigation.speak}
        </h1>
        <FilterButton onClick={() => setShowCategoryFilter(true)} />
      </div>

      {/* Progress bar */}
      {!isFinished && totalCards > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>{stats.correct + stats.skipped} / {totalCards}</span>
            <span className="flex gap-3">
              <span className="text-green-500">{stats.correct} correct</span>
              {stats.incorrect > 0 && (
                <span className="text-red-500">{stats.incorrect} retry</span>
              )}
              {stats.skipped > 0 && (
                <span className="text-gray-400">{stats.skipped} skipped</span>
              )}
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${((stats.correct + stats.skipped) / totalCards) * 100}%`,
                backgroundColor: config.theme.primary
              }}
            />
          </div>
        </div>
      )}

      {/* Skip feedback toast */}
      {showSkipFeedback && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          Skipped
        </div>
      )}

      {/* Finished state */}
      {isFinished && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
            Session Complete!
          </h2>

          {/* Stats summary */}
          <div className="flex justify-center gap-6 my-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.correct}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.incorrect}</div>
              <div className="text-sm text-gray-500">Retried</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">{stats.skipped}</div>
              <div className="text-sm text-gray-500">Skipped</div>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <button
              onClick={() => {
                setSelectedCategory(undefined);
                setTimeout(loadCardsForReview, 100);
              }}
              className="w-full py-3 px-4 text-white rounded-md"
              style={{ backgroundColor: config.theme.primary }}
            >
              Practice Again
            </button>
            <Link href="/">
              <button
                className="w-full py-3 px-4 text-gray-700 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600"
              >
                Create New Cards
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Card */}
      {!isFinished && currentCard && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Category tag */}
          {currentCard.category && (
            <div
              className="px-4 py-1.5 text-xs font-medium text-white"
              style={{ backgroundColor: config.theme.accent }}
            >
              {currentCard.category}
            </div>
          )}

          <div className="p-6">
            {/* Prompt - what to say */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Say this in {config.name}:
              </p>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentCard.translation}
              </h2>
            </div>

            {/* Answer section */}
            {showAnswer && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 text-center">
                  Answer:
                </p>
                <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                  {currentCard.word}
                </h3>
                {currentCard.pronunciation && (
                  <p className="text-lg text-gray-500 dark:text-gray-400 text-center mb-4">
                    {currentCard.pronunciation}
                  </p>
                )}

                {/* Audio button - prominent */}
                <button
                  onClick={playAudio}
                  disabled={isPlaying}
                  className="w-full py-4 rounded-lg flex items-center justify-center gap-3 transition-all"
                  style={{
                    backgroundColor: isPlaying ? config.theme.primary + '80' : config.theme.primary + '20',
                    color: config.theme.primary
                  }}
                >
                  {isPlaying ? (
                    <>
                      <svg className="w-6 h-6 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                      </svg>
                      Playing...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                      </svg>
                      Tap to hear pronunciation
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isFinished && currentCard && (
        <div className="space-y-3">
          {!showAnswer ? (
            <>
              <button
                onClick={handleShowAnswer}
                className="w-full text-white py-4 rounded-lg font-medium shadow-md text-lg"
                style={{ backgroundColor: config.theme.primary }}
              >
                Show Answer
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-3 text-gray-500 dark:text-gray-400 text-sm"
              >
                Skip this word →
              </button>
            </>
          ) : (
            <>
              <div className="flex gap-3">
                <button
                  onClick={() => handleResult(false)}
                  className="flex-1 bg-red-500 text-white py-4 rounded-lg font-medium text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Again
                </button>
                <button
                  onClick={() => handleResult(true)}
                  className="flex-1 bg-green-500 text-white py-4 rounded-lg font-medium text-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Got it
                </button>
              </div>
              <button
                onClick={handleSkip}
                className="w-full py-3 text-gray-500 dark:text-gray-400 text-sm"
              >
                Skip this word →
              </button>
            </>
          )}
        </div>
      )}

      <CategoryFilterModal
        isOpen={showCategoryFilter}
        onClose={() => setShowCategoryFilter(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
