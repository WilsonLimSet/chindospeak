"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import PwaWrapper from "@/shared/components/PwaWrapper";
import { Flashcard, Category, StreakData, DailyChallenge, DailyActivity } from "@/shared/types";
import isChinese from 'is-chinese';
import { PlusCircle, Car, Headphones, Mic, BookOpen } from 'lucide-react';
import Link from 'next/link';
import StreakDisplay from '@/shared/components/StreakDisplay';
import StreakWarningBanner from '@/shared/components/StreakWarningBanner';
import DailyChallengeCard from '@/shared/components/DailyChallengeCard';
import ChallengeCompletionModal from '@/shared/components/ChallengeCompletionModal';
import ActivityHeatMap from '@/shared/components/ActivityHeatMap';
import NotificationPermissionPrompt from '@/shared/components/NotificationPermissionPrompt';
import { generateDailyChallenge } from '@/shared/utils/challengeGenerator';
import { notifyDueCards, getNotificationPermission } from '@/shared/utils/notificationUtils';

// Landing page for web visitors
function LandingPage() {
  const { config } = useLanguage();
  const { showInstallPrompt } = usePwa();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Text content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
              ChindoSpeak
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Learn Chinese and Indonesian with hands-free audio quizzes. Practice while you drive, commute, or walk.
            </p>

            {/* Languages */}
            <div className="flex gap-6 mb-8">
              <div>
                <p className="text-3xl font-bold" style={{ color: '#DC2626' }}>中文</p>
                <p className="text-sm text-gray-500">Mandarin Chinese</p>
              </div>
              <div className="border-l border-gray-300 dark:border-gray-600 pl-6">
                <p className="text-3xl font-bold" style={{ color: '#059669' }}>Bahasa</p>
                <p className="text-sm text-gray-500">Indonesian</p>
              </div>
            </div>

            {/* CTA - different for mobile vs desktop */}
            {isMobile ? (
              <>
                <button
                  onClick={showInstallPrompt}
                  className="px-8 py-4 rounded-lg font-semibold text-lg transition-all hover:opacity-90 text-white mb-4"
                  style={{ backgroundColor: config.theme.primary }}
                >
                  Add to Home Screen
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Free PWA · Works offline · No account needed
                </p>
              </>
            ) : (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 inline-block">
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Open on mobile to install as an app
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Free PWA · Works offline · No account needed
                </p>
              </div>
            )}
          </div>

          {/* Right side - Feature preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              {/* Drive Mode Feature */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Drive Mode</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hands-free audio quizzes with voice recognition</p>
                </div>
              </div>

              {/* Flashcards Feature */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Smart Flashcards</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Spaced repetition for long-term retention</p>
                </div>
              </div>

              {/* Listening Feature */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Listening Practice</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Train your ear with native pronunciation</p>
                </div>
              </div>

              {/* Speaking Feature */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <Mic className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Speaking Practice</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Practice pronunciation with feedback</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto px-6 text-center text-sm text-gray-400">
          Built for Chinese-Indonesian learners
        </div>
      </footer>
    </div>
  );
}

// App content for PWA users
function AppContent() {
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
  const [stats, setStats] = useState({ total: 0, reviewed: 0, categories: 0 });
  const [isClient, setIsClient] = useState(false);

  // Engagement features state
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [dailyChallenge, setDailyChallenge] = useState<DailyChallenge | null>(null);
  const [activityHistory, setActivityHistory] = useState<DailyActivity[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [previousChallengeCompleted, setPreviousChallengeCompleted] = useState(false);

  const localStorage = useMemo(() => {
    if (!isClient) return null;
    return new UnifiedLocalStorage(`${config.code}-flashcards`);
  }, [config.code, isClient]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !localStorage) return;

    const loadedCategories = localStorage.getCategories();
    setCategories(loadedCategories);

    const allCards = localStorage.getFlashcards();
    const reviewedCards = allCards.filter(card => card.reviewHistory && card.reviewHistory.length > 0).length;
    setStats({
      total: allCards.length,
      reviewed: reviewedCards,
      categories: loadedCategories.length
    });

    const streak = localStorage.getStreakData();
    setStreakData(streak);

    const today = new Date().toISOString().split('T')[0];
    let challenge = localStorage.getDailyChallenge();
    if (!challenge || challenge.date !== today) {
      challenge = generateDailyChallenge(today, allCards.length);
      localStorage.saveDailyChallenge(challenge);
    }
    setDailyChallenge(challenge);
    setPreviousChallengeCompleted(challenge.completed);

    const activities = localStorage.getActivityHistory(90);
    setActivityHistory(activities);

    const notifSettings = localStorage.getNotificationSettings();
    const permission = getNotificationPermission();
    if (isPwa && permission === 'default' && !notifSettings.lastPromptDate) {
      setTimeout(() => setShowNotificationPrompt(true), 2000);
    }

    if (permission === 'granted') {
      const dueCount = localStorage.getDueCardsCount();
      notifyDueCards(dueCount, streak.currentStreak);
    }
  }, [isClient, localStorage, isPwa]);

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
      const indonesianRegex = /^[a-zA-Z\s\-\'\.]+$/;
      return indonesianRegex.test(text.trim());
    }

    return true;
  }, [currentLanguage]);

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
        if (result.trans_result && result.trans_result[0]) {
          translationData.translation = result.trans_result[0].dst;

          let pinyinFromBaidu = result.trans_result[0].src_tts;
          const hasChinese = pinyinFromBaidu && isChinese(pinyinFromBaidu);

          if (pinyinFromBaidu && !hasChinese) {
            translationData.romanization = pinyinFromBaidu;
          } else {
            translationData.romanization = await service.getRomanization!(word);
          }
        }
      } else if (currentLanguage === 'indonesian') {
        translationData.translation = result.translation;
      }

      setTranslation(translationData);
    } catch {
      setError("Failed to translate. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!translation || !localStorage) return;

    const today = new Date().toISOString().split('T')[0];
    const newCard: Flashcard = {
      id: uuidv4(),
      word: translation.original,
      pronunciation: translation.romanization,
      translation: translation.translation,
      createdAt: new Date(),
      updatedAt: new Date(),
      difficulty: 1,
      categoryId: selectedCategory,
      reviewHistory: [],

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

  useEffect(() => {
    if (dailyChallenge?.completed && !previousChallengeCompleted) {
      setShowChallengeModal(true);
      setPreviousChallengeCompleted(true);
    }
  }, [dailyChallenge?.completed, previousChallengeCompleted]);

  const handleNotificationPermissionGranted = () => {
    if (!localStorage) return;
    localStorage.saveNotificationSettings({
      enabled: true,
      permissionGranted: true,
      lastPromptDate: new Date().toISOString()
    });
    setShowNotificationPrompt(false);
  };

  const handleNotificationDismiss = () => {
    if (!localStorage) return;
    localStorage.saveNotificationSettings({
      enabled: false,
      permissionGranted: false,
      lastPromptDate: new Date().toISOString()
    });
    setShowNotificationPrompt(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white dark:bg-gray-900 min-h-screen">
      <div className="space-y-6">
        {streakData && (
          <StreakWarningBanner streakData={streakData} />
        )}

        {showNotificationPrompt && (
          <NotificationPermissionPrompt
            onPermissionGranted={handleNotificationPermissionGranted}
            onDismiss={handleNotificationDismiss}
            primaryColor={config.theme.primary}
          />
        )}

        {/* Create Form Section */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
            <PlusCircle className="w-6 h-6 mr-3" style={{ color: config.theme.primary }} />
            Create Flashcard
          </h1>

          <div className="mb-6">
            <label htmlFor="word" className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
              {currentLanguage === 'chinese' ? "Enter Chinese Word or Phrase" : "Enter Indonesian Word or Phrase"}
            </label>
            <div className="relative">
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                className={`w-full p-3 border rounded-lg bg-white dark:bg-gray-700 ${!isValidInput ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} text-gray-900 dark:text-white focus:ring-2 focus:ring-opacity-50 transition-colors`}
                placeholder={currentLanguage === 'chinese' ? "输入中文" : "Masukkan kata Indonesia"}
              />
              {!isValidInput && (
                <p className="text-red-500 text-xs mt-1">
                  Please enter {config.name} characters only
                </p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={handleTranslate}
              disabled={isLoading || !isValidInput || !word.trim()}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                isLoading || !isValidInput || !word.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'text-white hover:opacity-90 transform hover:scale-[1.02]'
              }`}
              style={{
                backgroundColor: (isLoading || !isValidInput || !word.trim())
                  ? undefined
                  : config.theme.primary
              }}
            >
              {isLoading ? config.ui.messages.loading : 'Translate'}
            </button>
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
            </div>
          )}
        </div>

        {/* Language Switcher */}
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

        {/* Drive Mode */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900 dark:to-teal-900 p-6 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center mb-4">
            <Car className="w-8 h-8 mr-3" style={{ color: config.theme.primary }} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentLanguage === 'chinese' ? '驾驶模式' : 'Drive Mode'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {currentLanguage === 'chinese'
                  ? '开车时也能学习，完全免提'
                  : 'Learn while driving, completely hands-free'}
              </p>
            </div>
          </div>

          <Link href="/drive" className="block">
            <button className="w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center text-white"
              style={{ backgroundColor: config.theme.primary }}>
              <Car className="w-6 h-6 mr-3" />
              {currentLanguage === 'chinese' ? '开始驾驶模式' : 'Start Drive Mode'}
            </button>
          </Link>
        </div>

        {/* Streak and Daily Challenge */}
        {streakData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StreakDisplay streakData={streakData} primaryColor={config.theme.primary} />
            {dailyChallenge && (
              <DailyChallengeCard
                challenge={dailyChallenge}
                primaryColor={config.theme.primary}
              />
            )}
          </div>
        )}

        {/* Activity Heat Map */}
        <ActivityHeatMap
          activities={activityHistory}
          primaryColor={config.theme.primary}
        />
      </div>

      <ChallengeCompletionModal
        isOpen={showChallengeModal}
        onClose={() => setShowChallengeModal(false)}
        primaryColor={config.theme.primary}
      />
    </div>
  );
}

export default function HomePage() {
  const { isPwa } = usePwa();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show nothing during SSR to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // Show landing page for web visitors, app content for PWA users
  return isPwa ? <AppContent /> : <LandingPage />;
}
