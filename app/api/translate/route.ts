import { NextRequest, NextResponse } from 'next/server';
import { UnifiedTranslationService } from '@/shared/utils/translationService';
import { GoogleTranslationService } from '@/shared/utils/googleTranslationService';
import { chineseConfig } from '@/language-configs/chinese.config';
import { indonesianConfig } from '@/language-configs/indonesian.config';
import { createHash } from 'crypto';

// Helper function to create MD5 hash
function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type = 'translation', language = 'chinese' } = body;
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Determine language configuration
    const config = language === 'indonesian' ? indonesianConfig : chineseConfig;
    const translationService = new UnifiedTranslationService(config.translationService);
    
    // Determine source and target languages
    let sourceLanguage: string;
    let targetLanguage: string;
    
    if (language === 'chinese') {
      sourceLanguage = 'zh';
      targetLanguage = type === 'pronunciation' ? 'zh' : 'en';
    } else {
      sourceLanguage = 'id';
      targetLanguage = 'en';
    }
    
    // Create translation request
    const translationRequest = {
      text,
      type,
      sourceLanguage,
      targetLanguage
    };
    
    // Handle different service types
    if (config.translationService.type === 'baidu') {
      return await handleBaiduTranslation(translationRequest);
    } else if (config.translationService.type === 'google') {
      return await handleGoogleTranslation(translationRequest);
    }
    
    // Use unified service for other types
    const result = await translationService.translate(translationRequest);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}

async function handleBaiduTranslation(request: any) {
  const BAIDU_APP_ID = process.env.NEXT_PUBLIC_BAIDU_APP_ID;
  const BAIDU_API_KEY = process.env.NEXT_PUBLIC_BAIDU_API_KEY;
  
  if (!BAIDU_APP_ID || !BAIDU_API_KEY) {
    console.error('Baidu API credentials not configured');
    return handleMockResponse(request);
  }
  
  const salt = Date.now().toString();
  const sign = md5(BAIDU_APP_ID + request.text + salt + BAIDU_API_KEY);
  
  const apiUrl = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(request.text)}&from=${request.sourceLanguage}&to=${request.targetLanguage}&appid=${BAIDU_APP_ID}&salt=${salt}&sign=${sign}`;
  
  try {
    const response = await fetch(apiUrl, { method: 'GET' });
    
    if (!response.ok) {
      console.error('Baidu API error response:', response.status);
      return handleMockResponse(request);
    }
    
    const data = await response.json();
    
    if (data.error_code) {
      console.error(`Baidu API error: ${data.error_code} - ${data.error_msg}`);
      return handleMockResponse(request);
    }
    
    // Add pinyin if not present
    if (data.trans_result) {
      for (const result of data.trans_result) {
        if (!result.src_tts) {
          // Import pinyin conversion here if needed
          result.src_tts = request.text; // Fallback
        }
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Baidu translation error:', error);
    return handleMockResponse(request);
  }
}


async function handleGoogleTranslation(request: any) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    
    if (!apiKey) {
      console.error('Google Cloud API key not configured');
      return handleMockResponse(request);
    }
    
    const googleService = new GoogleTranslationService(apiKey);
    
    let result;
    if (request.sourceLanguage === 'id' && request.targetLanguage === 'en') {
      result = await googleService.translateText(request.text);
    } else if (request.sourceLanguage === 'en' && request.targetLanguage === 'id') {
      result = await googleService.translateToIndonesian(request.text);
    } else {
      throw new Error(`Unsupported language pair: ${request.sourceLanguage} -> ${request.targetLanguage}`);
    }
    
    // Return in the format expected by the frontend
    return NextResponse.json({
      translation: result.translation,
      originalText: result.originalText,
      from: result.sourceLanguage,
      to: result.targetLanguage,
      // Also include the nested structure for compatibility
      trans_result: [{
        src: result.originalText,
        dst: result.translation
      }]
    });
    
  } catch (error) {
    console.error('Google translation error:', error);
    return handleMockResponse(request);
  }
}

function handleMockResponse(request: any) {
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
  
  if (request.sourceLanguage === 'zh') {
    // Baidu format for Chinese
    return NextResponse.json({
      from: 'zh',
      to: 'en',
      trans_result: [{
        src: request.text,
        dst: translation,
        src_tts: request.text // Mock pinyin
      }]
    });
  } else {
    // Google format for Indonesian
    return NextResponse.json({
      translation: translation,
      originalText: request.text,
      from: request.sourceLanguage,
      to: request.targetLanguage,
      // Also include the nested structure for compatibility
      trans_result: [{
        src: request.text,
        dst: translation
      }]
    });
  }
}