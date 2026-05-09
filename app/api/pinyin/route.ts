import { NextRequest, NextResponse } from 'next/server';
import chineseToPinyin from 'chinese-to-pinyin';

const MAX_TEXT_LENGTH = 500;

export async function POST(request: NextRequest) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
  }

  try {
    const body = await request.json();
    const text = body.text;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json({ error: `Text must be ${MAX_TEXT_LENGTH} characters or fewer` }, { status: 413 });
    }

    const pinyinText = chineseToPinyin(text);

    return NextResponse.json({ pinyin: pinyinText });
  } catch (error) {
    console.error('Pinyin API route error:', error);
    return NextResponse.json({ error: 'Failed to convert to pinyin' }, { status: 500 });
  }
}