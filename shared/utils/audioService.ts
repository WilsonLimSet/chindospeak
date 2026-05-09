import { VoiceConfig } from '@/shared/types';

const MAX_AUDIO_CACHE_ENTRIES = 30;

export class UnifiedAudioService {
  private voiceOptions: VoiceConfig[];
  private currentAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, string> = new Map(); // Cache blob URLs

  constructor(voiceOptions: VoiceConfig[]) {
    this.voiceOptions = voiceOptions;
  }

  /**
   * Gets the primary language code from voice options
   */
  private getPrimaryLang(): string {
    return this.voiceOptions[0]?.lang || 'en-US';
  }

  /**
   * Generates a cache key for audio
   */
  private getCacheKey(text: string, lang: string): string {
    return `${lang}:${text}`;
  }

  /**
   * Speaks the provided text using Edge TTS API; falls back to browser TTS.
   */
  async speak(text: string, rate: number = 1.0, _pitch: number = 1): Promise<void> {
    this.cancelSpeech();

    const lang = this.getPrimaryLang();
    const cacheKey = this.getCacheKey(text, lang);

    let audioUrl: string | undefined;
    try {
      audioUrl = this.audioCache.get(cacheKey);

      if (!audioUrl) {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, lang, rate }),
        });

        if (!response.ok) {
          throw new Error('TTS API request failed');
        }

        const blob = await response.blob();
        audioUrl = URL.createObjectURL(blob);

        // Smaller cap to limit memory pressure on mobile.
        if (this.audioCache.size >= MAX_AUDIO_CACHE_ENTRIES) {
          const firstKey = this.audioCache.keys().next().value;
          if (firstKey) {
            const oldUrl = this.audioCache.get(firstKey);
            if (oldUrl) URL.revokeObjectURL(oldUrl);
            this.audioCache.delete(firstKey);
          }
        }
        this.audioCache.set(cacheKey, audioUrl);
      }
    } catch {
      return this.speakFallback(text, rate);
    }

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

    return new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        this.currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        this.currentAudio = null;
        this.speakFallback(text, rate).then(resolve).catch(reject);
      };
      audio.play().catch(() => {
        this.currentAudio = null;
        this.speakFallback(text, rate).then(resolve).catch(reject);
      });
    });
  }

  /**
   * Fallback to browser's speechSynthesis API
   */
  private async speakFallback(text: string, rate: number = 0.9): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSupported()) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getPrimaryLang();
      utterance.rate = rate;

      utterance.onend = () => resolve();
      utterance.onerror = () => reject(new Error('Speech synthesis failed'));

      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Checks if browser TTS is supported (for fallback)
   */
  isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Cancels any ongoing speech
   */
  cancelSpeech(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    // Also cancel browser TTS if running
    if (this.isSpeechSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Checks if audio is currently playing
   */
  isSpeaking(): boolean {
    if (this.currentAudio && !this.currentAudio.paused) {
      return true;
    }
    return this.isSpeechSupported() && window.speechSynthesis.speaking;
  }

  /**
   * Pauses ongoing audio
   */
  pauseSpeech(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    }
    if (this.isSpeechSupported()) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resumes paused audio
   */
  resumeSpeech(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play();
    }
    if (this.isSpeechSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Clears the audio cache
   */
  clearCache(): void {
    for (const url of this.audioCache.values()) {
      URL.revokeObjectURL(url);
    }
    this.audioCache.clear();
  }

  /**
   * Gets cache info for debugging
   */
  getCacheInfo(): { size: number } {
    return { size: this.audioCache.size };
  }

  // Legacy methods for compatibility
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSupported()) return [];
    return window.speechSynthesis.getVoices();
  }

  getLanguageVoices(): SpeechSynthesisVoice[] {
    return this.getAvailableVoices().filter(voice =>
      this.voiceOptions.some(v => voice.lang.includes(v.lang.split('-')[0]))
    );
  }

  getBestVoice(): SpeechSynthesisVoice | null {
    const voices = this.getLanguageVoices();
    return voices[0] || null;
  }

  getVoiceInfo(): { available: number; configured: number; best: string | null } {
    return {
      available: this.getAvailableVoices().length,
      configured: this.getLanguageVoices().length,
      best: 'Edge TTS (Neural)',
    };
  }
}
