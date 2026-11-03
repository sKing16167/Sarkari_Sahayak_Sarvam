'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import schemesData from '@/data/schemes.json';
import { ArrowLeft, Volume2, ExternalLink, CheckCircle2, Gift, FileText, ChevronRight, Loader2, Square } from 'lucide-react';

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
      <div className="p-6 text-center">
        <p className="text-lg text-ink-muted mb-4">योजना नहीं मिली (Scheme not found)</p>
        <button
          onClick={() => router.push('/')}
          className="h-14 px-6 bg-saffron text-white rounded-xl font-bold min-h-[56px]"
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
    <div className="min-h-screen pb-16 px-4 pt-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EADCC9]">
        <button
          onClick={() => router.push('/')}
          className="min-h-[56px] min-w-[56px] flex items-center justify-center rounded-xl bg-white border border-[#EADCC9] shadow-sm text-ink active:scale-95 transition-transform"
          aria-label="Back to home"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Language switcher */}
        <div className="flex bg-white rounded-xl p-1 border border-[#EADCC9] shadow-sm">
          {(['hi', 'mr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                lang === l ? 'bg-saffron text-white shadow-sm' : 'text-ink-muted'
              }`}
            >
              {l === 'hi' ? 'हिंदी' : l === 'mr' ? 'मराठी' : 'EN'}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Hero Header */}
      <div className="mt-4 bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-4xl p-2 bg-[#FFF3E0] rounded-xl">{scheme.icon}</span>
          <div className="flex-1">
            <span className="inline-block text-xs uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-civicGreen-50 text-civicGreen mb-1">
              {scheme.category}
            </span>
            <h1 className="text-xl font-bold leading-tight text-ink">{scheme.name[lang]}</h1>
          </div>
        </div>

        <p className="mt-3 text-[17px] text-ink-muted leading-relaxed font-medium bg-[#FAF8F5] p-3 rounded-xl border border-[#EADCC9]/60">
          {scheme.tagline[lang]}
        </p>

        {/* Listen Button */}
        <button
          onClick={handlePlayTTS}
          disabled={isLoadingAudio}
          className="mt-4 w-full h-14 min-h-[56px] flex items-center justify-center gap-3 rounded-xl bg-civicGreen text-white font-bold text-lg shadow-md active:scale-[0.98] transition-all"
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
              <span>सुनें (Listen Details) 🔊</span>
            </>
          )}
        </button>
      </div>

      {/* Key Sections */}
      <div className="mt-5 space-y-4">
        {/* Benefits */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-6 h-6 text-civicGreen" />
            <h2 className="text-lg font-bold text-ink">
              {lang === 'mr' ? 'मिळणारे फायदे (Benefits)' : lang === 'en' ? 'Benefits' : 'मिलने वाले लाभ (Benefits)'}
            </h2>
          </div>
          <ul className="space-y-2.5">
            {scheme.benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[17px] text-ink">
                <span className="text-civicGreen font-bold mt-0.5">✦</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Eligibility */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-6 h-6 text-saffron" />
            <h2 className="text-lg font-bold text-ink">
              {lang === 'mr' ? 'पात्रता (Who can apply)' : lang === 'en' ? 'Eligibility' : 'पात्रता (कौन आवेदन कर सकता है)'}
            </h2>
          </div>
          <ul className="space-y-2.5">
            {scheme.eligibility.map((e, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[17px] text-ink">
                <span className="text-saffron font-bold mt-0.5">✔</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Documents */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-6 h-6 text-amber-700" />
            <h2 className="text-lg font-bold text-ink">
              {lang === 'mr' ? 'आवश्यक कागदपत्रे (Documents)' : lang === 'en' ? 'Required Documents' : 'जरूरी दस्तावेज (Documents)'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {scheme.documents.map((d, i) => (
              <span
                key={i}
                className="inline-block px-3 py-2 bg-[#FFF3E0] text-amber-900 border border-[#FFE0B2] rounded-xl text-[16px] font-medium"
              >
                📄 {d}
              </span>
            ))}
          </div>
        </div>

        {/* How to Apply */}
        <div className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-sm">
          <h2 className="text-lg font-bold text-ink mb-3">
            {lang === 'mr' ? 'अर्ज कसा करावा (How to Apply)' : lang === 'en' ? 'How to Apply' : 'आवेदन कैसे करें (How to Apply)'}
          </h2>
          <ol className="space-y-3">
            {scheme.howToApply.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[17px] text-ink">
                <span className="w-7 h-7 min-w-[28px] rounded-full bg-saffron text-white text-sm font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Official Link Button */}
        <a
          href={scheme.officialLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-14 min-h-[56px] flex items-center justify-center gap-3 rounded-2xl bg-[#1E1E1E] text-white font-bold text-lg shadow-md active:scale-[0.98] transition-all"
        >
          <span>आधिकारिक पोर्टल खोलें (Official Portal)</span>
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
