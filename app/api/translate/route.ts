import { NextRequest, NextResponse } from 'next/server';

async function translateSingle(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  if (!text || !text.trim() || sourceLang === targetLang) {
    return text;
  }

  const res = await fetch('https://api.sarvam.ai/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': apiKey,
    },
    body: JSON.stringify({
      input: text.slice(0, 950),
      source_language_code: sourceLang,
      target_language_code: targetLang,
      model: 'mayura:v1',
      mode: 'formal',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn('Sarvam Mayura translate warning:', res.status, errText);
    return text;
  }

  const data = await res.json();
  return data.translated_text || text;
}

export async function POST(req: NextRequest) {
  try {
    const {
      text,
      texts,
      sourceLanguageCode = 'hi-IN',
      targetLanguageCode = 'ta-IN',
    } = await req.json();

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
    }

    if (Array.isArray(texts)) {
      const translatedList = await Promise.all(
        texts.map((item: string) =>
          translateSingle(item, sourceLanguageCode, targetLanguageCode, apiKey)
        )
      );
      return NextResponse.json({
        translatedTexts: translatedList,
        modelUsed: 'mayura:v1',
        targetLanguageCode,
      });
    }

    if (typeof text === 'string') {
      const translatedText = await translateSingle(
        text,
        sourceLanguageCode,
        targetLanguageCode,
        apiKey
      );
      return NextResponse.json({
        translatedText,
        modelUsed: 'mayura:v1',
        targetLanguageCode,
      });
    }

    return NextResponse.json({ error: 'text or texts array is required' }, { status: 400 });
  } catch (err: any) {
    console.error('Translate route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
