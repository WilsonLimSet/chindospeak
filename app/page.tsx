"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { UnifiedLocalStorage } from "@/shared/utils/localStorage";
import { useLanguage } from "@/shared/contexts/LanguageContext";
import { usePwa } from "@/shared/contexts/PwaContext";
import PwaWrapper from "@/shared/components/PwaWrapper";
import { Flashcard, Category, StreakData, DailyChallenge, DailyActivity } from "@/shared/types";
import isChinese from 'is-chinese';
import { PlusCircle, Car, Headphones, Mic, BookOpen, Smartphone, Volume2, Zap } from 'lucide-react';
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
  const { config, availableLanguages } = useLanguage();
  const { showInstallPrompt } = usePwa();

  const features = [
    {
      icon: <Car className="w-8 h-8" />,
      title: "Drive Mode",
      description: "Learn hands-free while commuting. Audio quiz loop with voice recognition."
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Listening Practice",
      description: "Train your ear with audio flashcards and spaced repetition."
    },
    {
      icon: <Mic className="w-8 h-8" />,
      title: "Speaking Practice",
      description: "Practice pronunciation with instant feedback."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Smart Flashcards",
      description: "Create and review flashcards with spaced repetition for optimal retention."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Daily Challenges",
      description: "Stay motivated with streaks, challenges, and progress tracking."
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Works Offline",
      description: "Install as an app and learn anywhere, even without internet."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Learn Chinese & Indonesian
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            The language app that works while you drive
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Hands-free audio quizzes • Spaced repetition • Offline support
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={showInstallPrompt}
              className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center text-white"
              style={{ backgroundColor: config.theme.primary }}
            >
              <Smartphone className="w-5 h-5 mr-2" />
              Install App
            </button>
            <Link href="/drive">
              <button className="px-8 py-4 rounded-xl font-bold text-lg border-2 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-gray-900 dark:text-white"
                style={{ borderColor: config.theme.primary }}>
                <Car className="w-5 h-5 mr-2" />
                Try Drive Mode
              </button>
            </Link>
          </div>
        </div>

        {/* Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {availableLanguages.map(({ key, config: langConfig }) => (
            <div
              key={key}
              className="p-6 rounded-2xl border-2 bg-white dark:bg-gray-800 shadow-md"
              style={{ borderColor: langConfig.theme.primary + '40' }}
            >
              <div className="flex items-center mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold mr-4"
                  style={{ backgroundColor: langConfig.theme.primary }}
                >
                  {langConfig.nativeName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {langConfig.name}
                  </h3>
                  <p className="text-2xl font-bold" style={{ color: langConfig.theme.primary }}>
                    {langConfig.nativeName}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {key === 'chinese'
                  ? 'Mandarin Chinese with pinyin romanization and native audio'
                  : 'Bahasa Indonesia with pronunciation guides'}
              </p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white"
                  style={{ backgroundColor: config.theme.primary }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Drive Mode Highlight */}
        <div
          className="p-8 rounded-2xl mb-16"
          style={{
            background: `linear-gradient(135deg, ${config.theme.primary}15 0%, ${config.theme.secondary}15 100%)`,
            border: `2px solid ${config.theme.primary}30`
          }}
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-white"
                style={{ backgroundColor: config.theme.primary }}
              >
                <Car className="w-12 h-12" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Learn While You Drive
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Turn your commute into study time. ChindoSpeak's Drive Mode runs a continuous audio quiz loop -
                it speaks a prompt, listens for your answer, and gives instant feedback. No screen needed.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                  <Volume2 className="w-4 h-4 inline mr-1" /> Voice prompts
                </span>
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                  <Mic className="w-4 h-4 inline mr-1" /> Speech recognition
                </span>
                <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 shadow">
                  <Zap className="w-4 h-4 inline mr-1" /> Instant feedback
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Install CTA */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Free to use. No account required.
          </p>
          <button
            onClick={showInstallPrompt}
            className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-white"
            style={{ backgroundColor: config.theme.primary }}
          >
            Get Started - Install App
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>ChindoSpeak • Built for Chinese-Indonesian learners</p>
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
