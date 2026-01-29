import { VoiceConfig } from '@/shared/types';

export class UnifiedAudioService {
  private voiceOptions: VoiceConfig[];
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor(voiceOptions: VoiceConfig[]) {
    this.voiceOptions = voiceOptions;
  }

  /**
   * Checks if text-to-speech is supported in the current browser
   */
  isSpeechSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Gets available voices for speech synthesis
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSupported()) return [];
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      // If no voices are available yet, try to force loading them
      window.speechSynthesis.cancel();
      return window.speechSynthesis.getVoices();
    }
    
    return voices;
  }

  /**
   * Gets voices that match the current language configuration
   */
  getLanguageVoices(): SpeechSynthesisVoice[] {
    if (!this.isSpeechSupported()) return [];
    
    const allVoices = this.getAvailableVoices();
    const supportedLangs = this.voiceOptions.map(v => v.lang);
    
    return allVoices.filter(voice => 
      supportedLangs.some(lang => voice.lang.includes(lang.split('-')[0]))
    );
  }

  /**
   * Gets the best available voice based on the priority list
   * Prefers enhanced/premium voices (Siri, Enhanced) over basic ones
   */
  getBestVoice(): SpeechSynthesisVoice | null {
    const languageVoices = this.getLanguageVoices();
    if (languageVoices.length === 0) return null;

    // Score voices - higher is better
    const scoreVoice = (voice: SpeechSynthesisVoice): number => {
      let score = 0;
      const name = voice.name.toLowerCase();

      // Premium/Enhanced voices (iOS downloads these from Settings)
      if (name.includes('premium')) score += 100;
      if (name.includes('enhanced')) score += 90;
      if (name.includes('siri')) score += 80;

      // Prefer local voices over network (more reliable)
      if (voice.localService) score += 20;

      // Specific high-quality voices
      if (name.includes('samantha')) score += 50; // Good English voice
      if (name.includes('tingting') || name.includes('tian-tian')) score += 50; // Good Chinese voices
      if (name.includes('meijia')) score += 50; // Good Chinese voice
      if (name.includes('damayanti')) score += 50; // Indonesian voice

      // Avoid compact/basic voices
      if (name.includes('compact')) score -= 50;

      return score;
    };

    // Sort by score (highest first)
    const sortedVoices = [...languageVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));

    // Also check configured voice options
    const sortedVoiceOptions = [...this.voiceOptions].sort((a, b) => b.priority - a.priority);

    // Try to find a configured voice first (if it's high quality)
    for (const voiceOption of sortedVoiceOptions) {
      const voice = sortedVoices.find(v =>
        v.name === voiceOption.name ||
        v.voiceURI === voiceOption.name ||
        v.name.toLowerCase().includes(voiceOption.name.toLowerCase())
      );
      if (voice && scoreVoice(voice) >= 50) return voice;
    }

    // Otherwise return the highest scored voice
    return sortedVoices[0];
  }

  /**
   * Speaks the provided text using the Web Speech API
   */
  async speak(text: string, rate: number = 0.9, pitch: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isSpeechSupported()) {
        reject(new Error('Text-to-speech not supported in this browser'));
        return;
      }

      // Cancel any ongoing speech
      this.cancelSpeech();

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      
      // Try to use the best available voice
      const bestVoice = this.getBestVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      } else {
        // Fallback to language setting
        utterance.lang = this.voiceOptions[0]?.lang || 'en-US';
      }
      
      // Set rate and pitch
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Handle events
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        this.currentUtterance = null;
        reject(new Error('Speech synthesis failed'));
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    });
  }

  /**
   * Cancels any ongoing speech
   */
  cancelSpeech(): void {
    if (this.isSpeechSupported()) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Checks if speech is currently playing
   */
  isSpeaking(): boolean {
    return this.isSpeechSupported() && window.speechSynthesis.speaking;
  }

  /**
   * Pauses ongoing speech
   */
  pauseSpeech(): void {
    if (this.isSpeechSupported() && this.isSpeaking()) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * Resumes paused speech
   */
  resumeSpeech(): void {
    if (this.isSpeechSupported() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * Gets information about available voices for debugging
   */
  getVoiceInfo(): { available: number; configured: number; best: string | null } {
    const available = this.getAvailableVoices().length;
    const configured = this.getLanguageVoices().length;
    const best = this.getBestVoice()?.name || null;
    
    return { available, configured, best };
  }
}