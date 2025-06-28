import { LanguageConfig } from '@/shared/types';

export interface BaseLanguageConfig extends LanguageConfig {
  // Language-specific UI text
  ui: {
    appName: string;
    navigation: {
      listen: string;
      speak: string;
      review: string;
      create: string;
      manage: string;
    };
    buttons: {
      play: string;
      stop: string;
      correct: string;
      incorrect: string;
      next: string;
      previous: string;
      save: string;
      cancel: string;
      delete: string;
      edit: string;
    };
    messages: {
      loading: string;
      error: string;
      success: string;
      noFlashcards: string;
      installPrompt: string;
    };
  };
  
  // Theme colors specific to this language
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Language-specific features
  features: {
    hasRomanization: boolean;
    hasToneMarkers: boolean;
    hasGender: boolean;
    writingDirection: 'ltr' | 'rtl';
    complexScript: boolean;
  };
}

export abstract class BaseLanguageService {
  abstract translateText(text: string, type: string): Promise<any>;
  abstract getRomanization?(text: string): Promise<string>;
  abstract validateInput(text: string): boolean;
  abstract getExampleSentence(word: string): Promise<string>;
}