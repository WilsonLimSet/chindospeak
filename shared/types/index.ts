// Shared type definitions for the unified language learning platform

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
  categoryId?: string;           // Reference to Category id
  difficulty?: number;           // Legacy difficulty, deprecated
  createdAt: Date;
  updatedAt: Date;
  reviewHistory: ReviewSession[];
  
  // Separate skill level tracking (0-5 scale)
  readingReviewLevel: number;
  readingNextReviewDate: string;
  readingDifficulty: number;     // 1-5 difficulty for reading
  
  listeningReviewLevel: number;
  listeningNextReviewDate: string;
  listeningDifficulty: number;   // 1-5 difficulty for listening
  
  speakingReviewLevel: number;
  speakingNextReviewDate: string;
  speakingDifficulty: number;    // 1-5 difficulty for speaking
  
  // Legacy support
  category?: string;             // Deprecated, use categoryId
}

export interface Category {
  id: string;
  name: string;
  color: string;                 // Hex color for visual distinction
  createdAt: Date;
}

export interface ReviewSession {
  id: string;
  flashcardId: string;
  reviewedAt: Date;
  wasCorrect: boolean;
  timeTaken: number;
  difficulty: number;
}

export interface TranslationRequest {
  text: string;
  type: 'translation' | 'example' | 'pronunciation';
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationResponse {
  from: string;
  to: string;
  trans_result?: Array<{
    src: string;
    dst: string;
    src_tts?: string;
  }>;
  error_code?: string | number;
  error_msg?: string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  voiceOptions: VoiceConfig[];
  translationService: TranslationServiceConfig;
  pronunciationService?: PronunciationServiceConfig;
}

export interface VoiceConfig {
  name: string;
  lang: string;
  priority: number;
  gender?: 'male' | 'female';
  region?: string;
}

export interface TranslationServiceConfig {
  type: 'baidu' | 'google';
  apiUrl: string;
  requiresAuth: boolean;
  mockFallback: boolean;
}

export interface PronunciationServiceConfig {
  type: 'pinyin' | 'romanization' | 'phonetic';
  library?: string;
  apiEndpoint?: string;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  deferredPrompt: any | null;
  showInstallPrompt: boolean;
}

export interface AudioState {
  isPlaying: boolean;
  currentText: string | null;
  error: string | null;
}

export type ReviewMode = 'listen' | 'speak' | 'review' | 'create' | 'manage' | 'converse';

export interface ConversationSession {
  id: string;
  language: 'chinese' | 'indonesian';
  scenario: string; // 'restaurant', 'directions', 'shopping', 'general'
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  userVocab: Flashcard[]; // Known words from flashcards
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  pronunciation?: string;
  translation?: string;
  newWords?: string[]; // Words to add to flashcards
  timestamp: Date;
}

export interface ConversationScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  systemPrompt: string;
  icon: string;
}

export interface AppConfig {
  language: LanguageConfig;
  theme: 'light' | 'dark' | 'system';
  reviewSettings: {
    dailyGoal: number;
    enableReminders: boolean;
    spacedRepetition: boolean;
  };
}