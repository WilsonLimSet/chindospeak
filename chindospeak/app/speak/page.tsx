"use client";

import { useState, useEffect } from "react";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import AudioButton from "@/shared/components/AudioButton";
import { UnifiedAudioService } from "@/shared/utils/audioService";
import { Flashcard } from "@/shared/types";
import Link from "next/link";

export default function SpeakPage() {
  const { config, currentLanguage } = useLanguage();
  const { isPwa } = usePwa();
  const [localStorage] = useState(() => new UnifiedLocalStorage(`${config.code}-flashcards`));
  const [audioService] = useState(() => new UnifiedAudioService(config.voiceOptions));
  
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  
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
    // Use spaced repetition logic for speaking review
    let cardsToReview = localStorage.getFlashcardsForSpeakingReview();
    
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
  
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  const handleResult = (successful: boolean) => {
    if (!currentCard) return;
    
    // Update speaking review level using spaced repetition
    localStorage.updateSpeakingReviewLevel(currentCard.id, successful);
    
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
  
  const renderCategoryFilterModal = () => {
    if (!showCategoryFilter) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">
            {currentLanguage === 'chinese' ? '按类别筛选' : 'Filter by Category'}
          </h2>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setShowCategoryFilter(false);
                }}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === undefined
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedCategory === undefined ? config.theme.primary : undefined
                }}
              >
                All Categories
              </button>
              
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryFilter(false);
                }}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === null
                    ? 'text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedCategory === null ? config.theme.primary : undefined
                }}
              >
                No Category
              </button>
              
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setShowCategoryFilter(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm ${
                    selectedCategory === category
                      ? 'text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category ? config.theme.primary : undefined
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryFilter(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {config.ui.buttons.cancel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderFilterButton = () => {
    return (
      <button
        onClick={toggleCategoryFilter}
        className="flex items-center justify-center px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-black dark:text-white text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filter
      </button>
    );
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {config.ui.navigation.speak} Practice
        </h1>
      </div>
      
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
          {renderFilterButton()}
        </div>
      </div>
      
      {/* Finished state */}
      {isFinished && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            {currentLanguage === 'chinese' ? '全部完成！' : 'All Done!'}
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You've reviewed all the cards in this category.
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          {/* Card header with category if available */}
          {currentCard.category && (
            <div 
              className="px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: config.theme.accent }}
            >
              {currentCard.category}
            </div>
          )}
          
          {/* Card content - REVERSED: showing English first for speaking practice */}
          <div className="p-6">
            <div className="mb-6 text-center">
              {/* Show translation first (what they need to say) */}
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {currentCard.translation}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {currentLanguage === 'chinese' ? '说出中文' : 'Say in ' + config.name}
              </p>
              
              {showAnswer && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                    {currentCard.word}
                  </h3>
                  {currentCard.pronunciation && (
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                      {currentCard.pronunciation}
                    </p>
                  )}
                  
                  {/* Add audio button for pronunciation help */}
                  {speechSupported && (
                    <div className="mt-4 flex justify-center">
                      <AudioButton 
                        text={currentCard.word} 
                        size="md" 
                        voiceConfig={config.voiceOptions}
                        iconType="svg"
                        primaryColor={config.theme.primary}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
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
      
      {renderCategoryFilterModal()}
    </div>
  );
}