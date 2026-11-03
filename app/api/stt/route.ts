import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('audio')) as Blob | null;
    const languageHint = (formData.get('language_hint') as string) || 'unknown';

    if (!file) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    // Call Sarvam STT REST endpoint
    const sarvamFormData = new FormData();
    const mimeType = file.type || '';
    let filename = 'recording.wav';
    if (mimeType.includes('webm')) filename = 'recording.webm';
    else if (mimeType.includes('ogg')) filename = 'recording.ogg';
    else if (mimeType.includes('mp4')) filename = 'recording.mp4';
    sarvamFormData.append('file', file, filename);
    sarvamFormData.append('model', process.env.SARVAM_STT_MODEL || 'saaras:v3');
    if (languageHint && languageHint !== 'unknown') {
      sarvamFormData.append('language_code', languageHint);
    } else {
      sarvamFormData.append('language_code', 'unknown');
    }

    const response = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': apiKey,
      },
      body: sarvamFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Sarvam STT error:', response.status, errText);
      return NextResponse.json(
        { error: 'STT conversion failed', details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      transcript: data.transcript || '',
      languageCode: data.language_code || 'hi-IN',
    });
  } catch (err: any) {
    console.error('STT handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
