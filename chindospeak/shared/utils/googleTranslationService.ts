/**
 * Google Cloud Translation API Service
 * Uses API key authentication for simplicity
 */
export class GoogleTranslationService {
  private apiKey: string;
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Translate text from Indonesian to English
   */
  async translateText(text: string): Promise<{
    translation: string;
    originalText: string;
    sourceLanguage: string;
    targetLanguage: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'id', // Indonesian
          target: 'en', // English
          format: 'text'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Translation API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Google Translation API error: ${data.error.message}`);
      }

      const translation = data.data?.translations?.[0]?.translatedText;
      const detectedSourceLanguage = data.data?.translations?.[0]?.detectedSourceLanguage;

      if (!translation) {
        throw new Error('No translation returned from Google API');
      }

      return {
        translation,
        originalText: text,
        sourceLanguage: detectedSourceLanguage || 'id',
        targetLanguage: 'en'
      };
    } catch (error) {
      console.error('Google Translation API error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Translate text from English to Indonesian
   */
  async translateToIndonesian(text: string): Promise<{
    translation: string;
    originalText: string;
    sourceLanguage: string;
    targetLanguage: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en', // English
          target: 'id', // Indonesian
          format: 'text'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Translation API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Google Translation API error: ${data.error.message}`);
      }

      const translation = data.data?.translations?.[0]?.translatedText;

      if (!translation) {
        throw new Error('No translation returned from Google API');
      }

      return {
        translation,
        originalText: text,
        sourceLanguage: 'en',
        targetLanguage: 'id'
      };
    } catch (error) {
      console.error('Google Translation API error:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect language of the given text
   */
  async detectLanguage(text: string): Promise<{
    language: string;
    confidence: number;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/detect?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Detection API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Google Detection API error: ${data.error.message}`);
      }

      const detection = data.data?.detections?.[0]?.[0];
      
      return {
        language: detection?.language || 'unknown',
        confidence: detection?.confidence || 0
      };
    } catch (error) {
      console.error('Language detection error:', error);
      throw new Error(`Language detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get supported languages
   */
  async getSupportedLanguages(): Promise<Array<{
    code: string;
    name: string;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/languages?key=${this.apiKey}&target=en`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Languages API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Google Languages API error: ${data.error.message}`);
      }

      return data.data?.languages?.map((lang: any) => ({
        code: lang.language,
        name: lang.name
      })) || [];
    } catch (error) {
      console.error('Get languages error:', error);
      throw new Error(`Failed to get supported languages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}