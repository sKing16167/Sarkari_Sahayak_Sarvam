'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import schemesData from '@/data/schemes.json';
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
} from 'lucide-react';

export default function SchemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [lang, setLang] = useState<'hi' | 'mr' | 'en'>('hi');
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

  const benefitsList: string[] = scheme.benefitsI18n?.[lang] || scheme.benefits;
  const eligibilityList: string[] = scheme.eligibilityI18n?.[lang] || scheme.eligibility;
  const documentsList: string[] = scheme.documentsI18n?.[lang] || scheme.documents;
  const howToApplyList: string[] = scheme.howToApplyI18n?.[lang] || scheme.howToApply;
  const benefitBadge: string = scheme.benefitBadge?.[lang] || scheme.benefitBadge?.hi || benefitsList[0];

  const handlePlayTTS = async () => {
    if (isPlaying && audioInstance) {
      audioInstance.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const spokenSummary =
        lang === 'mr'
          ? `${scheme.name.mr}। ${scheme.tagline.mr}। मुख्य लाभ: ${benefitsList.slice(0, 2).join('। ')}। आवश्यक कागदपत्रे: ${documentsList.slice(0, 3).join(', ')}।`
          : lang === 'en'
          ? `${scheme.name.en}. ${scheme.tagline.en}. Key benefits: ${benefitsList.slice(0, 2).join('. ')}. Required documents: ${documentsList.slice(0, 3).join(', ')}.`
          : `${scheme.name.hi}। ${scheme.tagline.hi}। मुख्य लाभ: ${benefitsList.slice(0, 2).join('। ')}। जरूरी दस्तावेज: ${documentsList.slice(0, 3).join(', ')}।`;

      const langCode = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spokenSummary, languageCode: langCode }),
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
        <div className="flex items-center justify-between pb-4 border-b border-[#E6D7C3]">
          <button
            onClick={() => router.push('/')}
            className="min-h-[48px] px-4 flex items-center gap-2 rounded-2xl bg-white border border-[#E6D7C3] shadow-2xs text-[#1E1E1E] hover:border-saffron active:scale-95 transition-all text-sm font-bold"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5 text-saffron" />
            <span>{lang === 'mr' ? 'मागे जा (Back)' : lang === 'en' ? 'Back to All Schemes' : 'सभी योजनाओं पर वापस जाएं'}</span>
          </button>

          {/* Language switcher */}
          <div className="flex bg-white rounded-xl p-1 border border-[#E6D7C3] shadow-2xs">
            {(['hi', 'mr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                  lang === l ? 'bg-saffron text-white shadow-xs' : 'text-[#545454] hover:text-[#1E1E1E]'
                }`}
              >
                {l === 'hi' ? 'हिंदी' : l === 'mr' ? 'मराठी' : 'English'}
              </button>
            ))}
          </div>
        </div>

        {/* Scheme Hero Header */}
        <div className="mt-6 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border-2 border-[#E6D7C3] shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-4xl sm:text-5xl flex-shrink-0 shadow-2xs">
                {scheme.icon}
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
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] leading-tight">
                  {scheme.name[lang]}
                </h1>
                <p className="mt-2.5 text-base sm:text-lg text-[#545454] font-medium leading-relaxed">
                  {scheme.tagline[lang]}
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
                  className="inline-block px-3.5 py-2 bg-[#FFF3E0] text-amber-950 border border-[#FFE0B2] rounded-xl text-sm sm:text-base font-bold"
                >
                  📄 {d}
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
