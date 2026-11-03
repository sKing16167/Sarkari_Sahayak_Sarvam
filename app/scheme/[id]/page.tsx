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
  ChevronRight,
  Loader2,
  Square,
  Sparkles,
} from 'lucide-react';

export default function SchemeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [lang, setLang] = useState<'hi' | 'mr' | 'en'>('hi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioInstance, setAudioInstance] = useState<HTMLAudioElement | null>(null);

  const scheme = schemesData.find((s) => s.id === id);

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
        <p className="text-xl text-ink-muted mb-6">योजना नहीं मिली (Scheme not found)</p>
        <button
          onClick={() => router.push('/')}
          className="h-14 px-8 bg-saffron text-white rounded-xl font-bold min-h-[56px] shadow-sm hover:bg-saffron-600 transition-colors"
        >
          होम पर जाएं (Go Home)
        </button>
      </div>
    );
  }

  const handlePlayTTS = async () => {
    if (isPlaying && audioInstance) {
      audioInstance.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      const spokenSummary = `${scheme.name[lang]}। ${scheme.tagline[lang]}। मुख्य लाभ: ${scheme.benefits.slice(0, 2).join('। ')}`;
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
    <div className="min-h-screen pb-20 pt-4 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#EADCC9]">
        <button
          onClick={() => router.push('/')}
          className="min-h-[48px] px-4 flex items-center gap-2 rounded-xl bg-white border border-[#EADCC9] shadow-xs text-ink hover:border-saffron active:scale-95 transition-all text-sm font-bold"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>होम पर वापस (Back)</span>
        </button>

        {/* Language switcher */}
        <div className="flex bg-white rounded-xl p-1 border border-[#EADCC9] shadow-xs">
          {(['hi', 'mr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                lang === l ? 'bg-saffron text-white shadow-xs' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {l === 'hi' ? 'हिंदी' : l === 'mr' ? 'मराठी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Hero Header */}
      <div className="mt-6 bg-[#FFFDF9] rounded-3xl p-6 sm:p-8 border-[1.5px] border-[#EADCC9] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-5xl p-3 bg-[#FFF3E0] rounded-2xl border border-saffron-100 flex-shrink-0">
              {scheme.icon}
            </span>
            <div>
              <span className="inline-block text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-civicGreen-50 text-civicGreen border border-civicGreen-100 mb-2">
                {scheme.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-ink leading-tight">
                {scheme.name[lang]}
              </h1>
              <p className="mt-2 text-base sm:text-lg text-ink-muted font-medium leading-relaxed">
                {scheme.tagline[lang]}
              </p>
            </div>
          </div>

          {/* Listen Button */}
          <div className="flex-shrink-0 sm:w-60">
            <button
              onClick={handlePlayTTS}
              disabled={isLoadingAudio}
              className="w-full h-14 min-h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-civicGreen hover:bg-civicGreen-600 text-white font-bold text-base shadow-sm active:scale-[0.98] transition-all"
            >
              {isLoadingAudio ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>आवाज तैयार हो रही है...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>रोकें (Pause Audio)</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-6 h-6" />
                  <span>सुनें (Listen) 🔊</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Key Sections: 2-column grid on tablets/laptops, 1-column on mobile */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Benefits */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#EADCC9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Gift className="w-6 h-6 text-civicGreen" />
              <h2 className="text-lg sm:text-xl font-bold text-ink">
                {lang === 'mr' ? 'मिळणारे फायदे (Benefits)' : lang === 'en' ? 'Benefits' : 'मिलने वाले लाभ (Benefits)'}
              </h2>
            </div>
            <ul className="space-y-3">
              {scheme.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-ink leading-relaxed">
                  <span className="text-civicGreen font-bold mt-1 text-lg">✦</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Eligibility */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#EADCC9] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <CheckCircle2 className="w-6 h-6 text-saffron" />
              <h2 className="text-lg sm:text-xl font-bold text-ink">
                {lang === 'mr' ? 'पात्रता (Who can apply)' : lang === 'en' ? 'Eligibility' : 'पात्रता (कौन आवेदन कर सकता है)'}
              </h2>
            </div>
            <ul className="space-y-3">
              {scheme.eligibility.map((e, i) => (
                <li key={i} className="flex items-start gap-3 text-base sm:text-lg text-ink leading-relaxed">
                  <span className="text-saffron font-bold mt-1 text-lg">✔</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#EADCC9] shadow-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <FileText className="w-6 h-6 text-amber-700" />
            <h2 className="text-lg sm:text-xl font-bold text-ink">
              {lang === 'mr' ? 'आवश्यक कागदपत्रे (Documents)' : lang === 'en' ? 'Required Documents' : 'जरूरी दस्तावेज (Documents)'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {scheme.documents.map((d, i) => (
              <span
                key={i}
                className="inline-block px-3.5 py-2 bg-[#FFF3E0] text-amber-950 border border-[#FFE0B2] rounded-xl text-sm sm:text-base font-semibold"
              >
                📄 {d}
              </span>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#EADCC9] shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-ink mb-4">
            {lang === 'mr' ? 'अर्ज कसा करावा (How to Apply)' : lang === 'en' ? 'How to Apply' : 'आवेदन कैसे करें (How to Apply)'}
          </h2>
          <ol className="space-y-3.5">
            {scheme.howToApply.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-base sm:text-lg text-ink leading-relaxed">
                <span className="w-7 h-7 min-w-[28px] rounded-full bg-saffron text-white text-sm font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Official Link Button (Wide CTA) */}
      <div className="mt-8">
        <a
          href={scheme.officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-16 min-h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-[#1E1E1E] hover:bg-black text-white font-bold text-lg shadow-md active:scale-[0.99] transition-all"
        >
          <span>आधिकारिक पोर्टल खोलें ({scheme.officialLink.replace('https://', '')})</span>
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
