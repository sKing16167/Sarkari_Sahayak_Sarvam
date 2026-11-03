import { NextRequest, NextResponse } from 'next/server';
import schemesData from '@/data/schemes.json';

// Canonical mapping of all 34 scheme IDs to required core document keys
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
  'pm-janaushadhi': [], // Direct OTC access
  'atal-pension-eshram': ['aadhaar', 'bank'],
  'lakhpati-didi': ['aadhaar', 'bank', 'ration'],
  'pm-yasasvi': ['aadhaar', 'income', 'bank'],
  'mgnrega': ['aadhaar', 'ration', 'bank'],
  'pm-jan-suraksha': ['aadhaar', 'bank'],
  'pmegp': ['aadhaar', 'bank', 'income'],
  'pm-kusum': ['aadhaar', 'land', 'bank'],
  'pmmsy': ['aadhaar', 'bank'],
  'soil-health-card': ['aadhaar', 'land'],
  'mjpjay': ['aadhaar', 'ration'],
  'lek-ladki': ['aadhaar', 'birth', 'ration'],
  'pmgkay': ['aadhaar', 'ration'],
  'pm-poshan': [],
  'standup-india': ['aadhaar', 'bank'],
  'mudra-yojana': ['aadhaar', 'bank'],
  'pm-shram-yogi': ['aadhaar', 'bank'],
  'nsp-scholarship': ['aadhaar', 'income', 'bank'],
  'pragati-scholarship': ['aadhaar', 'income', 'bank'],
  'pm-svamitva': ['aadhaar', 'land'],
  'pm-divyangjan': ['aadhaar', 'bank'],
  'pm-vaya-vandana': ['aadhaar', 'bank'],
};

