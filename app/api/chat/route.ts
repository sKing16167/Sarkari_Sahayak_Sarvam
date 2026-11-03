import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';
import demoCache from '@/data/demo-cache.json';

interface I18nArray {
  en: string[];
  hi: string[];
  mr: string[];
}

interface Scheme {
  id: string;
  name: { en: string; hi: string; mr: string };
  icon: string;
  category: string;
  benefitBadge?: { en: string; hi: string; mr: string };
  tagline: { en: string; hi: string; mr: string };
  helpline?: string;
  eligibility: string[];
  eligibilityI18n?: I18nArray;
  benefits: string[];
  benefitsI18n?: I18nArray;
  documents: string[];
  documentsI18n?: I18nArray;
  howToApply: string[];
  howToApplyI18n?: I18nArray;
  officialLink: string;
  keywords: string[];
}

const LANGUAGE_NAMES: Record<string, string> = {
  'hi-IN': 'Hindi (हिंदी)',
  'mr-IN': 'Marathi (मराठी)',
  'en-IN': 'simple English',
  'ta-IN': 'Tamil (தமிழ்)',
  'te-IN': 'Telugu (తెలుగు)',
  'bn-IN': 'Bengali (বাংলা)',
  'gu-IN': 'Gujarati (ગુજરાતી)',
  'kn-IN': 'Kannada (ಕನ್ನಡ)',
};

function matchSchemes(transcript: string, schemes: Scheme[]): Scheme[] {
  const lower = transcript.toLowerCase();
  const scored = schemes
    .map((s) => {
      let score = 0;
      if (lower.includes(s.id.replace('-', ' ')) || lower.includes(s.id)) score += 5;
      if (lower.includes(s.name.en.toLowerCase())) score += 5;
      if (lower.includes(s.name.hi)) score += 5;
      if (lower.includes(s.name.mr)) score += 5;
      for (const k of s.keywords) {
        if (lower.includes(k.toLowerCase())) {
          score += 2;
        }
      }
      if (lower.includes(s.category.toLowerCase())) score += 1;
      return { scheme: s, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored.slice(0, 5).map((item) => item.scheme);
  }
  return schemes;
}

function cleanJsonText(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return cleaned.trim();
}

function getBaseLangKey(langCode: string): 'hi' | 'mr' | 'en' {
  if (langCode.startsWith('mr')) return 'mr';
  if (langCode.startsWith('en')) return 'en';
  return 'hi';
}

function getStaticFallback(matchedScheme: Scheme | undefined, langCode: string) {
  const scheme = (matchedScheme || schemesData[0]) as Scheme;
  const langKey = getBaseLangKey(langCode);
  const eligList = scheme.eligibilityI18n?.[langKey] || scheme.eligibility;
  const benList = scheme.benefitsI18n?.[langKey] || scheme.benefits;
  const docList = scheme.documentsI18n?.[langKey] || scheme.documents;

  return {
    schemeId: scheme.id,
    spokenText: `${scheme.name[langKey]}। ${scheme.tagline[langKey]}। ${benList[0] || ''}`,
    card: {
      title: scheme.name[langKey],
      eligibility: eligList,
      benefits: benList,
      documents: docList,
    },
    languageCode: langCode || 'hi-IN',
    modelUsed: 'static-verified-rag',
  };
}

export async function POST(req: NextRequest) {
  try {
    const { transcript, languageCode = 'hi-IN', isDemo = false } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const baseLangKey = getBaseLangKey(languageCode);

    // Demo mode fallback check
    if (isDemo) {
      const lower = transcript.toLowerCase();
      const cached = demoCache.find(
        (d) =>
          lower.includes(d.query.toLowerCase()) ||
          d.query.toLowerCase().includes(lower) ||
          (d.schemeId && lower.includes(d.schemeId.replace('-', ' '))) ||
          (d.schemeId && lower.includes(d.schemeId))
      );
      if (cached) {
        return NextResponse.json({ ...cached, modelUsed: 'demo-cache' });
      }
      const matchedForDemo = matchSchemes(transcript, schemesData as Scheme[]);
      return NextResponse.json(getStaticFallback(matchedForDemo[0], languageCode));
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'SARVAM_API_KEY not configured' }, { status: 500 });
    }

    const matchedSchemes = matchSchemes(transcript, schemesData as Scheme[]);
    const primaryMatched = matchedSchemes[0];

    const contextJson = JSON.stringify(
      matchedSchemes.map((s) => ({
        id: s.id,
        name: s.name[baseLangKey] || s.name.hi,
        category: s.category,
        tagline: s.tagline[baseLangKey] || s.tagline.hi,
        eligibility: s.eligibilityI18n?.[baseLangKey] || s.eligibility,
        benefits: s.benefitsI18n?.[baseLangKey] || s.benefits,
        documents: s.documentsI18n?.[baseLangKey] || s.documents,
        howToApply: s.howToApplyI18n?.[baseLangKey] || s.howToApply,
        helpline: s.helpline,
        officialLink: s.officialLink,
      })),
      null,
      2
    );

    const targetLangName = LANGUAGE_NAMES[languageCode] || 'Hindi (हिंदी)';

    const systemPrompt = `You are Sarkari Sahayak, a warm, trustworthy helper for low-literacy citizens in India.
Answer ONLY from the SCHEMES CONTEXT provided below. Never invent benefits, amounts, dates, or eligibility rules.
Reply strictly in ${targetLangName}.
Use very short, simple, everyday words (Class 5 reading level). If information is not in the context, politely say you do not have that detail and suggest calling the official helpline or visiting the official portal.

Return ONLY a single valid JSON object (no markdown fences, no extra explanation):
{
  "schemeId": "matched-scheme-id or null",
  "spokenText": "2 to 3 short, friendly sentences in ${targetLangName} suitable for reading aloud via TTS, with numbers written clearly and no bullet symbols",
  "card": {
    "title": "Clear title in ${targetLangName}",
    "eligibility": ["Short point 1 in ${targetLangName}", "Short point 2"],
    "benefits": ["Short benefit 1 in ${targetLangName}", "Short benefit 2"],
    "documents": ["Document 1 in ${targetLangName}", "Document 2"]
  },
  "languageCode": "${languageCode || 'hi-IN'}"
}

SCHEMES CONTEXT:
${contextJson}`;

    const modelName = process.env.SARVAM_LLM_MODEL || 'sarvam-105b-conversations';

    let lastError: any = null;
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
          return NextResponse.json({
            ...parsed,
            languageCode: languageCode || 'hi-IN',
            modelUsed: modelName,
          });
        }
        throw new Error('Missing spokenText or card in response');
      } catch (err: any) {
        lastError = err;
        console.warn(`LLM attempt ${attempt} failed:`, err.message);
      }
    }

    console.error('Falling back to static scheme card due to LLM error:', lastError?.message);
    const fallbackResponse = getStaticFallback(primaryMatched, languageCode);
    return NextResponse.json(fallbackResponse);
  } catch (err: any) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
