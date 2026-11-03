import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text, languageCode = 'hi-IN' } = await req.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
    }

    // Determine target language code (e.g. hi-IN, mr-IN, en-IN)
    let lang = languageCode;
    if (lang.startsWith('hi')) lang = 'hi-IN';
    else if (lang.startsWith('mr')) lang = 'mr-IN';
    else if (lang.startsWith('en')) lang = 'en-IN';
    else if (!lang.includes('-')) lang = `${lang}-IN`;

    const model = process.env.SARVAM_TTS_MODEL || 'bulbul:v3';
    const speaker = process.env.SARVAM_TTS_SPEAKER || 'ritu';

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
    });
  } catch (err: any) {
    console.error('TTS handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
