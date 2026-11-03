'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function IntroSplash({
  forceOpen,
  onComplete,
}: {
  forceOpen?: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'icon' | 'lettering' | 'exit'>('icon');

  useEffect(() => {
    setPhase('icon');
    const t1 = setTimeout(() => setPhase('lettering'), 650);
    const t2 = setTimeout(() => setPhase('exit'), 2900);
    const t3 = setTimeout(() => {
      onComplete();
    }, 3450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [forceOpen, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-500 ${
        phase === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 38%, #FFF7ED 0%, #FAF3E8 45%, #F0E4D0 100%)',
        perspective: '1100px',
      }}
      role="dialog"
      aria-label="Sarkari Sahayak Portal Intro"
    >
      {/* Top Tricolor Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-2 tricolor-ribbon" />

      {/* Ambient Subtle Chakra Watermark in Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.05]">
        <svg viewBox="0 0 200 200" className="w-[520px] h-[520px] animate-spin-slow">
          <circle cx="100" cy="100" r="90" stroke="#1E3A8A" strokeWidth="4" fill="none" />
          <circle cx="100" cy="100" r="20" stroke="#1E3A8A" strokeWidth="3" fill="none" />
          {Array.from({ length: 24 }).map((_, idx) => {
            const angle = (idx * 15 * Math.PI) / 180;
            const x2 = 100 + 90 * Math.cos(angle);
            const y2 = 100 + 90 * Math.sin(angle);
            return (
              <line
                key={idx}
                x1="100"
                y1="100"
                x2={x2}
                y2={y2}
                stroke="#1E3A8A"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>

      {/* 3D Stage Container */}
      <div
        className="relative flex flex-col items-center px-6 text-center max-w-2xl w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* STEP 1: The Icon Comes First */}
        <div
          className="relative transition-all duration-700 ease-out"
          style={{
            transform:
              phase === 'icon'
                ? 'translate3d(0, 12px, 60px) scale(1.12)'
                : 'translate3d(0, 0px, 0px) scale(1)',
          }}
        >
          {/* Golden Aura Ring */}
          <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-tr from-[#FF9933]/40 via-[#F57C00]/25 to-[#138808]/40 blur-xl animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[30px] shadow-2xl border-4 border-white overflow-hidden bg-[#1E1E1E]">
            <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
              <rect width="64" height="64" rx="14" fill="#1E1E1E" />
              <path d="M0 10C0 4.47715 4.47715 0 10 0H54C59.5228 0 64 4.47715 64 10V11H0V10Z" fill="#FF9933" />
              <rect y="11" width="64" height="3.5" fill="#FFFFFF" />
              <rect y="14.5" width="64" height="3.5" fill="#138808" />
              <circle cx="32" cy="37" r="19" fill="#FFF8EE" stroke="#F57C00" strokeWidth="2.5" />
              <circle cx="32" cy="37" r="15.5" stroke="#1E3A8A" strokeWidth="1" strokeDasharray="2 2.2" />
              <rect x="28" y="25" width="8" height="14" rx="4" fill="#F57C00" />
              <path d="M23 32V34C23 38.9706 27.0294 43 32 43C36.9706 43 41 38.9706 41 34V32" stroke="#1B5E20" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M32 43V49M27 49H37" stroke="#1B5E20" strokeWidth="2.8" strokeLinecap="round" />
              <path d="M19 31V37" stroke="#FF9933" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M45 31V37" stroke="#FF9933" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* STEP 2: Lettering Emerges from the Back Towards the Front (3D Z-Axis Projection) */}
        <div
          className="mt-7 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            opacity: phase === 'icon' ? 0 : 1,
            transform:
              phase === 'icon'
                ? 'perspective(1000px) translate3d(0px, 42px, -680px) scale(0.22) rotateX(22deg)'
                : 'perspective(1000px) translate3d(0px, 0px, 40px) scale(1) rotateX(0deg)',
            filter: phase === 'icon' ? 'blur(10px)' : 'blur(0px)',
          }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF3E0] border border-[#F57C00]/40 text-[#E65100] text-xs sm:text-sm font-extrabold mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>राष्ट्रीय जन-कल्याण वॉयस पोर्टल • Sarvam AI Sovereign Stack</span>
          </div>

          <h1
            className="text-4xl sm:text-6xl font-black tracking-tight text-[#1E1E1E] leading-tight"
            style={{
              textShadow: '0 10px 30px rgba(245, 124, 0, 0.18)',
            }}
          >
            सरकारी सहायक
          </h1>

          <div className="mt-1.5 text-xl sm:text-3xl font-black tracking-[0.18em] uppercase bg-gradient-to-r from-[#E65100] via-[#1E3A8A] to-[#1B5E20] bg-clip-text text-transparent">
            SARKARI SAHAYAK
          </div>

          {/* Animated Tricolor Sweep Bar */}
          <div className="mx-auto mt-4 h-1.5 w-48 sm:w-64 rounded-full tricolor-ribbon shadow-xs" />

          <p className="mt-4 text-sm sm:text-base font-bold text-[#545454] max-w-lg mx-auto">
            बोलकर या टैप करके 26+ प्रमुख सरकारी योजनाओं में अपनी पात्रता, लाभ और दस्तावेज़ों की तुरंत जांच करें।
          </p>
        </div>

        {/* Skip / Enter Portal Button */}
        <button
          onClick={onComplete}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1E1E1E] hover:bg-saffron text-white font-extrabold text-sm shadow-lg transition-all active:scale-95"
        >
          <span>पोर्टल में प्रवेश करें (Enter Portal)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
