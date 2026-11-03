import { NextRequest, NextResponse } from 'next/server';

const VALID_SPEAKERS = ['ritu', 'priya', 'neha', 'pooja', 'simran', 'kavya', 'aditya', 'ashutosh', 'rahul', 'rohan', 'amit', 'dev'];

export async function POST(req: NextRequest) {
  try {
    const { text, languageCode = 'hi-IN', speaker: requestedSpeaker } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
    }

    // Normalize BCP-47 target language code supported by Sarvam Bulbul v3
    const langMap: Record<string, string> = {
      hi: 'hi-IN',
      mr: 'mr-IN',
      en: 'en-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      bn: 'bn-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
      pa: 'pa-IN',
      od: 'od-IN',
    };

    const shortCode = languageCode.split('-')[0].toLowerCase();
    const lang = langMap[shortCode] || (languageCode.includes('-') ? languageCode : 'hi-IN');

    const model = process.env.SARVAM_TTS_MODEL || 'bulbul:v3';
    const envSpeaker = process.env.SARVAM_TTS_SPEAKER || 'ritu';
    const speaker =
      requestedSpeaker && VALID_SPEAKERS.includes(requestedSpeaker.toLowerCase())
        ? requestedSpeaker.toLowerCase()
        : envSpeaker;

    // Maximum characters per chunk for safety
    const trimmedText = text.slice(0, 500);

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': apiKey,
      },
      body: JSON.stringify({
        inputs: [trimmedText],
        target_language_code: lang,
        speaker: speaker,
        model: model,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Sarvam TTS error:', response.status, errText);
      return NextResponse.json(
        { error: 'TTS generation failed', details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const audioBase64 = data.audios?.[0];

    if (!audioBase64) {
      return NextResponse.json({ error: 'No audio returned from Sarvam TTS' }, { status: 500 });
    }

    return NextResponse.json({
      audioBase64,
      mimeType: 'audio/wav',
      dataUrl: `data:audio/wav;base64,${audioBase64}`,
      modelUsed: model,
      speakerUsed: speaker,
      languageCode: lang,
    });
  } catch (err: any) {
    console.error('TTS handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
