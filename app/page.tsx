'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import schemesData from '@/data/schemes.json';
import { audioBlobToWav } from '@/lib/audio';
import {
  Mic,
  MicOff,
  Volume2,
  Square,
  Play,
  RotateCcw,
  CheckCircle2,
  Gift,
  FileText,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Send,
  AlertCircle,
  HelpCircle,
  Radio,
} from 'lucide-react';

type Lang = 'hi' | 'mr' | 'en';
type MicState = 'idle' | 'recording' | 'thinking' | 'speaking';

interface AnswerCardData {
  schemeId: string | null;
  spokenText: string;
  card: {
    title: string;
    eligibility: string[];
    benefits: string[];
    documents: string[];
  };
  languageCode: string;
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get('demo') === '1';

  // App State
  const [lang, setLang] = useState<Lang>('hi');
  const [micState, setMicState] = useState<MicState>('idle');
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [answer, setAnswer] = useState<AnswerCardData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const [isDemoMode, setIsDemoMode] = useState<boolean>(isDemoParam);

  // References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (isDemoParam) setIsDemoMode(true);
  }, [isDemoParam]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (currentAudioRef.current) currentAudioRef.current.pause();
    };
  }, []);

  // Play audio safely with autoplay fallback
  const playAudio = (dataUrl: string) => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }
    const audio = new Audio(dataUrl);
    currentAudioRef.current = audio;

    audio.onplay = () => {
      setIsPlayingAudio(true);
      setMicState('speaking');
    };
    audio.onended = () => {
      setIsPlayingAudio(false);
      setMicState('idle');
    };
    audio.onerror = () => {
      setIsPlayingAudio(false);
      setMicState('idle');
    };

    audio.play().catch((err) => {
      console.warn('Autoplay prevented by browser policy:', err);
      setIsPlayingAudio(false);
      setMicState('idle');
    });
  };

  const toggleAudio = () => {
    if (!currentAudioRef.current && audioUrl) {
      playAudio(audioUrl);
      return;
    }
    if (currentAudioRef.current) {
      if (isPlayingAudio) {
        currentAudioRef.current.pause();
        setIsPlayingAudio(false);
        setMicState('idle');
      } else {
        currentAudioRef.current
          .play()
          .then(() => {
            setIsPlayingAudio(true);
            setMicState('speaking');
          })
          .catch(console.error);
      }
    }
  };

  // Start Audio Recording
  const startRecording = async (e: React.PointerEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Stop existing audio if playing
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsPlayingAudio(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      recordStartTimeRef.current = Date.now();
      setMicState('recording');
      setRecordTimer(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg('माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया नीचे लिखकर पूछें।');
      setShowTextInput(true);
      setMicState('idle');
    }
  };

  // Stop Audio Recording & Process Voice Loop
  const stopRecording = async (e: React.PointerEvent) => {
    e.preventDefault();
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const duration = Date.now() - recordStartTimeRef.current;
    if (duration < 600) {
      // Too short; ignore
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      setMicState('idle');
      return;
    }

    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return;
    }

    setMicState('thinking');

    mediaRecorderRef.current.onstop = async () => {
      try {
        const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());

        // Convert to 16kHz mono WAV for high accuracy with Sarvam Saaras
        let wavBlob: Blob;
        try {
          wavBlob = await audioBlobToWav(rawBlob);
        } catch (wavErr) {
          console.warn('WAV conversion fallback to raw blob:', wavErr);
          wavBlob = rawBlob;
        }

        // 1. Call STT Route
        const formData = new FormData();
        formData.append('file', wavBlob, 'audio.wav');
        const langHint = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
        formData.append('language_hint', langHint);

        const sttRes = await fetch('/api/stt', {
          method: 'POST',
          body: formData,
        });

        if (!sttRes.ok) {
          throw new Error('आवाज पहचानी नहीं जा सकी (Speech not recognized)');
        }

        const sttData = await sttRes.json();
        const userText = sttData.transcript?.trim();

        if (!userText) {
          throw new Error('कोई आवाज सुनाई नहीं दी। कृपया फिर से बोलें।');
        }

        setTranscript(userText);
        await handleProcessQuery(userText, sttData.languageCode || langHint);
      } catch (err: any) {
        console.error('Voice loop error:', err);
        setErrorMsg(err.message || 'त्रुटि हुई। कृपया दोबारा प्रयास करें या लिखकर पूछें।');
        setMicState('idle');
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Process text through LLM (/api/chat) and TTS (/api/tts)
  const handleProcessQuery = async (queryText: string, langCode: string) => {
    setMicState('thinking');
    setErrorMsg(null);

    try {
      // 1. Call Chat Route
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: queryText,
          languageCode: langCode,
          isDemo: isDemoMode,
        }),
      });

      if (!chatRes.ok) {
        throw new Error('जवाब प्राप्त करने में समस्या हुई।');
      }

      const chatData: AnswerCardData = await chatRes.json();
      setAnswer(chatData);

      // 2. Call TTS Route
      if (chatData.spokenText) {
        try {
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: chatData.spokenText,
              languageCode: chatData.languageCode || langCode,
            }),
          });

          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            if (ttsData.dataUrl) {
              setAudioUrl(ttsData.dataUrl);
              playAudio(ttsData.dataUrl);
              return;
            }
          } else {
            console.warn('TTS call returned non-200');
          }
        } catch (ttsErr) {
          console.warn('TTS playback error, continuing in text mode:', ttsErr);
        }
      }

      // If TTS fails or text-only, finish thinking state
      setMicState('idle');
    } catch (err: any) {
      console.error('Query processing error:', err);
      setErrorMsg(err.message || 'त्रुटि हुई।');
      setMicState('idle');
    }
  };

  // Handle Suggested Query Click
  const handleChipClick = async (query: string) => {
    setTranscript(query);
    const langHint = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    await handleProcessQuery(query, langHint);
  };

  // Handle Typed Input Submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    const query = typedText.trim();
    setTypedText('');
    setShowTextInput(false);
    setTranscript(query);
    const langHint = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    await handleProcessQuery(query, langHint);
  };

  // Handle tapping a scheme card directly
  const handleSchemeClick = async (schemeId: string) => {
    const s = schemesData.find((item) => item.id === schemeId);
    if (!s) return;
    const promptText = `${s.name[lang]} yojana ke benefits aur eligibility kya hai?`;
    setTranscript(promptText);
    const langHint = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    await handleProcessQuery(promptText, langHint);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-28 lg:pb-12">
      {/* Top Header */}
      <header className="bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EADCC9] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl p-1 bg-white rounded-xl shadow-xs border border-[#EADCC9]">
              🇮🇳
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                  Sarkari Sahayak
                </h1>
                <span className="text-saffron text-sm sm:text-base font-bold bg-[#FFF3E0] px-2.5 py-0.5 rounded-lg border border-saffron-100">
                  सरकारी सहायक
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ink-muted font-medium mt-0.5">
                Voice Assistant for Indian Welfare Schemes • Sarvam AI Powered
              </p>
            </div>
          </div>

          {/* Right Action Bar: USP badge & Language Picker */}
          <div className="flex items-center gap-3">
            {/* USP Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3E0] border border-saffron-100 text-saffron-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-saffron fill-saffron" />
              <span>Understands Hindi + English mixed 🎙️</span>
            </div>

            {/* Language Selector */}
            <div className="flex bg-white rounded-xl p-1 border border-[#EADCC9] shadow-xs">
              {(['hi', 'mr', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`min-h-[40px] px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    lang === l
                      ? 'bg-saffron text-white shadow-sm'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  {l === 'hi' ? 'हिंदी' : l === 'mr' ? 'मराठी' : 'English'}
                </button>
              ))}
            </div>

            {/* Demo indicator */}
            {isDemoMode && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ⚡ Demo
              </span>
            )}
          </div>
        </div>

        {/* Mobile-only USP banner */}
        <div className="sm:hidden px-4 pb-2.5 flex items-center justify-between border-t border-[#EADCC9]/50 pt-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron-700">
            <Sparkles className="w-3.5 h-3.5 text-saffron fill-saffron" />
            <span>Understands Hindi + English mixed 🎙️</span>
          </div>
          {isDemoMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Demo Active
            </span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex-1">
        {/* Error / Alert Toast */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm shadow-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold underline ml-2 hover:text-red-950"
            >
              हटाएं (Dismiss)
            </button>
          </div>
        )}

        {/* Responsive Grid Layout: Left Schemes & Prompts, Right Assistant Hub & Answers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column (Schemes & Suggestions) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-ink">
                  {lang === 'mr'
                    ? 'लोकप्रिय सरकारी योजना'
                    : lang === 'en'
                    ? 'Trending Government Schemes'
                    : 'लोकप्रिय सरकारी योजनाएं'}
                </h2>
                <p className="text-sm text-ink-muted mt-0.5">
                  योजना पर टैप करें या नीचे माइक से कोई भी प्रश्न पूछें
                </p>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-white rounded-lg border border-[#EADCC9] text-ink-muted">
                6 Verified Schemes
              </span>
            </div>

            {/* Scheme Cards Grid (2 columns on tablets/laptops, 1 column on small phones) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {schemesData.map((scheme) => (
                <div
                  key={scheme.id}
                  onClick={() => handleSchemeClick(scheme.id)}
                  className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-xs hover:shadow-md hover:border-saffron/70 active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-3xl p-2 bg-[#FFF3E0] rounded-xl flex-shrink-0 group-hover:scale-105 transition-transform">
                        {scheme.icon}
                      </span>
                      <span className="text-xs uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-civicGreen-50 text-civicGreen border border-civicGreen-100">
                        {scheme.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-ink leading-snug group-hover:text-saffron transition-colors">
                      {scheme.name[lang]}
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed mt-2 line-clamp-2">
                      {scheme.tagline[lang]}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#EADCC9]/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-civicGreen bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                      {scheme.benefits[0]?.split('(')[0] || 'सरकारी सहायता'}
                    </span>
                    <span className="text-xs font-bold text-saffron flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>विवरण व आवाज</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Voice Questions */}
            <div className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-5 h-5 text-saffron" />
                <h3 className="text-base font-bold text-ink">
                  सुझाए गए प्रश्न (Click any to speak/ask):
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'PM-Kisan ke benefits kya hain?',
                  'Ladki Bahin yojana ke liye documents kya chahiye?',
                  'Ayushman Bharat me kitna muft ilaj milta hai?',
                  'PM Ujjwala gas connection kaise milega?',
                ].map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(query)}
                    className="text-left p-3.5 rounded-xl bg-white border border-[#EADCC9] text-sm font-semibold text-ink shadow-2xs hover:border-saffron hover:bg-[#FFF3E0]/30 flex items-center justify-between active:scale-[0.99] transition-all"
                  >
                    <span className="line-clamp-2">🎙️ "{query}"</span>
                    <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Text Fallback Box */}
            {showTextInput && (
              <form
                onSubmit={handleTextSubmit}
                className="p-4 bg-white rounded-2xl border-2 border-saffron shadow-sm animate-in fade-in"
              >
                <label className="block text-sm font-bold text-ink mb-2">
                  लिखकर पूछें (Type your question):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="जैसे: लाडकी बहिन योजना के लाभ क्या हैं?"
                    className="flex-1 h-12 px-4 border border-[#EADCC9] rounded-xl text-base focus:outline-none focus:border-saffron"
                  />
                  <button
                    type="submit"
                    className="h-12 px-5 bg-saffron hover:bg-saffron-600 text-white rounded-xl font-bold flex items-center justify-center min-w-[56px] shadow-sm transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Column (Assistant Hub & Conversation / Results) */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            {/* If Answer Present: Show Structured Results Card */}
            {answer ? (
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border-[2px] border-saffron/40 shadow-lg animate-in fade-in duration-300">
                {/* User Query Box */}
                <div className="mb-4 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#EADCC9] flex items-start gap-2.5">
                  <span className="text-xl">👤</span>
                  <div>
                    <span className="text-xs font-bold text-ink-muted block uppercase tracking-wider">
                      आपने पूछा (You Asked):
                    </span>
                    <p className="text-base sm:text-lg font-bold text-ink mt-0.5">
                      "{transcript}"
                    </p>
                  </div>
                </div>

                {/* Spoken Answer Audio Card */}
                <div className="p-4 sm:p-5 bg-[#FFF3E0] rounded-2xl border border-[#FFE0B2] mb-5">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-bold text-saffron-700 flex items-center gap-1.5">
                      <Volume2 className="w-5 h-5 text-saffron" />
                      सहायक का उत्तर (Spoken Answer):
                    </span>

                    {/* Animated Waveform */}
                    {isPlayingAudio && (
                      <div className="flex items-center gap-1 h-5">
                        <span className="w-1 bg-saffron rounded-full wave-bar-1" />
                        <span className="w-1 bg-saffron rounded-full wave-bar-2" />
                        <span className="w-1 bg-saffron rounded-full wave-bar-3" />
                        <span className="w-1 bg-saffron rounded-full wave-bar-4" />
                      </div>
                    )}
                  </div>

                  <p className="text-base sm:text-lg text-ink font-medium leading-relaxed mb-4">
                    {answer.spokenText}
                  </p>

                  {/* Playback Controls */}
                  {audioUrl ? (
                    <button
                      onClick={toggleAudio}
                      className="h-12 min-h-[48px] px-5 rounded-xl bg-saffron hover:bg-saffron-600 text-white font-bold text-sm flex items-center gap-2.5 shadow-sm active:scale-95 transition-all"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Square className="w-4 h-4 fill-white" />
                          <span>रोकें (Pause Audio)</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>फिर से सुनें (Replay Audio)</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-ink-muted italic">
                      आवाज अनुपलब्ध (Audio unavailable)
                    </span>
                  )}
                </div>

                {/* Result Heading */}
                <h3 className="text-lg font-bold text-ink mb-3">{answer.card.title}</h3>

                {/* Structured Sections */}
                <div className="space-y-3">
                  {/* Eligibility */}
                  {answer.card.eligibility && answer.card.eligibility.length > 0 && (
                    <div className="p-4 bg-white rounded-xl border border-[#EADCC9]">
                      <div className="flex items-center gap-2 mb-2 text-saffron font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>पात्रता (Eligibility)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {answer.card.eligibility.map((item, i) => (
                          <li key={i} className="text-sm sm:text-base text-ink flex items-start gap-2">
                            <span className="text-saffron font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {answer.card.benefits && answer.card.benefits.length > 0 && (
                    <div className="p-4 bg-[#E8F5E9]/60 rounded-xl border border-civicGreen-100">
                      <div className="flex items-center gap-2 mb-2 text-civicGreen font-bold text-sm">
                        <Gift className="w-5 h-5" />
                        <span>मिलने वाले लाभ (Benefits)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {answer.card.benefits.map((item, i) => (
                          <li key={i} className="text-sm sm:text-base text-ink flex items-start gap-2">
                            <span className="text-civicGreen font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Documents */}
                  {answer.card.documents && answer.card.documents.length > 0 && (
                    <div className="p-4 bg-white rounded-xl border border-[#EADCC9]">
                      <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-sm">
                        <FileText className="w-5 h-5" />
                        <span>जरूरी दस्तावेज (Documents Needed)</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {answer.card.documents.map((doc, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-2.5 py-1 bg-[#FFF3E0] text-amber-900 rounded-lg border border-[#FFE0B2]"
                          >
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scheme Detail Link button */}
                {answer.schemeId && (
                  <div className="mt-5 pt-4 border-t border-[#EADCC9]">
                    <button
                      onClick={() => router.push(`/scheme/${answer.schemeId}`)}
                      className="w-full h-14 min-h-[56px] rounded-xl bg-civicGreen hover:bg-civicGreen-600 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
                    >
                      <span>पूरी जानकारी व आवेदन विधि</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Ask Another Question button */}
                <button
                  onClick={() => {
                    setAnswer(null);
                    setTranscript('');
                    if (currentAudioRef.current) currentAudioRef.current.pause();
                    setIsPlayingAudio(false);
                    setMicState('idle');
                  }}
                  className="mt-3 w-full py-2.5 text-sm font-bold text-saffron underline text-center hover:text-saffron-700"
                >
                  नया सवाल पूछें (Ask Another Question)
                </button>
              </div>
            ) : (
              /* Desktop Voice Assistant Hub (When no answer yet) */
              <div className="hidden lg:flex bg-[#FFFDF9] rounded-3xl p-6 border-[1.5px] border-[#EADCC9] shadow-sm flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] border border-saffron-100 flex items-center justify-center text-3xl mb-4">
                  🎙️
                </div>
                <h3 className="text-xl font-bold text-ink">बोलकर पूछें (Voice Assistant)</h3>
                <p className="text-sm text-ink-muted leading-relaxed mt-1 max-w-xs">
                  माइक बटन दबाकर रखें और अपनी भाषा में किसी भी योजना के बारे में पूछें।
                </p>

                {/* State Label */}
                <div className="my-5 min-h-[36px] flex items-center justify-center">
                  {micState === 'recording' && (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-bold animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                      रिकॉर्ड हो रहा है: {recordTimer}s (छोड़ें जवाब पाने के लिए)
                    </span>
                  )}
                  {micState === 'thinking' && (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
                      सुन रहा हूँ और सोच रहा हूँ...
                    </span>
                  )}
                  {micState === 'speaking' && (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                      🔊 जवाब बोल रहा हूँ...
                    </span>
                  )}
                  {micState === 'idle' && (
                    <span className="text-xs font-bold text-ink-muted">
                      नीचे बटन दबाकर रखें और बोलें (Hold to speak)
                    </span>
                  )}
                </div>

                {/* Main Microphone Button */}
                <div className="relative flex items-center justify-center my-2">
                  {micState === 'recording' && (
                    <div className="absolute w-28 h-28 rounded-full bg-red-400 opacity-50 animate-pulse-ring" />
                  )}

                  <button
                    onPointerDown={startRecording}
                    onPointerUp={stopRecording}
                    onPointerLeave={(e) => {
                      if (micState === 'recording') stopRecording(e);
                    }}
                    disabled={micState === 'thinking'}
                    className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all select-none touch-none ${
                      micState === 'recording'
                        ? 'bg-red-600 text-white ring-4 ring-red-200'
                        : micState === 'thinking'
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-saffron text-white hover:bg-saffron-600 shadow-saffron/40'
                    }`}
                    aria-label="Hold to speak"
                  >
                    <Mic className="w-11 h-11" />
                  </button>
                </div>

                <div className="mt-6 pt-4 border-t border-[#EADCC9]/60 w-full flex items-center justify-center gap-4 text-xs font-semibold text-ink-muted">
                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="underline hover:text-saffron py-1"
                  >
                    {showTextInput ? 'कीबोर्ड छिपाएं' : '⌨️ या लिखकर पूछें (Type)'}
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => setIsDemoMode(!isDemoMode)}
                    className="hover:text-ink py-1"
                  >
                    {isDemoMode ? '⚡ Demo Mode: ON' : '⚙️ Demo Mode'}
                  </button>
                </div>
              </div>
            )}

            {/* Helpline / Support Card */}
            <div className="hidden lg:flex bg-[#FAF8F5] rounded-2xl p-4 border border-[#EADCC9] items-center gap-3">
              <span className="text-2xl">📞</span>
              <div className="text-xs text-ink-muted">
                <p className="font-bold text-ink">नागरिक सहायता हेल्पलाइन: 1950</p>
                <p>सभी योजनाओं की जानकारी पूर्णतः निःशुल्क और आधिकारिक है।</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Voice Navigation Bar (Mobile Viewport: < lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/98 to-transparent pt-4 pb-6 px-4 z-40 flex flex-col items-center">
        {/* State Label */}
        <div className="mb-2 text-center">
          {micState === 'recording' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              रिकॉर्ड हो रहा है: {recordTimer}s (छोड़ें समाप्त करने के लिए)
            </span>
          )}
          {micState === 'thinking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
              सुन रहा हूँ और सोच रहा हूँ...
            </span>
          )}
          {micState === 'speaking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold">
              🔊 जवाब बोल रहा हूँ...
            </span>
          )}
          {micState === 'idle' && (
            <span className="text-[11px] font-bold text-ink-muted">
              दबाकर रखें और बोलें (Hold to speak)
            </span>
          )}
        </div>

        {/* Main Microphone Button */}
        <div className="relative flex items-center justify-center">
          {micState === 'recording' && (
            <div className="absolute w-22 h-22 rounded-full bg-red-400 opacity-60 animate-pulse-ring" />
          )}

          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={(e) => {
              if (micState === 'recording') stopRecording(e);
            }}
            disabled={micState === 'thinking'}
            className={`relative z-10 w-18 h-18 min-w-[70px] min-h-[70px] rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all select-none touch-none ${
              micState === 'recording'
                ? 'bg-red-600 text-white ring-4 ring-red-200'
                : micState === 'thinking'
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-saffron text-white hover:bg-saffron-600 shadow-saffron/40'
            }`}
            aria-label="Hold to speak"
          >
            <Mic className="w-9 h-9" />
          </button>
        </div>

        {/* Fallback & Demo toggles */}
        <div className="mt-2.5 flex items-center gap-4 text-xs font-semibold text-ink-muted">
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className="underline hover:text-saffron py-1"
          >
            {showTextInput ? 'कीबोर्ड छिपाएं' : '⌨️ या लिखकर पूछें'}
          </button>
          <span>•</span>
          <button
            onClick={() => setIsDemoMode(!isDemoMode)}
            className="hover:text-ink py-1"
          >
            {isDemoMode ? '⚡ Demo: ON' : '⚙️ Demo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-ink-muted font-bold">
          लोड हो रहा है (Loading Sarkari Sahayak)...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
