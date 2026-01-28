"use client";

import { useState, useEffect, useMemo } from "react";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import AudioButton from "@/shared/components/AudioButton";
import { UnifiedAudioService } from "@/shared/utils/audioService";
import { Flashcard } from "@/shared/types";
import Link from "next/link";
import { playCorrect, playIncorrect } from "@/shared/utils/soundEffects";
import SwipeableCard from "@/shared/components/SwipeableCard";
import CategoryFilterModal from "@/shared/components/CategoryFilterModal";
import FilterButton from "@/shared/components/FilterButton";

export default function ListenPage() {
  const { config, currentLanguage } = useLanguage();
  const { isPwa } = usePwa();
  const localStorage = useMemo(() => new UnifiedLocalStorage(`${config.code}-flashcards`), [config.code]);
  const audioService = useMemo(() => new UnifiedAudioService(config.voiceOptions), [config.voiceOptions]);
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    setSpeechSupported(audioService.isSpeechSupported());
    
    const allCategories = localStorage.getCategories();
    // Convert Category objects to strings for backward compatibility
    const categoryNames = allCategories.map(cat => cat.name);
    setCategories(categoryNames);
    
    loadCardsForReview();
  }, []);
  
  useEffect(() => {
    if (cards.length === 0) {
      setIsFinished(true);
    } else if (isFinished) {
      setIsFinished(false);
    }
    
    if (currentCardIndex >= cards.length && cards.length > 0) {
      setCurrentCardIndex(cards.length - 1);
    }
  }, [cards.length, currentCardIndex, isFinished]);
  
  useEffect(() => {
    loadCardsForReview();
  }, [selectedCategory]);
  
  const loadCardsForReview = () => {
    // Use spaced repetition logic for listening review
    let cardsToReview = localStorage.getFlashcardsForListeningReview();
    
    // Filter by category if selected
    if (selectedCategory === null) {
      cardsToReview = cardsToReview.filter(card => !card.categoryId);
    } else if (selectedCategory !== undefined) {
      // Find category by name for backward compatibility
      const allCategories = localStorage.getCategories();
      const category = allCategories.find(cat => cat.name === selectedCategory);
      if (category) {
        cardsToReview = cardsToReview.filter(card => card.categoryId === category.id);
      }
    }
    
    // Shuffle the cards
    const shuffled = [...cardsToReview].sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsFinished(shuffled.length === 0);
    setReviewedCards(new Set());
  };
  
  const currentCard = cards.length > 0 && currentCardIndex < cards.length 
    ? cards[currentCardIndex] 
    : null;
  
  useEffect(() => {
    if (autoPlayEnabled && currentCard && !showAnswer && !isPlaying && speechSupported) {
      const timer = setTimeout(async () => {
        try {
          setIsPlaying(true);
          await audioService.speak(currentCard.word, 0.9, 1);
        } catch {
          // Audio playback failed silently
        } finally {
          setIsPlaying(false);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [currentCard, currentCardIndex, autoPlayEnabled, showAnswer, speechSupported, isPlaying]);
  
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  const handleResult = (successful: boolean) => {
    if (!currentCard) return;

    // Play sound effect
    if (successful) {
      playCorrect();
    } else {
      playIncorrect();
    }

    // Update listening review level using spaced repetition
    localStorage.updateListeningReviewLevel(currentCard.id, successful);

    // Update daily challenge progress
    localStorage.updateChallengeProgress(1, 'listening_practice');

    setReviewedCards(prev => new Set(prev).add(currentCard.id));
    
    if (!successful) {
      // Move card to back of queue for immediate retry
      setCards(prevCards => {
        if (prevCards.length <= 1) {
          return prevCards;
        }
        
        const currentCardItem = prevCards[currentCardIndex];
        const newCards = prevCards.filter((_, index) => index !== currentCardIndex);
        const updatedCards = [...newCards, currentCardItem];
        
        return updatedCards;
      });
      
      if (currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(0);
      }
    } else {
      // Remove card from current session (it's been successfully reviewed)
      setCards(prevCards => {
        const newCards = prevCards.filter((_, index) => index !== currentCardIndex);
        return newCards;
      });
      
      // Adjust current index if necessary
      if (currentCardIndex >= cards.length - 1) {
        setCurrentCardIndex(0);
        if (cards.length <= 1) {
          setIsFinished(true);
        }
      }
    }
    
    setShowAnswer(false);
  };
  
  const toggleCategoryFilter = () => {
    setShowCategoryFilter(!showCategoryFilter);
  };
  
  const toggleAutoPlay = () => {
    setAutoPlayEnabled(!autoPlayEnabled);
  };
  

  const renderAutoPlayToggle = () => {
    return (
      <button
        onClick={toggleAutoPlay}
        className={`flex items-center justify-center px-3 py-2 rounded-md transition-colors text-sm ${
          autoPlayEnabled 
            ? 'text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        style={{
          backgroundColor: autoPlayEnabled ? config.theme.secondary : undefined
        }}
        title={autoPlayEnabled ? "Auto-play enabled" : "Auto-play disabled"}
      >
        {autoPlayEnabled ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        Auto-Play
      </button>
    );
  };

  if (!isPwa) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            {config.ui.navigation.listen}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Install the app to use listening practice features
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {config.ui.navigation.listen} Practice
        </h1>
      </div>
      
      {!speechSupported && (
        <div className="bg-yellow-100 dark:bg-yellow-900 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700 dark:text-yellow-300">
            Your browser doesn&apos;t support text-to-speech. Please try a different browser for the listening mode.
          </p>
        </div>
      )}
      
      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-center p-2 rounded-lg flex-1 mr-2" style={{ backgroundColor: config.theme.secondary + '20' }}>
            <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mb-1">Reviewed</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: config.theme.primary }}>
              {reviewedCards.size}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg flex-1 ml-2" style={{ backgroundColor: config.theme.accent + '20' }}>
            <p className="text-xs sm:text-sm text-gray-900 dark:text-white font-medium mb-1">To Review</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: config.theme.accent }}>
              {Math.max(0, cards.length - currentCardIndex)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          {renderAutoPlayToggle()}
          <FilterButton onClick={toggleCategoryFilter} />
        </div>
      </div>
      
      {/* Finished state */}
      {isFinished && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {currentLanguage === 'chinese' ? '全部完成！' : 'All Done!'}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You&apos;ve reviewed all the cards in this category.
          </p>
          <div className="flex flex-col space-y-3">
            <Link href="/">
              <button 
                className="w-full py-3 px-4 text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: config.theme.secondary }}
              >
                {config.ui.navigation.create} New Flashcard
              </button>
            </Link>
            <button 
              onClick={() => {
                setSelectedCategory(undefined);
                setTimeout(() => {
                  loadCardsForReview();
                }, 100);
              }}
              className="w-full py-3 px-4 text-white rounded-md hover:opacity-90"
              style={{ backgroundColor: config.theme.accent }}
            >
              Review All Categories
            </button>
          </div>
        </div>
      )}
      
      {/* Card */}
      {!isFinished && currentCard && (
        <SwipeableCard
          onSwipeLeft={() => handleResult(false)}
          onSwipeRight={() => handleResult(true)}
          enabled={showAnswer}
        >
          <div className="rounded-lg shadow-md overflow-hidden mb-6">
            {/* Card header with category if available */}
            {currentCard.category && (
              <div
                className="px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: config.theme.accent }}
              >
                {currentCard.category}
              </div>
            )}

            {/* Card content */}
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="flex justify-center mb-4">
                  <AudioButton
                    text={currentCard.word}
                    size="lg"
                    showText={true}
                    isPlayingExternal={isPlaying}
                    onPlayStateChange={(playing) => setIsPlaying(playing)}
                    voiceConfig={config.voiceOptions}
                    iconType="svg"
                    primaryColor={config.theme.primary}
                  />
                </div>

                {showAnswer && (
                  <div className="mt-2">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                      {currentCard.word}
                    </h2>
                    {currentCard.pronunciation && (
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        {currentCard.pronunciation}
                      </p>
                    )}
                    <p className="text-lg font-medium text-gray-900 dark:text-white mt-4">
                      {currentCard.translation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </SwipeableCard>
      )}
      
      {/* Actions */}
      {!isFinished && currentCard && (
        <div className="flex flex-col items-center">
          {!showAnswer ? (
            <button
              onClick={handleShowAnswer}
              className="w-full max-w-xs text-white py-3 px-6 rounded-lg font-medium shadow-md transition-all duration-300 flex items-center justify-center"
              style={{ backgroundColor: config.theme.secondary }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              Show Answer
            </button>
          ) : (
            <div className="flex space-x-4 justify-center w-full">
              <button
                onClick={() => handleResult(false)}
                className="flex-1 max-w-xs bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-500 font-medium shadow-md transition-all duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Again
              </button>
              <button
                onClick={() => handleResult(true)}
                className="flex-1 max-w-xs bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-500 font-medium shadow-md transition-all duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Got It
              </button>
            </div>
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