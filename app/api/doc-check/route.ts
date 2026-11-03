import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';

// Canonical mapping of scheme IDs to required core document keys
const SCHEME_DOC_REQUIREMENTS: Record<string, string[]> = {
  'pm-kisan': ['aadhaar', 'bank', 'land'],
  'ladki-bahin': ['aadhaar', 'ration', 'bank'],
  'ayushman-bharat': ['aadhaar', 'ration'],
  'pm-ujjwala': ['aadhaar', 'ration', 'bank'],
  'pm-awas': ['aadhaar', 'ration', 'bank', 'land'],
  'sukanya-samriddhi': ['aadhaar', 'birth', 'bank'],
  'pm-vishwakarma': ['aadhaar', 'ration', 'bank'],
  'pm-surya-ghar': ['aadhaar', 'electricity', 'bank'],
  'pm-fasal-bima': ['aadhaar', 'land', 'bank'],
  'kisan-credit-card': ['aadhaar', 'land', 'bank'],
  'pm-matru-vandana': ['aadhaar', 'bank', 'ration'],
  'pm-svanidhi': ['aadhaar', 'bank'],
  'pm-janaushadhi': [], // No ID required
  'atal-pension-eshram': ['aadhaar', 'bank'],
  'lakhpati-didi': ['aadhaar', 'bank', 'ration'],
  'pm-yasasvi': ['aadhaar', 'income', 'bank'],
  'mgnrega': ['aadhaar', 'ration', 'bank'],
  'pm-jan-suraksha': ['aadhaar', 'bank'],
};

const DOC_LABELS: Record<string, { hi: string; mr: string; en: string }> = {
  aadhaar: { hi: 'आधार कार्ड', mr: 'आधार कार्ड', en: 'Aadhaar Card' },
  ration: { hi: 'राशन कार्ड', mr: 'रेशन कार्ड', en: 'Ration Card' },
  bank: { hi: 'बैंक पासबुक (DBT)', mr: 'बँक पासबुक (DBT)', en: 'Bank Passbook (DBT)' },
  land: { hi: 'जमीन खतौनी / 7/12 उतारा', mr: '७/१२ उतारा / जमिनीची कागदपत्रे', en: 'Land Record (7/12 / Khatauni)' },
  income: { hi: 'आय प्रमाण पत्र', mr: 'उत्पन्नाचा दाखला', en: 'Income Certificate' },
  electricity: { hi: 'बिजली का बिल', mr: 'वीज बिल', en: 'Electricity Bill' },
  birth: { hi: 'जन्म प्रमाण पत्र', mr: 'जन्माचा दाखला', en: 'Birth Certificate' },
  eshram: { hi: 'ई-श्रम / जॉब कार्ड', mr: 'ई-श्रम / जॉब कार्ड', en: 'e-Shram / Job Card' },
};

