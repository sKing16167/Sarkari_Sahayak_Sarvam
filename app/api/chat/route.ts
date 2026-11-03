import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';
import demoCache from '@/data/demo-cache.json';

interface Scheme {
  id: string;
  name: { en: string; hi: string; mr: string };
  icon: string;
  tagline: { en: string; hi: string; mr: string };
  category: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  howToApply: string[];
  officialLink: string;
  keywords: string[];
}

function matchSchemes(transcript: string, schemes: Scheme[]): Scheme[] {
  const lower = transcript.toLowerCase();
  const matched = schemes.filter(s => {
    return (
      s.keywords.some(k => lower.includes(k.toLowerCase())) ||
      lower.includes(s.id) ||
      lower.includes(s.name.en.toLowerCase()) ||
      lower.includes(s.name.hi) ||
      lower.includes(s.name.mr)
    );
  });
  return matched.length > 0 ? matched : schemes;
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function getStaticFallback(matchedScheme: Scheme | undefined, lang: string) {
  const scheme = matchedScheme || schemesData[0];
  const langKey = lang.startsWith('mr') ? 'mr' : lang.startsWith('en') ? 'en' : 'hi';
  return {
    schemeId: scheme.id,
    spokenText: scheme.tagline[langKey] + '। ' + (scheme.benefits[0] || ''),
    card: {
      title: scheme.name[langKey],
      eligibility: scheme.eligibility,
      benefits: scheme.benefits,
      documents: scheme.documents,
    },
    languageCode: lang || 'hi-IN',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, languageCode = 'hi-IN', isDemo = false } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Demo mode fallback check
    if (isDemo) {
      const lower = transcript.toLowerCase();
      const cached = demoCache.find(
        d =>
          lower.includes(d.query.toLowerCase()) ||
          d.query.toLowerCase().includes(lower) ||
          (d.schemeId && lower.includes(d.schemeId))
      ) || demoCache[0];
      return NextResponse.json(cached);
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
    }

    const matchedSchemes = matchSchemes(transcript, schemesData as Scheme[]);
    const primaryMatched = matchedSchemes.length === 1 ? matchedSchemes[0] : (matchedSchemes.length > 0 ? matchedSchemes[0] : undefined);

    const contextJson = JSON.stringify(
      matchedSchemes.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        eligibility: s.eligibility,
        benefits: s.benefits,
        documents: s.documents,
        howToApply: s.howToApply,
        officialLink: s.officialLink,
      })),
      null,
      2
    );

    const systemPrompt = `You are Sarkari Sahayak, a kind helper for people with low literacy in India. 
Answer ONLY from the SCHEMES context provided below. Never invent amounts, dates, or eligibility rules.
Reply in the user's spoken language:
- If user speaks Hindi or Hinglish (mix of Hindi + English), reply in simple, clear Hindi.
- If user speaks Marathi or Marathi+English, reply in simple, clear Marathi.
- If user speaks English, reply in simple English.
Use very short, simple words (Class 5 reading level). If information is not in the context, explicitly say you do not know and refer to the official portal.

You must return ONLY a single valid JSON object, without extra text or markdown code fences:
{
  "schemeId": "matched-scheme-id or null",
  "spokenText": "2-3 short sentences in the user's language, no bullet marks, numbers written clearly for speech",
  "card": {
    "title": "Clear short title in the reply language",
    "eligibility": ["Short simple bullet 1", "Short simple bullet 2"],
    "benefits": ["Short benefit 1", "Short benefit 2"],
    "documents": ["Document 1", "Document 2"]
  },
  "languageCode": "${languageCode || 'hi-IN'}"
}

SCHEMES CONTEXT:
${contextJson}`;

    const modelName = process.env.SARVAM_LLM_MODEL || 'sarvam-105b-conversations';

    let lastError: any = null;
    // Attempt call with 1 retry on invalid JSON
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const sarvamRes = await fetch('https://api.sarvam.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': apiKey,
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: transcript },
            ],
            temperature: 0.2,
          }),
        });

        if (!sarvamRes.ok) {
          const errText = await sarvamRes.text();
          throw new Error(`Sarvam LLM failed (${sarvamRes.status}): ${errText}`);
        }

        const data = await sarvamRes.json();
        const content = data.choices?.[0]?.message?.content || '';
        const cleaned = cleanJsonText(content);
        const parsed = JSON.parse(cleaned);

        if (parsed.spokenText && parsed.card) {
          return NextResponse.json(parsed);
        }
        throw new Error('Missing spokenText or card in response');
      } catch (err: any) {
        lastError = err;
        console.warn(`LLM attempt ${attempt} failed:`, err.message);
      }
    }

    // Fallback to static card if LLM fails or returns invalid JSON
    console.error('Falling back to static scheme card due to LLM error:', lastError?.message);
    const fallbackResponse = getStaticFallback(primaryMatched, languageCode);
    return NextResponse.json(fallbackResponse);
  } catch (err: any) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
