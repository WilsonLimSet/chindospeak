import { BaseLanguageConfig, BaseLanguageService } from './base.config';
import { VoiceConfig, TranslationServiceConfig } from '@/shared/types';

export const indonesianConfig: BaseLanguageConfig = {
  code: 'id-ID',
  name: 'Indonesian',
  nativeName: 'Bahasa Indonesia',
  rtl: false,
  
  voiceOptions: [
    {
      name: 'Google Indonesian Female',
      lang: 'id-ID',
      priority: 10,
      gender: 'female',
      region: 'Indonesia'
    },
    {
      name: 'Google Indonesian Male',
      lang: 'id-ID',
      priority: 9,
      gender: 'male',
      region: 'Indonesia'
    },
    {
      name: 'Microsoft Andika - Indonesian',
      lang: 'id-ID',
      priority: 8,
      gender: 'female',
      region: 'Indonesia'
    },
    {
      name: 'Microsoft Gadis - Indonesian',
      lang: 'id-ID',
      priority: 7,
      gender: 'female',
      region: 'Indonesia'
    }
  ] as VoiceConfig[],

  translationService: {
    type: 'google',
    apiUrl: 'https://translation.googleapis.com/language/translate/v2',
    requiresAuth: true,
    mockFallback: true
  } as TranslationServiceConfig,

  ui: {
    appName: 'ChindoSpeak',
    navigation: {
      listen: 'Dengar',
      speak: 'Bicara',
      review: 'Ulasan',
      create: 'Buat',
      manage: 'Kelola'
    },
    buttons: {
      play: 'Putar',
      stop: 'Berhenti',
      correct: 'Benar',
      incorrect: 'Salah',
      next: 'Selanjutnya',
      previous: 'Sebelumnya',
      save: 'Simpan',
      cancel: 'Batal',
      delete: 'Hapus',
      edit: 'Edit'
    },
    messages: {
      loading: 'Memuat...',
      error: 'Terjadi kesalahan',
      success: 'Berhasil',
      noFlashcards: 'Tidak ada kartu',
      installPrompt: 'Instal aplikasi untuk pengalaman terbaik'
    }
  },

  theme: {
    primary: '#3b82f6', // blue-500
    secondary: '#06b6d4', // cyan-500
    accent: '#10b981', // emerald-500
    background: '#ffffff',
    text: '#000000'
  },

  features: {
    hasRomanization: false,
    hasToneMarkers: false,
    hasGender: false,
    writingDirection: 'ltr',
    complexScript: false
  }
};

export class IndonesianLanguageService extends BaseLanguageService {
  async translateText(text: string, type: string = 'translation'): Promise<any> {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language: 'indonesian' })
    });
    return response.json();
  }

  validateInput(text: string): boolean {
    // Indonesian uses Latin script, so basic validation
    const indonesianRegex = /^[a-zA-Z\s\-\'\.]+$/;
    return indonesianRegex.test(text.trim());
  }

  async getExampleSentence(word: string): Promise<string> {
    // Since MyMemory doesn't provide examples, create a simple template
    return `Ini adalah contoh kalimat dengan kata "${word}".`;
  }

  async getRomanization(text: string): Promise<string> {
    // Indonesian already uses Latin script, so return the text as-is
    return text;
  }
}