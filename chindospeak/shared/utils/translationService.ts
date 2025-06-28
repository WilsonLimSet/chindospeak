import { TranslationRequest, TranslationResponse, TranslationServiceConfig } from '@/shared/types';
import { createHash } from 'crypto';
import { GoogleTranslationService } from './googleTranslationService';

export class UnifiedTranslationService {
  private config: TranslationServiceConfig;
  private cache: Map<string, any> = new Map();
  private googleService?: GoogleTranslationService;

  constructor(config: TranslationServiceConfig) {
    this.config = config;
    
    // Initialize Google Cloud service if using Google translation
    if (config.type === 'google') {
      const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
      if (apiKey) {
        this.googleService = new GoogleTranslationService(apiKey);
      } else {
        console.warn('Google Cloud API key not found in environment variables');
      }
    }
  }

  private getCacheKey(request: TranslationRequest): string {
    return `${request.text}-${request.type}-${request.sourceLanguage}-${request.targetLanguage}`;
  }

  private getCachedTranslation(request: TranslationRequest): any | null {
    const key = this.getCacheKey(request);
    return this.cache.get(key) || null;
  }

  private setCachedTranslation(request: TranslationRequest, result: any): void {
    const key = this.getCacheKey(request);
    this.cache.set(key, result);
  }

  async translate(request: TranslationRequest): Promise<TranslationResponse> {
    // Check cache first
    const cachedResult = this.getCachedTranslation(request);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      let result: TranslationResponse;

      switch (this.config.type) {
        case 'baidu':
          result = await this.translateWithBaidu(request);
          break;
        case 'google':
          result = await this.translateWithGoogle(request);
          break;
        default:
          throw new Error(`Unsupported translation service: ${this.config.type}`);
      }

      // Cache the result
      this.setCachedTranslation(request, result);
      return result;

    } catch (error) {
      console.error('Translation error:', error);
      
      if (this.config.mockFallback) {
        return this.getMockTranslation(request);
      }
      
      throw error;
    }
  }

  private async translateWithBaidu(request: TranslationRequest): Promise<TranslationResponse> {
    const BAIDU_APP_ID = process.env.NEXT_PUBLIC_BAIDU_APP_ID;
    const BAIDU_API_KEY = process.env.NEXT_PUBLIC_BAIDU_API_KEY;

    if (!BAIDU_APP_ID || !BAIDU_API_KEY) {
      throw new Error('Baidu API credentials not configured');
    }

    const salt = Date.now().toString();
    const sign = this.md5(BAIDU_APP_ID + request.text + salt + BAIDU_API_KEY);
    
    const to = request.type === 'pronunciation' ? request.sourceLanguage : request.targetLanguage;
    
    const apiUrl = `${this.config.apiUrl}?q=${encodeURIComponent(request.text)}&from=${request.sourceLanguage}&to=${to}&appid=${BAIDU_APP_ID}&salt=${salt}&sign=${sign}`;
    
    const response = await fetch(apiUrl, { method: 'GET' });
    
    if (!response.ok) {
      throw new Error(`Baidu API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error_code) {
      throw new Error(`Baidu API error: ${data.error_code} - ${data.error_msg}`);
    }
    
    return data;
  }


  private async translateWithGoogle(request: TranslationRequest): Promise<TranslationResponse> {
    if (!this.googleService) {
      throw new Error('Google Translation service not initialized');
    }

    try {
      let result;
      
      // Determine translation direction based on source and target languages
      if (request.sourceLanguage === 'id' && request.targetLanguage === 'en') {
        // Indonesian to English
        result = await this.googleService.translateText(request.text);
      } else if (request.sourceLanguage === 'en' && request.targetLanguage === 'id') {
        // English to Indonesian
        result = await this.googleService.translateToIndonesian(request.text);
      } else {
        throw new Error(`Unsupported language pair: ${request.sourceLanguage} -> ${request.targetLanguage}`);
      }

      // Convert Google Cloud format to our standard format
      return {
        from: result.sourceLanguage,
        to: result.targetLanguage,
        trans_result: [{
          src: result.originalText,
          dst: result.translation,
          src_tts: undefined
        }]
      };
    } catch (error) {
      console.error('Google Translation error:', error);
      throw error;
    }
  }

  private getMockTranslation(request: TranslationRequest): TranslationResponse {
    const mockTranslations: Record<string, string> = {
      // Chinese examples
      '你好': 'hello',
      '谢谢': 'thank you',
      '再见': 'goodbye',
      // Indonesian examples
      'halo': 'hello',
      'terima kasih': 'thank you',
      'selamat pagi': 'good morning',
      'bagaimana kabar': 'how are you'
    };

    const translation = mockTranslations[request.text] || `Translation of "${request.text}"`;

    return {
      from: request.sourceLanguage,
      to: request.targetLanguage,
      trans_result: [{
        src: request.text,
        dst: translation,
        src_tts: undefined
      }]
    };
  }

  private md5(text: string): string {
    return createHash('md5').update(text).digest('hex');
  }
}