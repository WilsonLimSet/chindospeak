import { NextRequest, NextResponse } from 'next/server';
import { GoogleTranslationService } from '@/shared/utils/googleTranslationService';
import { toPinyin } from '@/shared/utils/pinyin';
import { createHash } from 'crypto';

const MAX_TEXT_LENGTH = 500;

// Chinese goes through Baidu, Indonesian through Google. Both fall back to a mock
// response when their API key is absent.
const TRANSLATION_PROVIDER = {
  chinese: 'baidu',
  indonesian: 'google',
} as const;

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

    const provider =
      language === 'indonesian'
        ? TRANSLATION_PROVIDER.indonesian
        : TRANSLATION_PROVIDER.chinese;

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

    if (provider === 'baidu') {
      return await handleBaiduTranslation(translationRequest);
    }

    return await handleGoogleTranslation(translationRequest);
  } catch (error) {
    console.error('Translation API error:', error);
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
  }
}

// Baidu's free tier allows roughly one request per second and rejects bursts with
// error_code 54003. That is transient, so it is worth one retry.
const BAIDU_RATE_LIMIT_CODE = '54003';
const BAIDU_RETRY_DELAY_MS = 1100;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callBaidu(request: InternalTranslationRequest, appId: string, apiKey: string) {
  const salt = Date.now().toString();
  const sign = md5(appId + request.text + salt + apiKey);

  const apiUrl = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(request.text)}&from=${request.sourceLanguage}&to=${request.targetLanguage}&appid=${appId}&salt=${salt}&sign=${sign}`;

  const response = await fetch(apiUrl, { method: 'GET' });

  if (!response.ok) {
    throw new TranslationError(`Baidu returned HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.error_code) {
    throw new TranslationError(
      `Baidu error ${data.error_code}: ${data.error_msg ?? 'unknown'}`,
      String(data.error_code) === BAIDU_RATE_LIMIT_CODE
    );
  }

  if (!data.trans_result?.length) {
    throw new TranslationError('Baidu returned no translation');
  }

  // Baidu has no pinyin field — src_tts is a TTS handle, and it comes back equal to
  // the source text. Fill it with the real reading so a Chinese translation carries
  // its pinyin in one round-trip. The iOS app already reads src_tts and only falls
  // back to /api/pinyin when it equals the source, so this needs no client change.
  if (request.sourceLanguage === 'zh') {
    for (const result of data.trans_result) {
      result.src_tts = toPinyin(result.src ?? request.text);
    }
  }

  return data;
}

async function handleBaiduTranslation(request: InternalTranslationRequest) {
  const BAIDU_APP_ID = process.env.BAIDU_APP_ID;
  const BAIDU_API_KEY = process.env.BAIDU_API_KEY;

  // No key configured means local dev. Mock responses are acceptable there, but
  // never in production — a fabricated translation gets saved onto a real card.
  if (!BAIDU_APP_ID || !BAIDU_API_KEY) {
    return handleMockResponse(request);
  }

  try {
    let data;
    try {
      data = await callBaidu(request, BAIDU_APP_ID, BAIDU_API_KEY);
    } catch (error) {
      if (!(error instanceof TranslationError) || !error.retryable) {
        throw error;
      }
      await sleep(BAIDU_RETRY_DELAY_MS);
      data = await callBaidu(request, BAIDU_APP_ID, BAIDU_API_KEY);
    }

    return NextResponse.json(data);
  } catch (error) {
    return translationFailed('Baidu', error);
  }
}

async function handleGoogleTranslation(request: InternalTranslationRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  // Local dev only — see the note in handleBaiduTranslation.
  if (!apiKey) {
    return handleMockResponse(request);
  }

  try {
    const googleService = new GoogleTranslationService(apiKey);

    let result;
    if (request.sourceLanguage === 'id' && request.targetLanguage === 'en') {
      result = await googleService.translateText(request.text);
    } else if (request.sourceLanguage === 'en' && request.targetLanguage === 'id') {
      result = await googleService.translateToIndonesian(request.text);
    } else {
      throw new TranslationError(
        `Unsupported language pair: ${request.sourceLanguage} -> ${request.targetLanguage}`
      );
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
    return translationFailed('Google', error);
  }
}

class TranslationError extends Error {
  constructor(message: string, readonly retryable = false) {
    super(message);
    this.name = 'TranslationError';
  }
}

// A failed translation must surface as a failure. Returning a plausible-looking
// mock here would get written straight onto the user's flashcard.
function translationFailed(provider: string, error: unknown) {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`${provider} translation failed:`, detail);
  return NextResponse.json(
    { error: 'Translation is temporarily unavailable. Please try again.' },
    { status: 502 }
  );
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
