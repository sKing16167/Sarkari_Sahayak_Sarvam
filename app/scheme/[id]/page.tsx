'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import schemesData from '@/data/schemes.json';
import { SchemeRealIcon } from '@/components/CivicIcons';
import {
  ArrowLeft,
  Volume2,
  ExternalLink,
  CheckCircle2,
  Gift,
  FileText,
  Loader2,
  Square,
  PhoneCall,
  Languages,
  Cpu,
} from 'lucide-react';

type IndicLang = 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu' | 'kn' | 'en';

const LANG_OPTIONS: { id: IndicLang; code: string; label: string }[] = [
  { id: 'hi', code: 'hi-IN', label: 'हिन्दी' },
  { id: 'mr', code: 'mr-IN', label: 'मराठी' },
  { id: 'ta', code: 'ta-IN', label: 'தமிழ்' },
  { id: 'te', code: 'te-IN', label: 'తెలుగు' },
  { id: 'bn', code: 'bn-IN', label: 'বাংলা' },
  { id: 'gu', code: 'gu-IN', label: 'ગુજરાતી' },
  { id: 'kn', code: 'kn-IN', label: 'ಕನ್ನಡ' },
  { id: 'en', code: 'en-IN', label: 'English' },
];

export default function SchemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [lang, setLang] = useState<IndicLang>('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedDetails, setTranslatedDetails] = useState<Record<
    string,
    {
      name: string;
      tagline: string;
      badge: string;
      benefits: string[];
      eligibility: string[];
      documents: string[];
      howToApply: string[];
    }
  >>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  const scheme = schemesData.find((s) => s.id === id) as any;

  useEffect(() => {
    return () => {
      if (audioInstance) {
        audioInstance.pause();
      }
    };
  }, [audioInstance]);

  useEffect(() => {
    if (!scheme) return;
    if (lang === 'hi' || lang === 'mr' || lang === 'en') return;
    if (translatedDetails[lang]) return;

    const translateScheme = async () => {
      try {
        setIsTranslating(true);
        const targetCode = LANG_OPTIONS.find((l) => l.id === lang)?.code || 'hi-IN';

        const baseName = scheme.name.en;
        const baseTagline = scheme.tagline.en;
        const baseBadge = scheme.benefitBadge?.en || scheme.benefits[0];
        const baseBenefits: string[] = scheme.benefitsI18n?.en || scheme.benefits;
        const baseEligibility: string[] = scheme.eligibilityI18n?.en || scheme.eligibility;
        const baseDocs: string[] = scheme.documentsI18n?.en || scheme.documents;
        const baseHow: string[] = scheme.howToApplyI18n?.en || scheme.howToApply;

        const allStrings = [
          baseName,
          baseTagline,
          baseBadge,
          ...baseBenefits,
          ...baseEligibility,
          ...baseDocs,
          ...baseHow,
        ];

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: allStrings,
            sourceLanguageCode: 'en-IN',
            targetLanguageCode: targetCode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const t: string[] = data.translatedTexts || allStrings;
          let idx = 0;
          const name = t[idx++];
          const tagline = t[idx++];
          const badge = t[idx++];
          const benefits = t.slice(idx, idx + baseBenefits.length);
          idx += baseBenefits.length;
          const eligibility = t.slice(idx, idx + baseEligibility.length);
          idx += baseEligibility.length;
          const documents = t.slice(idx, idx + baseDocs.length);
          idx += baseDocs.length;
          const howToApply = t.slice(idx, idx + baseHow.length);

          setTranslatedDetails((prev) => ({
            ...prev,
            [lang]: { name, tagline, badge, benefits, eligibility, documents, howToApply },
          }));
        }
      } catch (e) {
        console.error('Detail translation error:', e);
      } finally {
        setIsTranslating(false);
      }
    };

    translateScheme();
  }, [lang, scheme, translatedDetails]);

  if (!scheme) {
    return (
      <div className="max-w-xl mx-auto p-12 text-center">
        <p className="text-xl text-[#545454] mb-6 font-bold">योजना नहीं मिली (Scheme not found)</p>
        <button
          onClick={() => router.push('/')}
          className="h-14 px-8 bg-saffron text-white rounded-2xl font-bold min-h-[56px] shadow-sm hover:bg-saffron-600 transition-colors"
        >
          होम पर जाएं (Go Home)
        </button>
      </div>
    );
  }

  const isNativeLang = lang === 'hi' || lang === 'mr' || lang === 'en';
  const tData = !isNativeLang ? translatedDetails[lang] : null;

  const displayName = tData?.name || scheme.name[isNativeLang ? lang : 'hi'];
  const displayTagline = tData?.tagline || scheme.tagline[isNativeLang ? lang : 'hi'];
  const benefitsList: string[] =
    tData?.benefits || scheme.benefitsI18n?.[isNativeLang ? lang : 'hi'] || scheme.benefits;
  const eligibilityList: string[] =
    tData?.eligibility || scheme.eligibilityI18n?.[isNativeLang ? lang : 'hi'] || scheme.eligibility;
  const documentsList: string[] =
    tData?.documents || scheme.documentsI18n?.[isNativeLang ? lang : 'hi'] || scheme.documents;
  const howToApplyList: string[] =
    tData?.howToApply || scheme.howToApplyI18n?.[isNativeLang ? lang : 'hi'] || scheme.howToApply;
  const benefitBadge: string =
    tData?.badge || scheme.benefitBadge?.[isNativeLang ? lang : 'hi'] || scheme.benefitBadge?.hi || benefitsList[0];

  const handlePlayTTS = async () => {
    if (isPlaying && audioInstance) {
      audioInstance.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const spokenSummary = `${displayName}। ${displayTagline}। ${benefitsList.slice(0, 2).join('। ')}। ${documentsList.slice(0, 3).join(', ')}।`;
      const langCode = LANG_OPTIONS.find((l) => l.id === lang)?.code || 'hi-IN';

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spokenSummary, languageCode: langCode, speaker: 'ritu' }),
      });

      if (!res.ok) throw new Error('Audio generation failed');
      const data = await res.json();

      if (data.dataUrl) {
        const audio = new Audio(data.dataUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        setAudioInstance(audio);
        await audio.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error(e);
      alert('आवाज लोड नहीं हो सकी (Audio unavailable)');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="h-1.5 w-full tricolor-ribbon" />

      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E6D7C3]">
          <button
            onClick={() => router.push('/')}
            className="min-h-[48px] px-4 flex items-center gap-2 rounded-2xl bg-white border border-[#E6D7C3] shadow-2xs text-[#1E1E1E] hover:border-saffron active:scale-95 transition-all text-sm font-bold self-start"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 text-saffron" />
            <span>{lang === 'mr' ? 'मागे जा (Back)' : lang === 'en' ? 'Back to All Schemes' : 'सभी योजनाओं पर वापस जाएं'}</span>
          </button>

          {/* 8-Language Sarvam Mayura Bar */}
          <div className="flex items-center gap-1.5 flex-wrap bg-white rounded-2xl p-1.5 border border-[#E6D7C3] shadow-2xs">
            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-saffron px-2">
              <Languages className="w-3.5 h-3.5" />
              Mayura:
            </span>
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-colors ${
                  lang === l.id ? 'bg-saffron text-white shadow-2xs' : 'text-[#545454] hover:text-[#1E1E1E]'
                }`}
              >
                {l.label}
              </button>
            ))}
            {isTranslating && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-saffron px-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Translating...
              </span>
            )}
          </div>
        </div>

        {/* Scheme Hero Header */}
        <div className="mt-6 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border-2 border-[#E6D7C3] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center p-2 flex-shrink-0 shadow-2xs">
                <SchemeRealIcon
                  iconId={scheme.iconId}
                  category={scheme.category}
                  className="w-12 h-12 sm:w-14 sm:h-14"
                />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold px-3 py-1 rounded-xl bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                    <Gift className="w-4 h-4" />
                    {benefitBadge}
                  </span>
                  {scheme.helpline && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                      <PhoneCall className="w-3.5 h-3.5" />
                      हेल्पलाइन: {scheme.helpline}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-slate-900 text-amber-300">
                    <Cpu className="w-3 h-3" />
                    bulbul:v3 + mayura:v1
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] leading-tight">
                  {displayName}
                </h1>
                <p className="mt-2.5 text-base sm:text-lg text-[#545454] font-medium leading-relaxed">
                  {displayTagline}
                </p>
              </div>
            </div>

            {/* Listen Button */}
            <div className="flex-shrink-0 md:w-64">
              <button
                onClick={handlePlayTTS}
                disabled={isLoadingAudio}
                className={`w-full h-14 min-h-[56px] flex items-center justify-center gap-2.5 rounded-2xl font-bold text-base shadow-md active:scale-[0.98] transition-all ${
                  isPlaying
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-saffron hover:bg-saffron-600 text-white'
                }`}
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>आवाज तैयार हो रही है...</span>
                  </>
                ) : isPlaying ? (
                  <>
                    <Square className="w-5 h-5 fill-current" />
                    <span>रोकें (Stop Audio)</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-6 h-6" />
                    <span>
                      {lang === 'mr' ? 'बोलून ऐका 🔊' : lang === 'en' ? 'Listen Aloud 🔊' : 'बोलकर सुनें 🔊'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Key Sections: 2-column grid on tablets/laptops, 1-column on mobile */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Benefits */}
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#E6D7C3] shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
                <Gift className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1E1E]">
                {lang === 'mr' ? 'मिळणारे फायदे (Benefits)' : lang === 'en' ? 'Key Benefits' : 'मिलने वाले लाभ (Benefits)'}
              </h2>
            </div>
            <ul className="space-y-3">
              {benefitsList.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-[#1E1E1E] leading-relaxed">
                  <span className="text-[#1B5E20] font-bold mt-0.5 text-lg">✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Eligibility */}
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#E6D7C3] shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-[#FFF3E0] text-saffron">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1E1E]">
                {lang === 'mr' ? 'पात्रता (Eligibility)' : lang === 'en' ? 'Who is Eligible?' : 'पात्रता (कौन आवेदन कर सकता है)'}
              </h2>
            </div>
            <ul className="space-y-3">
              {eligibilityList.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-base text-[#1E1E1E] leading-relaxed">
                  <span className="text-saffron font-bold mt-0.5 text-lg">✔</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Documents */}
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#E6D7C3] shadow-2xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-[#FFF3E0] text-amber-800">
                <FileText className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1E1E]">
                {lang === 'mr' ? 'आवश्यक कागदपत्रे (Documents)' : lang === 'en' ? 'Required Documents' : 'जरूरी दस्तावेज (Documents)'}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {documentsList.map((d, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#FFF3E0] text-amber-950 border border-[#FFE0B2] rounded-xl text-sm sm:text-base font-bold"
                >
                  <FileText className="w-4 h-4 text-saffron shrink-0" />
                  <span>{d}</span>
                </span>
              ))}
            </div>
          </div>

          {/* How to Apply */}
          <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#E6D7C3] shadow-2xs">
            <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1E1E] mb-4">
              {lang === 'mr' ? 'अर्ज कसा करावा (How to Apply)' : lang === 'en' ? 'Step-by-Step Application' : 'आवेदन कैसे करें (How to Apply)'}
            </h2>
            <ol className="space-y-3.5">
              {howToApplyList.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-base text-[#1E1E1E] leading-relaxed">
                  <span className="w-7 h-7 min-w-[28px] rounded-full bg-saffron text-white text-sm font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Official Link Button */}
        <div className="mt-8">
          <a
            href={scheme.officialLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-16 min-h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold text-lg shadow-md active:scale-[0.99] transition-all"
          >
            <span>
              {lang === 'mr'
                ? `अधिकृत सरकारी संकेतस्थळ उघडा (${scheme.officialLink.replace('https://', '')})`
                : lang === 'en'
                ? `Open Official Government Portal (${scheme.officialLink.replace('https://', '')})`
                : `आधिकारिक सरकारी वेबसाइट खोलें (${scheme.officialLink.replace('https://', '')})`}
            </span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
