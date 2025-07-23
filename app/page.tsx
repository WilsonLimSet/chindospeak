"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { UnifiedTranslationService } from "@/shared/utils/translationService";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import PwaWrapper from "@/shared/components/PwaWrapper";
import { Flashcard, Category } from "@/shared/types";
import isChinese from 'is-chinese';
import { PlusCircle, BookOpen, Volume2, Mic, Settings, MessageCircle, Globe } from 'lucide-react';
import Link from 'next/link';
import LanguageSwitcher from '@/shared/components/LanguageSwitcher';

export default function HomePage() {
  const { config, service, currentLanguage, switchLanguage, availableLanguages } = useLanguage();
  const { isPwa, showInstallPrompt } = usePwa();
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidInput, setIsValidInput] = useState(true);
  const [translation, setTranslation] = useState<{
    original: string;
    romanization?: string;
    translation: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const localStorage = new UnifiedLocalStorage(`${config.code}-flashcards`);
  const [stats, setStats] = useState({ total: 0, reviewed: 0, categories: 0 });
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load categories and stats on component mount
  useEffect(() => {
    if (!isClient) return;
    
    const loadedCategories = localStorage.getCategories();
    setCategories(loadedCategories);
    
    const allCards = localStorage.getFlashcards();
    const reviewedCards = allCards.filter(card => card.reviewHistory && card.reviewHistory.length > 0).length;
    setStats({
      total: allCards.length,
      reviewed: reviewedCards,
      categories: loadedCategories.length
    });
  }, [localStorage, isClient]);

  // Validate input based on language
  const isValidLanguageInput = useCallback((text: string): boolean => {
    if (!text.trim()) return true;
    
    if (currentLanguage === 'chinese') {
      const trimmedText = text.replace(/\s+/g, '');
      for (let i = 0; i < trimmedText.length; i++) {
        if (!isChinese(trimmedText[i])) {
          return false;
        }
      }
    } else if (currentLanguage === 'indonesian') {
      // Indonesian uses Latin script
      const indonesianRegex = /^[a-zA-Z\s\-\'\.]+$/;
      return indonesianRegex.test(text.trim());
    }
    
    return true;
  }, [currentLanguage]);

  // Check input validity as user types
  useEffect(() => {
    setIsValidInput(isValidLanguageInput(word));
  }, [word, currentLanguage, isValidLanguageInput]);

  const handleTranslate = async () => {
    setError(null);
    setSaveSuccess(false);
    
    if (!word.trim()) {
      setError(config.ui.messages.error);
      return;
    }
    
    if (!isValidLanguageInput(word)) {
      setError(`Please enter text in ${config.name} only`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await service.translateText(word, 'translation');
      
      let translationData = {
        original: word,
        translation: '',
        romanization: undefined as string | undefined
      };

      if (currentLanguage === 'chinese') {
        // For Chinese, extract translation and get pinyin
        if (result.trans_result && result.trans_result[0]) {
          translationData.translation = result.trans_result[0].dst;
          
          // Check if src_tts contains actual pinyin (not Chinese characters)
          let pinyinFromBaidu = result.trans_result[0].src_tts;
          const hasChinese = pinyinFromBaidu && isChinese(pinyinFromBaidu);
          
          if (pinyinFromBaidu && !hasChinese) {
            // Baidu returned valid pinyin
            translationData.romanization = pinyinFromBaidu;
          } else {
            // Baidu didn't return pinyin or returned Chinese characters, use our fallback
            translationData.romanization = await service.getRomanization!(word);
          }
        }
      } else if (currentLanguage === 'indonesian') {
        // For Indonesian using MyMemory format
        translationData.translation = result.translation;
      }
      
      setTranslation(translationData);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Failed to translate. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!translation) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newCard: Flashcard = {
      id: uuidv4(),
      word: translation.original,
      pronunciation: translation.romanization,
      translation: translation.translation,
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty: 1, // Legacy
      categoryId: selectedCategory,
      reviewHistory: [],
      
      // Initialize skill levels and difficulties
      readingReviewLevel: 0,
      readingNextReviewDate: today,
      readingDifficulty: 1,
      
      listeningReviewLevel: 0,
      listeningNextReviewDate: today,
      listeningDifficulty: 1,
      
      speakingReviewLevel: 0,
      speakingNextReviewDate: today,
      speakingDifficulty: 1
    };
    
    localStorage.addFlashcard(newCard);
    setSaveSuccess(true);
    setTranslation(null);
    setWord("");
    
    // Update stats
    const allCards = localStorage.getFlashcards();
    const loadedCategories = localStorage.getCategories();
    setStats({
      total: allCards.length,
      reviewed: allCards.filter(card => card.reviewHistory && card.reviewHistory.length > 0).length,
      categories: loadedCategories.length
    });
    setCategories(loadedCategories);
    
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleInputClick = () => {
    if (!isPwa) {
      showInstallPrompt();
    }
  };

  const getInputPlaceholder = () => {
    if (!isPwa) return "Install app to use this feature";
    
    return currentLanguage === 'chinese' ? "输入中文" : "Masukkan kata Indonesia";
  };

  const getInputLabel = () => {
    return currentLanguage === 'chinese' 
      ? "Enter Chinese Word or Phrase"
      : "Enter Indonesian Word or Phrase";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        {/* Create Form Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <PlusCircle className="w-6 h-6 mr-3" style={{ color: config.theme.primary }} />
            Create Flashcard
          </h1>

          <div className="mb-6">
            <label htmlFor="word" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {getInputLabel()}
            </label>
            <div className="relative">
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => isPwa ? setWord(e.target.value) : null}
                onClick={handleInputClick}
                className={`w-full p-3 border rounded-lg ${!isPwa ? 'bg-gray-100 cursor-not-allowed' : 'bg-white dark:bg-gray-700'} ${!isValidInput ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 transition-colors`}
                style={{ 
                  focusRingColor: config.theme.primary,
                  '--tw-ring-color': config.theme.primary + '50'
                } as any}
                placeholder={getInputPlaceholder()}
                disabled={!isPwa}
              />
              {!isValidInput && isPwa && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter {config.name} characters only
                </p>
              )}
              {!isPwa && (
                <p className="text-xs mt-1" style={{ color: config.theme.secondary }}>
                  Install the app to use all features
                </p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <PwaWrapper
              onClick={handleTranslate}
              disabled={isLoading || !isValidInput || !word.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                isLoading || !isValidInput || !word.trim() || !isPwa
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-white hover:opacity-90 transform hover:scale-[1.02]'
              }`}
              style={{ 
                backgroundColor: (isLoading || !isValidInput || !word.trim() || !isPwa) 
                  ? undefined 
                  : config.theme.primary 
              }}
            >
              {isLoading ? config.ui.messages.loading : 'Translate'}
            </PwaWrapper>
          </div>
          
          {error && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {saveSuccess && (
            <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
              Flashcard saved successfully!
            </div>
          )}
          
          {!isPwa && (
            <div className="mb-6 p-4 border rounded-lg shadow-sm" style={{ 
              borderColor: config.theme.primary + '40',
              backgroundColor: config.theme.primary + '10'
            }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: config.theme.primary }}>
                Install {config.ui.appName} App
              </h2>
              <p className="mb-3 text-gray-900 dark:text-white">
                Install the app to access all features including:
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-900 dark:text-white space-y-1">
                <li>Translate {config.name} words and phrases</li>
                <li>Create and save flashcards</li>
                <li>Review your flashcards with spaced repetition</li>
                <li>Organize cards with categories</li>
                <li>Use offline when available</li>
              </ul>
            </div>
          )}
          
          {translation && (
            <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Translation Result</h2>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{config.name}</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{translation.original}</p>
              </div>
              
              {translation.romanization && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {currentLanguage === 'chinese' ? 'Pinyin' : 'Pronunciation'}
                  </p>
                  <p className="text-gray-900 dark:text-white">{translation.romanization}</p>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">English</p>
                <p className="text-gray-900 dark:text-white">{translation.translation}</p>
              </div>
              
              {categories.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Category (optional)</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory(undefined)}
                      className={`px-3 py-1 rounded-md text-sm transition-colors ${
                        selectedCategory === undefined
                          ? 'text-white'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === undefined ? config.theme.primary : undefined
                      }}
                    >
                      Uncategorized
                    </button>
                    
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-1 rounded-md text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'text-white'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-500'
                        }`}
                        style={{
                          backgroundColor: selectedCategory === category.id ? category.color : undefined
                        }}
                      >
                        <span 
                          className="inline-block w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={handleSave}
                className="w-full py-3 rounded-lg font-medium text-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-white"
                style={{ backgroundColor: config.theme.primary }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Save as Flashcard
              </button>
              <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                This card will be added to your collection for review
              </p>
            </div>
          )}
        </div>

        {/* Language Switcher - Prominent */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose Your Learning Language</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Currently learning: {config.name}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {availableLanguages.map(({ key, config: langConfig }) => (
              <button
                key={key}
                onClick={() => switchLanguage(key as any)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentLanguage === key
                    ? 'border-opacity-100 shadow-lg transform scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-opacity-60'
                }`}
                style={{
                  borderColor: currentLanguage === key ? langConfig.theme.primary : undefined,
                  backgroundColor: currentLanguage === key ? langConfig.theme.primary + '10' : undefined
                }}
              >
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {langConfig.name}
                  </h4>
                  <p className="text-xl font-bold mb-1" style={{ 
                    color: currentLanguage === key ? langConfig.theme.primary : undefined 
                  }}>
                    {langConfig.nativeName}
                  </p>
                  {currentLanguage === key && (
                    <p className="text-xs font-medium" style={{ color: langConfig.theme.primary }}>
                      Currently Active
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Feature - Make it prominent */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center mb-4">
            <MessageCircle className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Conversation Practice</h2>
              <p className="text-gray-600 dark:text-gray-400">Practice real conversations with AI in {config.name}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Smart Scenarios</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Restaurant orders, directions, shopping, and more</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🧠 Uses Your Vocabulary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI knows your flashcards and adapts conversations</p>
            </div>
          </div>
          
          <Link href="/converse" className="block">
            <button className="w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-white"
              style={{ backgroundColor: config.theme.primary }}>
              <MessageCircle className="w-6 h-6 mr-3" />
              Start Conversation Practice
            </button>
          </Link>
        </div>

        {/* Overview Section */}
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <BookOpen className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Cards</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3" style={{ color: config.theme.secondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reviewed}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <svg className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.998 1.998 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Study Modes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/review" className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-opacity-60 transition-colors group" style={{ borderColor: config.theme.primary + '40' }}>
                <BookOpen className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" style={{ color: config.theme.primary }} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Review Cards</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Study with spaced repetition</p>
                </div>
              </Link>
              
              <Link href="/listen" className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-opacity-60 transition-colors group" style={{ borderColor: config.theme.primary + '40' }}>
                <Volume2 className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" style={{ color: config.theme.primary }} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Listen Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Practice pronunciation</p>
                </div>
              </Link>
              
              <Link href="/speak" className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-opacity-60 transition-colors group" style={{ borderColor: config.theme.primary + '40' }}>
                <Mic className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" style={{ color: config.theme.primary }} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Speak Mode</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Test your pronunciation</p>
                </div>
              </Link>
              
              <Link href="/manage" className="flex items-center p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-opacity-60 transition-colors group" style={{ borderColor: config.theme.primary + '40' }}>
                <Settings className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform" style={{ color: config.theme.primary }} />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Manage Cards</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Edit and organize</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          {stats.total > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Progress Overview</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {stats.total > 0 ? Math.round((stats.reviewed / stats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: config.theme.primary,
                      width: `${stats.total > 0 ? (stats.reviewed / stats.total) * 100 : 0}%`
                    }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.reviewed} of {stats.total} cards reviewed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}