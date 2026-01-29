import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

// Voice mapping for different languages
const VOICE_MAP: Record<string, string> = {
  'zh-CN': 'zh-CN-XiaoxiaoNeural',    // Natural female Chinese voice
  'zh': 'zh-CN-XiaoxiaoNeural',
  'id-ID': 'id-ID-GadisNeural',        // Natural female Indonesian voice
  'id': 'id-ID-GadisNeural',
  'en-US': 'en-US-JennyNeural',        // Natural female English voice
  'en': 'en-US-JennyNeural',
};

// Alternative voices (male)
const VOICE_MAP_MALE: Record<string, string> = {
  'zh-CN': 'zh-CN-YunxiNeural',
  'zh': 'zh-CN-YunxiNeural',
  'id-ID': 'id-ID-ArdiNeural',
  'id': 'id-ID-ArdiNeural',
  'en-US': 'en-US-GuyNeural',
  'en': 'en-US-GuyNeural',
};

function detectLanguage(text: string): string {
  // Check for Chinese characters
  if (/[\u4e00-\u9fff]/.test(text)) {
    return 'zh-CN';
  }
  // Default to English for Latin script
  // Indonesian and English both use Latin, so we default to the requested lang
  return 'en-US';
}

export async function POST(request: NextRequest) {
  try {
    const { text, lang, gender = 'female', rate = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    // Determine language and voice
    const detectedLang = lang || detectLanguage(text);
    const voiceMap = gender === 'male' ? VOICE_MAP_MALE : VOICE_MAP;
    const voice = voiceMap[detectedLang] || voiceMap['en-US'];

    // Create TTS instance
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    // Generate audio
    const { audioStream } = tts.toStream(text);

    // Collect chunks into buffer
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available voices (for debugging)
export async function GET() {
  return NextResponse.json({
    voices: {
      chinese: { female: 'zh-CN-XiaoxiaoNeural', male: 'zh-CN-YunxiNeural' },
      indonesian: { female: 'id-ID-GadisNeural', male: 'id-ID-ArdiNeural' },
      english: { female: 'en-US-JennyNeural', male: 'en-US-GuyNeural' },
    },
  });
}