const DOC_LABELS: Record<string, Record<string, string>> = {
  aadhaar: {
    hi: 'आधार कार्ड',
    mr: 'आधार कार्ड',
    en: 'Aadhaar Card',
    ta: 'ஆதார் அட்டை',
    te: 'ఆధార్ కార్డు',
    bn: 'আধার কার্ড',
    gu: 'આધાર કાર્ડ',
    kn: 'ಆಧಾರ್ ಕಾರ್ಡ್',
  },
  ration: {
    hi: 'राशन कार्ड',
    mr: 'रेशन कार्ड',
    en: 'Ration Card',
    ta: 'ரேஷன் அட்டை',
    te: 'రేషన్ కార్డు',
    bn: 'রেশন কার্ড',
    gu: 'રેશન કાર્ડ',
    kn: 'ರೇಷನ್ ಕಾರ್ಡ್',
  },
  bank: {
    hi: 'बैंक पासबुक (DBT)',
    mr: 'बँक पासबुक (DBT)',
    en: 'Bank Passbook (DBT)',
    ta: 'வங்கி கணக்கு புத்தகம்',
    te: 'బ్యాంక్ పాస్‌బుక్',
    bn: 'ব্যাঙ্ক পাসবই',
    gu: 'બેંક પાસબુક',
    kn: 'ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್',
  },
  land: {
    hi: 'जमीन खतौनी / 7/12 उतारा',
    mr: '७/१२ उतारा / जमिनीची कागदपत्रे',
    en: 'Land Record (7/12 / Khatauni)',
    ta: 'நில ஆவணங்கள்',
    te: 'భూమి రికార్డులు',
    bn: 'জমির খতিয়ান',
    gu: 'જમીન દસ્તાવેજ',
    kn: 'ಜಮೀನು ದಾಖಲೆ',
  },
  income: {
    hi: 'आय प्रमाण पत्र',
    mr: 'उत्पन्नाचा दाखला',
    en: 'Income Certificate',
    ta: 'வருமானச் சான்றிதழ்',
    te: 'ఆదాయ ధృవీకరణ పత్రం',
    bn: 'আয় সনদপত্র',
    gu: 'આવકનું પ્રમાણપત્ર',
    kn: 'ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ',
  },
  electricity: {
    hi: 'बिजली का बिल',
    mr: 'वीज बिल',
    en: 'Electricity Bill',
    ta: 'மின்சார கட்டண ரசீது',
    te: 'విద్యుత్ బిల్లు',
    bn: 'বিদ্যুৎ বিল',
    gu: 'વીજળી બિલ',
    kn: 'ವಿದ್ಯುತ್ ಬಿಲ್',
  },
  birth: {
    hi: 'जन्म प्रमाण पत्र',
    mr: 'जन्माचा दाखला',
    en: 'Birth Certificate',
    ta: 'பிறப்புச் சான்றிதழ்',
    te: 'జనన ధృవీకరణ పత్రం',
    bn: 'जन्म সনদপত্র',
    gu: 'જન્મ પ્રમાણપત્ર',
    kn: 'ಜನನ ಪ್ರಮಾಣಪತ್ರ',
  },
  eshram: {
    hi: 'ई-श्रम / जॉब कार्ड',
    mr: 'ई-श्रम / जॉब कार्ड',
    en: 'e-Shram / Job Card',
    ta: 'இ-ஷ்ரம் அட்டை',
    te: 'ఇ-శ్రమ్ కార్డు',
    bn: 'ই-শ্রম কার্ড',
    gu: 'ઇ-શ્રમ કાર્ડ',
    kn: 'ಇ-ಶ್ರಮ್ ಕಾರ್ಡ್',
  },
  caste: {
    hi: 'जाति प्रमाण पत्र',
    mr: 'जात प्रमाणपत्र',
    en: 'Caste Certificate',
    ta: 'சாதிச் சான்றிதழ்',
    te: 'కుల ధృవీకరణ పత్రం',
    bn: 'জাতিগত সনদপত্র',
    gu: 'જાતિનું પ્રમાણપત્ર',
    kn: 'ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ',
  },
  photo: {
    hi: 'पासपोर्ट फोटो',
    mr: 'पासपोर्ट फोटो',
    en: 'Passport Photo',
    ta: 'புகைப்படம்',
    te: 'పాస్‌పోర్ట్ సైజు ఫోటో',
    bn: 'পাসপোর্ট ছবি',
    gu: 'પાસપોર્ટ ફોટો',
    kn: 'ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ownedDocs: string[] = body.ownedDocs || [];
    const uploadedNote: string = body.uploadedNote || body.uploadedNoteText || '';
    const languageCode: string = body.languageCode || body.targetLanguageCode || 'hi-IN';

    const userLangKey = ['hi', 'mr', 'en', 'ta', 'te', 'bn', 'gu', 'kn'].find(
      (k) => languageCode.startsWith(k)
    ) || 'hi';

    // Also detect document keywords from any uploaded/scanned text note
    const detectedFromNote: string[] = [];
    const lowerNote = (uploadedNote || '').toLowerCase();
    if (
      lowerNote.includes('aadhaar') ||
      lowerNote.includes('आधार') ||
      /\b\d{4}\s?\d{4}\s?\d{4}\b/.test(lowerNote)
    ) {
      detectedFromNote.push('aadhaar');
    }
    if (lowerNote.includes('ration') || lowerNote.includes('राशन') || lowerNote.includes('रेशन')) {
      detectedFromNote.push('ration');
    }
    if (
      lowerNote.includes('bank') ||
      lowerNote.includes('ifsc') ||
      lowerNote.includes('बैंक') ||
      lowerNote.includes('पासबुक')
    ) {
      detectedFromNote.push('bank');
    }
    if (
      lowerNote.includes('7/12') ||
      lowerNote.includes('खतौनी') ||
      lowerNote.includes('land') ||
      lowerNote.includes('खसरा')
    ) {
      detectedFromNote.push('land');
    }
    if (
      lowerNote.includes('bijli') ||
      lowerNote.includes('electricity') ||
      lowerNote.includes('बिजली') ||
      lowerNote.includes('consumer')
    ) {
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
          ...scheme,
          missingDoc: null,
        });
      } else if (missing.length === 1) {
        const missingKey = missing[0];
        almostReadySchemes.push({
          ...scheme,
          missingDoc:
            DOC_LABELS[missingKey]?.[userLangKey] ||
            DOC_LABELS[missingKey]?.hi ||
            missingKey,
        });
      }
    }

    // Build initial summary in matching language
    const sampleReadyNames = readySchemes
      .slice(0, 3)
      .map((s) => s.name[userLangKey] || s.name.hi || s.name.en)
      .join(', ');

    let spokenSummary = '';
    if (userLangKey === 'mr') {
      spokenSummary = `तुमच्या कागदपत्रांनुसार तुम्ही सध्या ${readySchemes.length} सरकारी योजनांसाठी पूर्णपणे पात्र आहात. यामध्ये ${sampleReadyNames} यांचा समावेश आहे.`;
      if (almostReadySchemes.length > 0) {
        const firstAlmost = almostReadySchemes[0];
        const aName = firstAlmost.name.mr || firstAlmost.name.hi;
        spokenSummary += ` तसेच '${firstAlmost.missingDoc}' जोडल्यास तुम्हाला ${aName} चाही लाभ मिळू शकतो.`;
      }
    } else if (userLangKey === 'en') {
      spokenSummary = `Based on your documents, you are 100% ready to apply for ${readySchemes.length} government schemes today, including ${sampleReadyNames}.`;
      if (almostReadySchemes.length > 0) {
        const firstAlmost = almostReadySchemes[0];
        const aName = firstAlmost.name.en || firstAlmost.name.hi;
        spokenSummary += ` By adding just your ${firstAlmost.missingDoc}, you can also unlock ${aName}.`;
      }
    } else {
      spokenSummary = `आपके दस्तावेजों के आधार पर आप अभी तुरंत ${readySchemes.length} सरकारी योजनाओं में आवेदन करने के लिए तैयार हैं, जिनमें ${sampleReadyNames} शामिल हैं।`;
      if (almostReadySchemes.length > 0) {
        const firstAlmost = almostReadySchemes[0];
        const aName = firstAlmost.name.hi || firstAlmost.name.en;
        spokenSummary += ` साथ ही केवल '${firstAlmost.missingDoc}' बनवा लेने पर आप ${aName} का भी लाभ ले सकते हैं।`;
      }
    }

    // If language is ta, te, bn, gu, or kn, translate via Sarvam Mayura v1!
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
