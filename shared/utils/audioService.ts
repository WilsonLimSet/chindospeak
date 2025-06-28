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
   */
  getBestVoice(): SpeechSynthesisVoice | null {
    const languageVoices = this.getLanguageVoices();
    if (languageVoices.length === 0) return null;
    
    // Sort voice options by priority (higher is better)
    const sortedVoiceOptions = [...this.voiceOptions].sort((a, b) => b.priority - a.priority);
    
    // Try to find a voice from our preferred list
    for (const voiceOption of sortedVoiceOptions) {
      const voice = languageVoices.find(v => 
        v.name === voiceOption.name || 
        v.voiceURI === voiceOption.name ||
        v.name.toLowerCase().includes(voiceOption.name.toLowerCase())
      );
      if (voice) return voice;
    }
    
    // If no preferred voice is found, return the first available voice
    return languageVoices[0];
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

      utterance.onerror = (event) => {
        this.currentUtterance = null;
        console.error('Speech synthesis error:', event);
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