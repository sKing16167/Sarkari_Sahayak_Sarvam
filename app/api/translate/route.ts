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

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
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

      if (res.status === 429 && attempt === 0) {
        await new Promise((r) => setTimeout(r, 600));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.warn('Sarvam Mayura translate warning:', res.status, errText);
        return text;
      }

      const data = await res.json();
      return data.translated_text || text;
    } catch (e) {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      return text;
    }
  }
  return text;
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
      const results: string[] = [];
      const CHUNK_SIZE = 4;
      for (let i = 0; i < texts.length; i += CHUNK_SIZE) {
        const chunk = texts.slice(i, i + CHUNK_SIZE);
        const chunkResults = await Promise.all(
          chunk.map((item: string) =>
            translateSingle(item, sourceLanguageCode, targetLanguageCode, apiKey)
          )
        );
        results.push(...chunkResults);
        if (i + CHUNK_SIZE < texts.length) {
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
      }
      return NextResponse.json({
        translatedTexts: results,
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