export async function POST(req: NextRequest) {
  try {
    const {
      ownedDocs = [],
      uploadedNote = '',
      languageCode = 'hi-IN',
    } = await req.json();

    const baseLang = languageCode.startsWith('mr')
      ? 'mr'
      : languageCode.startsWith('en')
      ? 'en'
      : 'hi';

    // Also detect document keywords from any uploaded/scanned text note
    const detectedFromNote: string[] = [];
    const lowerNote = (uploadedNote || '').toLowerCase();
    if (lowerNote.includes('aadhaar') || lowerNote.includes('आधार') || /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(lowerNote)) {
      detectedFromNote.push('aadhaar');
    }
    if (lowerNote.includes('ration') || lowerNote.includes('राशन') || lowerNote.includes('रेशन')) {
      detectedFromNote.push('ration');
    }
    if (lowerNote.includes('bank') || lowerNote.includes('ifsc') || lowerNote.includes('बैंक') || lowerNote.includes('पासबुक')) {
      detectedFromNote.push('bank');
    }
    if (lowerNote.includes('7/12') || lowerNote.includes('खतौनी') || lowerNote.includes('land') || lowerNote.includes('खसरा')) {
      detectedFromNote.push('land');
    }
    if (lowerNote.includes('bijli') || lowerNote.includes('electricity') || lowerNote.includes('बिजली') || lowerNote.includes('consumer')) {
      detectedFromNote.push('electricity');
    }

    const allOwned = Array.from(new Set([...ownedDocs, ...detectedFromNote]));

    const readySchemes: any[] = [];
    const almostReadySchemes: any[] = [];

    for (const scheme of schemesData as any[]) {
      const reqDocs = SCHEME_DOC_REQUIREMENTS[scheme.id] || ['aadhaar', 'bank'];
      const missing = reqDocs.filter((d) => !allOwned.includes(d));

      if (missing.length === 0) {
        readySchemes.push({
          id: scheme.id,
          name: scheme.name[baseLang] || scheme.name.hi,
          icon: scheme.icon,
          benefitBadge: scheme.benefitBadge?.[baseLang] || scheme.benefitBadge?.hi,
        });
      } else if (missing.length === 1) {
        const missingKey = missing[0];
        almostReadySchemes.push({
          id: scheme.id,
          name: scheme.name[baseLang] || scheme.name.hi,
          icon: scheme.icon,
          benefitBadge: scheme.benefitBadge?.[baseLang] || scheme.benefitBadge?.hi,
          missingDoc: DOC_LABELS[missingKey]?.[baseLang] || missingKey,
        });
      }
    }

    // Build initial summary in base language
    let spokenSummary =
      baseLang === 'mr'
        ? `तुमच्या कागदपत्रांनुसार तुम्ही सध्या ${readySchemes.length} सरकारी योजनांसाठी पूर्णपणे पात्र आहात. यामध्ये ${readySchemes
            .slice(0, 3)
            .map((s) => s.name)
            .join(', ')} यांचा समावेश आहे.`
        : baseLang === 'en'
        ? `Based on your documents, you are 100% ready to apply for ${readySchemes.length} government schemes today, including ${readySchemes
            .slice(0, 3)
            .map((s) => s.name)
            .join(', ')}.`
        : `आपके दस्तावेजों के आधार पर आप अभी तुरंत ${readySchemes.length} सरकारी योजनाओं में आवेदन करने के लिए तैयार हैं, जिनमें ${readySchemes
            .slice(0, 3)
            .map((s) => s.name)
            .join(', ')} शामिल हैं।`;

    if (almostReadySchemes.length > 0) {
      const firstAlmost = almostReadySchemes[0];
      spokenSummary +=
        baseLang === 'mr'
          ? ` तसेच '${firstAlmost.missingDoc}' जोडल्यास तुम्हाला ${firstAlmost.name} चाही लाभ मिळू शकतो.`
          : baseLang === 'en'
          ? ` By adding just your ${firstAlmost.missingDoc}, you can also unlock ${firstAlmost.name}.`
          : ` साथ ही केवल '${firstAlmost.missingDoc}' बनवा लेने पर आप ${firstAlmost.name} का भी लाभ ले सकते हैं।`;
    }

    // If user selected another Indic language (e.g., ta-IN, te-IN, bn-IN, gu-IN, kn-IN), translate via Sarvam Mayura!
    const apiKey = process.env.SARVAM_API_KEY;
    let modelUsed = 'sarvam-doc-intelligence';
    if (
      apiKey &&
      !['hi-IN', 'mr-IN', 'en-IN'].includes(languageCode)
    ) {
      try {
        const transRes = await fetch('https://api.sarvam.ai/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-subscription-key': apiKey,
          },
          body: JSON.stringify({
            input: spokenSummary,
            source_language_code: 'hi-IN',
            target_language_code: languageCode,
            model: 'mayura:v1',
            mode: 'formal',
          }),
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          if (transData.translated_text) {
            spokenSummary = transData.translated_text;
            modelUsed = 'mayura:v1 + doc-readiness';
          }
        }
      } catch (e) {
        console.warn('Doc check translate fallback:', e);
      }
    }

    return NextResponse.json({
      ownedDocs: allOwned,
      detectedFromNote,
      readySchemes,
      almostReadySchemes,
      spokenSummary,
      languageCode,
      modelUsed,
    });
  } catch (err: any) {
    console.error('Doc check error:', err);
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
