'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/router';
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
        currentAudioRef.current.play().then(() => {
          setIsPlayingAudio(true);
          setMicState('speaking');
        }).catch(console.error);
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
    <div className="flex-1 flex flex-col justify-between pb-32">
      {/* Top Header */}
      <header className="p-4 bg-[#FAF8F5] border-b border-[#EADCC9] sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🇮🇳</span>
            <div>
              <h1 className="text-xl font-bold text-ink leading-tight">
                Sarkari Sahayak <span className="text-saffron text-sm font-semibold">सरकारी सहायक</span>
              </h1>
              <p className="text-xs text-ink-muted">Voice Assistant for Citizens</p>
            </div>
          </div>

          {/* Language Picker */}
          <div className="flex bg-white rounded-xl p-1 border border-[#EADCC9] shadow-sm">
            {(['hi', 'mr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`min-h-[44px] min-w-[48px] px-2.5 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  lang === l
                    ? 'bg-saffron text-white shadow-sm scale-100'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {l === 'hi' ? 'हिंदी' : l === 'mr' ? 'मराठी' : 'EN'}
              </button>
            ))}
          </div>
        </div>

        {/* USP Badge */}
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3E0] border border-saffron-100 text-saffron-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-4 h-4 text-saffron fill-saffron" />
            <span>Understands Hindi + English mixed 🎙️</span>
          </div>

          {/* Offline Demo Indicator */}
          {isDemoMode && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              ⚡ Demo Mode
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="px-4 py-4 flex-1">
        {/* Error / Alert Toast */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold underline ml-2"
            >
              हटाएं
            </button>
          </div>
        )}

        {/* Conversation / Answer Card (Slide-up view if answer present) */}
        {answer ? (
          <div className="bg-[#FFFDF9] rounded-2xl p-5 border-[1.5px] border-[#EADCC9] shadow-md mb-6 animate-in fade-in duration-300">
            {/* User Query Bubble */}
            <div className="mb-4 p-3 bg-[#FAF8F5] rounded-xl border border-[#EADCC9]/70 flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-ink-muted block mb-0.5">
                  आपने पूछा (You Asked):
                </span>
                <p className="text-[17px] font-semibold text-ink">"{transcript}"</p>
              </div>
            </div>

            {/* Spoken Text Audio Player Card */}
            <div className="p-4 bg-[#FFF3E0] rounded-xl border border-[#FFE0B2] mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-saffron-700 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4" /> सहायक का उत्तर (Spoken Answer):
                </span>

                {/* Animated Waveform when speaking */}
                {isPlayingAudio && (
                  <div className="flex items-center gap-1 h-5">
                    <span className="w-1 bg-saffron rounded-full wave-bar-1" />
                    <span className="w-1 bg-saffron rounded-full wave-bar-2" />
                    <span className="w-1 bg-saffron rounded-full wave-bar-3" />
                    <span className="w-1 bg-saffron rounded-full wave-bar-4" />
                  </div>
                )}
              </div>

              <p className="text-[17px] text-ink font-medium leading-relaxed mb-3">
                {answer.spokenText}
              </p>

              {/* Play / Replay Audio Button */}
              {audioUrl ? (
                <button
                  onClick={toggleAudio}
                  className="h-12 min-h-[48px] px-4 rounded-xl bg-saffron text-white font-bold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  {isPlayingAudio ? (
                    <>
                      <Square className="w-4 h-4 fill-white" />
                      <span>रोकें (Pause)</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>फिर से सुनें (Replay Audio)</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="text-xs text-ink-muted italic">आवाज अनुपलब्ध (Audio unavailable)</span>
              )}
            </div>

            {/* Answer Sections */}
            <h2 className="text-lg font-bold text-ink mb-3">{answer.card.title}</h2>

            <div className="space-y-3.5">
              {/* Eligibility */}
              {answer.card.eligibility && answer.card.eligibility.length > 0 && (
                <div className="p-3.5 bg-white rounded-xl border border-[#EADCC9]">
                  <div className="flex items-center gap-2 mb-2 text-saffron font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>पात्रता (Eligibility)</span>
                  </div>
                  <ul className="space-y-1.5">
                    {answer.card.eligibility.map((item, i) => (
                      <li key={i} className="text-[16px] text-ink flex items-start gap-2">
                        <span className="text-saffron font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits */}
              {answer.card.benefits && answer.card.benefits.length > 0 && (
                <div className="p-3.5 bg-[#E8F5E9]/50 rounded-xl border border-civicGreen-100">
                  <div className="flex items-center gap-2 mb-2 text-civicGreen font-bold text-sm">
                    <Gift className="w-5 h-5" />
                    <span>लाभ (Benefits)</span>
                  </div>
                  <ul className="space-y-1.5">
                    {answer.card.benefits.map((item, i) => (
                      <li key={i} className="text-[16px] text-ink flex items-start gap-2">
                        <span className="text-civicGreen font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {answer.card.documents && answer.card.documents.length > 0 && (
                <div className="p-3.5 bg-white rounded-xl border border-[#EADCC9]">
                  <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-sm">
                    <FileText className="w-5 h-5" />
                    <span>जरूरी दस्तावेज (Documents Needed)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {answer.card.documents.map((doc, i) => (
                      <span
                        key={i}
                        className="text-xs font-semibold px-2.5 py-1 bg-[#FFF3E0] text-amber-900 rounded-lg border border-[#FFE0B2]"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scheme Detail Link if matched */}
            {answer.schemeId && (
              <div className="mt-4 pt-3 border-t border-[#EADCC9] flex gap-2">
                <button
                  onClick={() => router.push(`/scheme/${answer.schemeId}`)}
                  className="flex-1 h-14 min-h-[56px] rounded-xl bg-civicGreen text-white font-bold text-[16px] flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span>पूरी जानकारी व आवेदन विधि</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Ask another question button */}
            <button
              onClick={() => {
                setAnswer(null);
                setTranscript('');
                if (currentAudioRef.current) currentAudioRef.current.pause();
                setIsPlayingAudio(false);
              }}
              className="mt-3 w-full h-12 text-sm font-bold text-saffron underline text-center"
            >
              नया सवाल पूछें (Ask Another Question)
            </button>
          </div>
        ) : null}

        {/* Trending Schemes Feed */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-ink">
              {lang === 'mr'
                ? 'लोकप्रिय सरकारी योजना (Trending Schemes)'
                : lang === 'en'
                ? 'Trending Government Schemes'
                : 'लोकप्रिय सरकारी योजनाएं (Trending Schemes)'}
            </h2>
            <span className="text-xs text-ink-muted">टैप करके सुनें</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {schemesData.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => handleSchemeClick(scheme.id)}
                className="bg-[#FFFDF9] rounded-2xl p-4 border-[1.5px] border-[#EADCC9] shadow-sm active:scale-[0.98] transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-saffron"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-[#FFF3E0] rounded-xl flex-shrink-0">
                    {scheme.icon}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-bold text-ink leading-snug">
                      {scheme.name[lang]}
                    </h3>
                    <p className="text-xs text-ink-muted line-clamp-1 mt-0.5">
                      {scheme.tagline[lang]}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-civicGreen-50 text-civicGreen">
                      {scheme.benefits[0]?.split('(')[0] || 'सरकारी सहायता'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center min-w-[48px] h-12 rounded-xl bg-[#FAF8F5] border border-[#EADCC9] text-saffron">
                  <Volume2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold">सुनें</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Suggested Voice Queries */}
        <section className="mb-4">
          <p className="text-xs font-bold text-ink-muted mb-2 uppercase tracking-wide">
            सुझाए गए प्रश्न (Tap to Ask):
          </p>
          <div className="flex flex-col gap-2">
            {[
              'PM-Kisan ke benefits kya hain?',
              'Ladki Bahin yojana ke liye documents kya chahiye?',
              'Ayushman Bharat me kitna muft ilaj milta hai?',
            ].map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(query)}
                className="text-left p-3 rounded-xl bg-white border border-[#EADCC9] text-[15px] font-semibold text-ink shadow-xs hover:border-saffron flex items-center justify-between active:scale-[0.99] transition-all"
              >
                <span>🎙️ "{query}"</span>
                <ChevronRight className="w-4 h-4 text-ink-muted flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Text Input Fallback Box */}
        {showTextInput && (
          <form onSubmit={handleTextSubmit} className="mt-3 p-3 bg-white rounded-2xl border border-saffron shadow-sm">
            <label className="block text-xs font-bold text-ink mb-1.5">
              लिखकर पूछें (Type your question):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                placeholder="योजना का नाम या सवाल लिखें..."
                className="flex-1 h-12 px-3 border border-[#EADCC9] rounded-xl text-[16px] focus:outline-none focus:border-saffron"
              />
              <button
                type="submit"
                className="h-12 px-4 bg-saffron text-white rounded-xl font-bold flex items-center justify-center min-w-[56px]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* Footer info note */}
        <p className="text-center text-[12px] text-ink-muted mt-6 px-4">
          Information from official government sources. Always confirm details at the official portal.
        </p>
      </main>

      {/* Floating Bottom Voice Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/95 to-transparent pt-6 pb-6 px-6 z-30 flex flex-col items-center">
        {/* State Label */}
        <div className="mb-2 text-center">
          {micState === 'recording' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              रिकॉर्ड हो रहा है: {recordTimer}s (छोड़ें समाप्त करने के लिए)
            </span>
          )}
          {micState === 'thinking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" />
              सुन रहा हूँ और सोच रहा हूँ...
            </span>
          )}
          {micState === 'speaking' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
              🔊 जवाब बोल रहा हूँ...
            </span>
          )}
          {micState === 'idle' && (
            <span className="text-xs font-bold text-ink-muted">
              दबाकर रखें और बोलें (Hold to speak)
            </span>
          )}
        </div>

        {/* Main Microphone Button */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing ring during recording */}
          {micState === 'recording' && (
            <div className="absolute w-24 h-24 rounded-full bg-red-400 opacity-60 animate-pulse-ring" />
          )}

          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={(e) => {
              if (micState === 'recording') stopRecording(e);
            }}
            disabled={micState === 'thinking'}
            className={`relative z-10 w-20 h-20 min-w-[72px] min-h-[72px] rounded-full flex flex-col items-center justify-center shadow-xl active:scale-95 transition-all select-none touch-none ${
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

        {/* Secondary fallback toggles */}
        <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-ink-muted">
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
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-muted font-bold">लोड हो रहा है...</div>}>
      <HomeContent />
    </Suspense>
  );
}
