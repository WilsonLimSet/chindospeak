import { NextRequest, NextResponse } from 'next/server';
import { GoogleTranslationService } from '@/shared/utils/googleTranslationService';
import { chineseConfig } from '@/language-configs/chinese.config';
import { indonesianConfig } from '@/language-configs/indonesian.config';
import { createHash } from 'crypto';

const MAX_TEXT_LENGTH = 500;

interface InternalTranslationRequest {
  text: string;
  type: string;
  sourceLanguage: string;
  targetLanguage: string;
}

function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

export async function POST(request: NextRequest) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  try {
    const body = await request.json();
    const { text, type = 'translation', language = 'chinese' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer` }, { status: 413 });
    }

    const config = language === 'indonesian' ? indonesianConfig : chineseConfig;

    let sourceLanguage: string;
    let targetLanguage: string;

    if (language === 'chinese') {
      sourceLanguage = 'zh';
      targetLanguage = type === 'pronunciation' ? 'zh' : 'en';
    } else {
      sourceLanguage = 'id';
      targetLanguage = 'en';
    }

    const translationRequest: InternalTranslationRequest = {
      text,
      type,
      sourceLanguage,
      targetLanguage,
    };

    if (config.translationService.type === 'baidu') {
      return await handleBaiduTranslation(translationRequest);
    }
    if (config.translationService.type === 'google') {
      return await handleGoogleTranslation(translationRequest);
    }

    return handleMockResponse(translationRequest);
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

async function handleBaiduTranslation(request: InternalTranslationRequest) {
  const BAIDU_APP_ID = process.env.BAIDU_APP_ID;
  const BAIDU_API_KEY = process.env.BAIDU_API_KEY;

  if (!BAIDU_APP_ID || !BAIDU_API_KEY) {
    return handleMockResponse(request);
  }

  const salt = Date.now().toString();
  const sign = md5(BAIDU_APP_ID + request.text + salt + BAIDU_API_KEY);

  const apiUrl = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(request.text)}&from=${request.sourceLanguage}&to=${request.targetLanguage}&appid=${BAIDU_APP_ID}&salt=${salt}&sign=${sign}`;

  try {
    const response = await fetch(apiUrl, { method: 'GET' });

    if (!response.ok) {
      return handleMockResponse(request);
    }

    const data = await response.json();

    if (data.error_code) {
      return handleMockResponse(request);
    }

    if (data.trans_result) {
      for (const result of data.trans_result) {
        if (!result.src_tts) {
          result.src_tts = request.text;
        }
      }
    }

    return NextResponse.json(data);
  } catch {
    return handleMockResponse(request);
  }
}

async function handleGoogleTranslation(request: InternalTranslationRequest) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
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

    return NextResponse.json({
      translation: result.translation,
      originalText: result.originalText,
      from: result.sourceLanguage,
      to: result.targetLanguage,
      trans_result: [{
        src: result.originalText,
        dst: result.translation,
      }],
    });
  } catch (error) {
    console.error('Google translation error:', error);
    return handleMockResponse(request);
  }
}

function handleMockResponse(request: InternalTranslationRequest) {
  const mockTranslations: Record<string, string> = {
    '你好': 'hello',
    '谢谢': 'thank you',
    '再见': 'goodbye',
    'halo': 'hello',
    'terima kasih': 'thank you',
    'selamat pagi': 'good morning',
    'bagaimana kabar': 'how are you',
  };

  const translation = mockTranslations[request.text] || `Translation of "${request.text}"`;

  if (request.sourceLanguage === 'zh') {
    return NextResponse.json({
      from: 'zh',
      to: 'en',
      trans_result: [{
        src: request.text,
        dst: translation,
        src_tts: request.text,
      }],
    });
  }

  return NextResponse.json({
    translation,
    originalText: request.text,
    from: request.sourceLanguage,
    to: request.targetLanguage,
    trans_result: [{
      src: request.text,
      dst: translation,
    }],
  });
}
