'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import schemesData from '@/data/schemes.json';
import { audioBlobToWav } from '@/lib/audio';
import {
  Mic,
  Volume2,
  Square,
  RotateCcw,
  CheckCircle2,
  Gift,
  FileText,
  ChevronRight,
  Sparkles,
  Send,
  AlertCircle,
  Radio,
  Search,
  PhoneCall,
  BookOpen,
  X,
} from 'lucide-react';

type Lang = 'hi' | 'mr' | 'en';
type MicState = 'idle' | 'recording' | 'thinking' | 'speaking';
type CategoryFilter = 'all' | 'farmer' | 'women' | 'health' | 'housing' | 'livelihood' | 'education';

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

const CATEGORY_META: Record<
  CategoryFilter,
  { icon: string; hi: string; mr: string; en: string; badgeBg: string; badgeText: string }
> = {
  all: {
    icon: '🌟',
    hi: 'सभी योजनाएं',
    mr: 'सर्व योजना',
    en: 'All Schemes',
    badgeBg: 'bg-[#FFF3E0] border-[#FFE0B2]',
    badgeText: 'text-[#E65100]',
  },
  farmer: {
    icon: '🌾',
    hi: 'किसान व कृषि',
    mr: 'शेतकरी व कृषी',
    en: 'Farmers',
    badgeBg: 'bg-[#E8F5E9] border-[#C8E6C9]',
    badgeText: 'text-[#1B5E20]',
  },
  women: {
    icon: '🌸',
    hi: 'महिला कल्याण',
    mr: 'महिला कल्याण',
    en: 'Women Welfare',
    badgeBg: 'bg-pink-50 border-pink-200',
    badgeText: 'text-pink-800',
  },
  health: {
    icon: '🏥',
    hi: 'स्वास्थ्य व बीमा',
    mr: 'आरोग्य व विमा',
    en: 'Health & Cover',
    badgeBg: 'bg-sky-50 border-sky-200',
    badgeText: 'text-sky-800',
  },
  housing: {
    icon: '🏠',
    hi: 'आवास व बिजली',
    mr: 'घरकुल व वीज',
    en: 'Housing & Solar',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-900',
  },
  livelihood: {
    icon: '🛠️',
    hi: 'कारीगर व रोजगार',
    mr: 'कारागीर व रोजगार',
    en: 'Work & Pension',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-900',
  },
  education: {
    icon: '🎓',
    hi: 'शिक्षा व बेटियां',
    mr: 'शिक्षण व मुली',
    en: 'Education & Child',
    badgeBg: 'bg-indigo-50 border-indigo-200',
    badgeText: 'text-indigo-900',
  },
};

function SarkariEmblem() {
  return (
    <svg
      className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 drop-shadow-xs"
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sarkari Sahayak Emblem"
    >
      <rect x="6" y="6" width="116" height="116" rx="28" fill="#FFFDF9" stroke="#E6D7C3" strokeWidth="4" />
      <path
        d="M16 34C16 24.0589 24.0589 16 34 16H94C103.941 16 112 24.0589 112 34V42C82 34 46 34 16 42V34Z"
        fill="#F57C00"
      />
      <path
        d="M16 86C46 94 82 94 112 86V94C112 103.941 103.941 112 94 112H34C24.0589 112 16 103.941 16 94V86Z"
        fill="#1B5E20"
      />
      <circle cx="64" cy="64" r="27" stroke="#1A237E" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.4" />
      <circle cx="64" cy="64" r="21" fill="#F57C00" />
      <rect x="58" y="50" width="12" height="18" rx="6" fill="#FFFFFF" />
      <path
        d="M52 61C52 67.6274 57.3726 73 64 73C70.6274 73 76 67.6274 76 61"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path d="M64 73V79M58 79H70" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M30 58V70" stroke="#F57C00" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 61V67" stroke="#1B5E20" strokeWidth="4" strokeLinecap="round" />
      <path d="M98 58V70" stroke="#F57C00" strokeWidth="4" strokeLinecap="round" />
      <path d="M106 61V67" stroke="#1B5E20" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get('demo') === '1';

  // App State
  const [lang, setLang] = useState<Lang>('hi');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [micState, setMicState] = useState<MicState>('idle');
  const [recordTimer, setRecordTimer] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [answer, setAnswer] = useState<AnswerCardData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [activeSpeakingSchemeId, setActiveSpeakingSchemeId] = useState<string | null>(null);
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
  const answerPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isDemoParam) setIsDemoMode(true);
  }, [isDemoParam]);

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
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
    };
    audio.onerror = () => {
      setIsPlayingAudio(false);
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
    };

    audio.play().catch((err) => {
      console.warn('Autoplay prevented by browser policy:', err);
      setIsPlayingAudio(false);
      setActiveSpeakingSchemeId(null);
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
        setActiveSpeakingSchemeId(null);
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

  // Speak a welcome guide for low-literacy users
  const playWelcomeGuide = async () => {
    const welcomeTexts: Record<Lang, string> = {
      hi: 'नमस्ते! सरकारी सहायक में आपका स्वागत है। किसी भी सरकारी योजना पर सुनें बटन दबाएं, या नारंगी माइक बटन दबाकर अपनी भाषा में सवाल पूछें।',
      mr: 'नमस्कार! सरकारी सहाय्यक मध्ये आपले स्वागत आहे. कोणत्याही योजनेची माहिती ऐकण्यासाठी ऐका बटण दाबा, किंवा केशरी माईक बटण दाबून आपला प्रश्न विचारा.',
      en: 'Welcome to Sarkari Sahayak! Tap Listen on any government scheme card, or hold the orange microphone button to ask a question in your language.',
    };
    const langCode = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';

    try {
      setMicState('thinking');
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: welcomeTexts[lang], languageCode: langCode }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.dataUrl) {
          setAudioUrl(data.dataUrl);
          playAudio(data.dataUrl);
          return;
        }
      }
      setMicState('idle');
    } catch {
      setMicState('idle');
    }
  };

  // Start Audio Recording
  const startRecording = async (e: React.PointerEvent) => {
    e.preventDefault();
    setErrorMsg(null);

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
      setErrorMsg('माइक्रोफ़ोन की अनुमति नहीं मिली। कृपया नीचे लिखकर पूछें या योजना पर टैप करें।');
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

        let wavBlob: Blob;
        try {
          wavBlob = await audioBlobToWav(rawBlob);
        } catch (wavErr) {
          console.warn('WAV conversion fallback to raw blob:', wavErr);
          wavBlob = rawBlob;
        }

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
  const handleProcessQuery = async (queryText: string, langCode: string, schemeIdHint?: string) => {
    setMicState('thinking');
    setErrorMsg(null);
    if (schemeIdHint) setActiveSpeakingSchemeId(schemeIdHint);

    try {
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

      // Scroll answer card into view on mobile
      setTimeout(() => {
        if (window.innerWidth < 1024 && answerPanelRef.current) {
          answerPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

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
          }
        } catch (ttsErr) {
          console.warn('TTS playback error, continuing in text mode:', ttsErr);
        }
      }

      setActiveSpeakingSchemeId(null);
      setMicState('idle');
    } catch (err: any) {
      console.error('Query processing error:', err);
      setErrorMsg(err.message || 'त्रुटि हुई।');
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
    }
  };

  const handleChipClick = async (query: string) => {
    setTranscript(query);
    const langHint = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    await handleProcessQuery(query, langHint);
  };

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

  // Instant Listen & Show Card for any scheme (zero LLM delay for direct scheme listen!)
  const handleSchemeListen = async (schemeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const s = schemesData.find((item) => item.id === schemeId) as any;
    if (!s) return;

    // If already speaking this scheme, pause it
    if (activeSpeakingSchemeId === schemeId && isPlayingAudio && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsPlayingAudio(false);
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
      return;
    }

    const langCode = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    const eligList = s.eligibilityI18n?.[lang] || s.eligibility;
    const benList = s.benefitsI18n?.[lang] || s.benefits;
    const docList = s.documentsI18n?.[lang] || s.documents;

    const spokenSummary =
      lang === 'mr'
        ? `${s.name.mr}। ${s.tagline.mr}। मुख्य लाभ: ${benList[0]}। आवश्यक कागदपत्रे: ${docList.slice(0, 2).join(', ')}।`
        : lang === 'en'
        ? `${s.name.en}. ${s.tagline.en}. Key benefit: ${benList[0]}. Required documents: ${docList.slice(0, 2).join(', ')}.`
        : `${s.name.hi}। ${s.tagline.hi}। मुख्य लाभ: ${benList[0]}। जरूरी दस्तावेज: ${docList.slice(0, 2).join(', ')}।`;

    setTranscript(s.name[lang]);
    setAnswer({
      schemeId: s.id,
      spokenText: spokenSummary,
      card: {
        title: s.name[lang],
        eligibility: eligList,
        benefits: benList,
        documents: docList,
      },
      languageCode: langCode,
    });

    setActiveSpeakingSchemeId(schemeId);
    setMicState('thinking');

    setTimeout(() => {
      if (window.innerWidth < 1024 && answerPanelRef.current) {
        answerPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    try {
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spokenSummary, languageCode: langCode }),
      });
      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        if (ttsData.dataUrl) {
          setAudioUrl(ttsData.dataUrl);
          playAudio(ttsData.dataUrl);
          return;
        }
      }
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
    } catch {
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
    }
  };

  // Filtered schemes by category & search query
  const filteredSchemes = schemesData.filter((s: any) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    if (!matchesCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      s.name.en.toLowerCase().includes(q) ||
      s.name.hi.includes(q) ||
      s.name.mr.includes(q) ||
      s.tagline.en.toLowerCase().includes(q) ||
      s.tagline.hi.includes(q) ||
      s.tagline.mr.includes(q) ||
      s.keywords.some((k: string) => k.toLowerCase().includes(q))
    );
  });

  // Count schemes per category
  const getCategoryCount = (cat: CategoryFilter) => {
    if (cat === 'all') return schemesData.length;
    return schemesData.filter((s) => s.category === cat).length;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between pb-32 lg:pb-14">
      {/* Top Tricolor Civic Ribbon */}
      <div className="h-1.5 w-full tricolor-ribbon" />

      {/* Top Sticky Header */}
      <header className="bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E6D7C3] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Emblem & Title */}
          <div
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="flex items-center gap-3.5 cursor-pointer group"
          >
            <SarkariEmblem />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] tracking-tight group-hover:text-saffron transition-colors">
                  Sarkari Sahayak
                </h1>
                <span className="text-saffron-700 text-sm sm:text-base font-bold bg-[#FFF3E0] px-2.5 py-0.5 rounded-lg border border-[#FFE0B2]">
                  सरकारी सहायक
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#545454] font-medium mt-0.5">
                {lang === 'mr'
                  ? 'बोलून जाणा सरकारी योजना • नागरिक आवाज सहाय्यक'
                  : lang === 'en'
                  ? 'Speak to Discover Verified Government Welfare Schemes'
                  : 'बोलकर जानें सरकारी योजनाएं • नागरिक आवाज सहायक'}
              </p>
            </div>
          </div>

          {/* Right Controls: USP Badge + Audio Help + Language Switcher */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Welcome Audio Guide Button for Illiterate Users */}
            <button
              onClick={playWelcomeGuide}
              className="min-h-[42px] px-3.5 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[#1B5E20] text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
              title="सुनें कि यह वेबसाइट कैसे काम करती है"
            >
              <Volume2 className="w-4 h-4 flex-shrink-0" />
              <span>
                {lang === 'mr' ? 'कसे वापरावे? ऐका' : lang === 'en' ? 'Audio Guide' : 'कैसे चलाएं? सुनें'}
              </span>
            </button>

            {/* USP Badge */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-saffron fill-saffron" />
              <span>Understands Hindi + English mixed 🎙️</span>
            </div>

            {/* Language Selector */}
            <div className="flex bg-[#FAF7F2] rounded-xl p-1 border border-[#E6D7C3]">
              {(['hi', 'mr', 'en'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`min-h-[38px] px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                    lang === l
                      ? 'bg-saffron text-white shadow-xs'
                      : 'text-[#545454] hover:text-[#1E1E1E]'
                  }`}
                >
                  {l === 'hi' ? 'हिंदी' : l === 'mr' ? 'मराठी' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Error / Alert Toast */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 text-red-900 text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 font-semibold">{errorMsg}</div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-xs font-bold underline ml-2 hover:text-red-950"
            >
              हटाएं
            </button>
          </div>
        )}

        {/* Category Filter Pills (Visual + Tactile Icons for Easy Navigation) */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs sm:text-sm font-bold text-[#545454] uppercase tracking-wider">
              {lang === 'mr'
                ? 'श्रेणी निवडा (Choose Category):'
                : lang === 'en'
                ? 'Browse by Category:'
                : 'अपनी जरूरत की श्रेणी चुनें (Select Category):'}
            </span>
            <span className="text-xs font-bold text-civicGreen bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#C8E6C9]">
              ✓ {schemesData.length} आधिकारिक सरकारी योजनाएं (Official Schemes)
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {(Object.keys(CATEGORY_META) as CategoryFilter[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 whitespace-nowrap border-[1.5px] transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-saffron text-white border-saffron shadow-md'
                      : 'bg-white text-[#1E1E1E] border-[#E6D7C3] hover:border-saffron/60'
                  }`}
                >
                  <span className="text-xl">{meta.icon}</span>
                  <span>{meta[lang]}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-[#FAF7F2] text-[#545454]'
                    }`}
                  >
                    {getCategoryCount(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Main 12-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 7 Columns: Search + Schemes Grid + Suggested Voice Prompts */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {/* Search & Quick Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border-[1.5px] border-[#E6D7C3] shadow-2xs">
              <div className="relative flex-1 flex items-center">
                <Search className="w-5 h-5 text-[#545454] ml-3 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'mr'
                      ? 'योजना शोधा (उदा. किसान, लाडकी बहीण, घरकुल, सोलर, पेन्शन)...'
                      : lang === 'en'
                      ? 'Search schemes (e.g. Kisan, Ladki Bahin, Solar, Health, Loan)...'
                      : 'योजना खोजें (जैसे: किसान, लाडकी बहिन, आवास, सोलर, विश्वकर्मा, पेंशन)...'
                  }
                  className="w-full h-11 pr-8 text-base text-[#1E1E1E] placeholder:text-[#545454]/70 focus:outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="p-1.5 text-[#545454] hover:text-[#1E1E1E]"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowTextInput(!showTextInput)}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] font-bold text-sm flex items-center justify-center gap-1.5 border border-[#FFE0B2] transition-colors"
              >
                <span>⌨️ {lang === 'mr' ? 'प्रश्न टाईप करा' : lang === 'en' ? 'Ask by Typing' : 'सवाल लिखकर पूछें'}</span>
              </button>
            </div>

            {/* Typed Question Input Box (If toggled) */}
            {showTextInput && (
              <form
                onSubmit={handleTextSubmit}
                className="p-4 bg-[#FFFDF9] rounded-2xl border-2 border-saffron shadow-md"
              >
                <label className="block text-sm font-bold text-[#1E1E1E] mb-2">
                  {lang === 'mr'
                    ? 'तुमचा प्रश्न खाली लिहा (हिंदी / मराठी / English):'
                    : lang === 'en'
                    ? 'Type your question about any scheme:'
                    : 'अपना सवाल नीचे लिखें (हिंदी / मराठी / Hinglish):'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typedText}
                    onChange={(e) => setTypedText(e.target.value)}
                    placeholder="जैसे: पीएम विश्वकर्मा योजना में कितना लोन मिलता है?"
                    className="flex-1 h-12 px-4 border border-[#E6D7C3] rounded-xl text-base bg-white focus:outline-none focus:border-saffron"
                  />
                  <button
                    type="submit"
                    className="h-12 px-6 bg-saffron hover:bg-saffron-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
                  >
                    <span>पूछें</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}

            {/* Schemes Grid (Zero Text Overlap, High Contrast, Clear Actions) */}
            {filteredSchemes.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E6D7C3]">
                <p className="text-lg font-bold text-[#1E1E1E]">कोई योजना नहीं मिली (No matching scheme found)</p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-5 py-2.5 bg-saffron text-white rounded-xl font-bold text-sm"
                >
                  सभी योजनाएं दिखाएं (Show All {schemesData.length} Schemes)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredSchemes.map((scheme: any) => {
                  const catMeta =
                    CATEGORY_META[scheme.category as CategoryFilter] || CATEGORY_META.all;
                  const badgeText =
                    scheme.benefitBadge?.[lang] ||
                    scheme.benefitBadge?.hi ||
                    scheme.benefits[0];
                  const isCurrentlySpeakingThis =
                    activeSpeakingSchemeId === scheme.id && isPlayingAudio;

                  return (
                    <div
                      key={scheme.id}
                      onClick={() => router.push(`/scheme/${scheme.id}`)}
                      className="tactile-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        {/* Card Top Row: Large Icon + Category Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] flex items-center justify-center text-3xl shadow-2xs group-hover:scale-105 transition-transform">
                            {scheme.icon}
                          </div>

                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${catMeta.badgeBg} ${catMeta.badgeText}`}
                          >
                            {catMeta.icon} {catMeta[lang]}
                          </span>
                        </div>

                        {/* Benefit Highlight Pill (Dedicated Full-Width Row — Never Overlaps!) */}
                        <div className="mb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-sm font-extrabold">
                            <Gift className="w-4 h-4 flex-shrink-0" />
                            <span>{badgeText}</span>
                          </span>
                        </div>

                        {/* Scheme Title */}
                        <h3 className="text-xl font-extrabold text-[#1E1E1E] leading-snug group-hover:text-saffron transition-colors">
                          {scheme.name[lang]}
                        </h3>

                        {/* Scheme Tagline */}
                        <p className="text-[15px] text-[#545454] leading-relaxed mt-2">
                          {scheme.tagline[lang]}
                        </p>
                      </div>

                      {/* Card Bottom Action Bar: 2 Clear Touch-Friendly Buttons */}
                      <div className="mt-5 pt-4 border-t border-[#E6D7C3]/70 grid grid-cols-2 gap-2.5">
                        {/* Button 1: Speak / Listen Aloud */}
                        <button
                          type="button"
                          onClick={(e) => handleSchemeListen(scheme.id, e)}
                          className={`min-h-[46px] px-3 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            isCurrentlySpeakingThis
                              ? 'bg-red-600 text-white shadow-sm'
                              : 'bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] border border-[#FFE0B2]'
                          }`}
                        >
                          {isCurrentlySpeakingThis ? (
                            <>
                              <Square className="w-4 h-4 fill-current flex-shrink-0" />
                              <span>रोकें (Stop)</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4 flex-shrink-0" />
                              <span>
                                {lang === 'mr' ? 'ऐका 🔊' : lang === 'en' ? 'Listen 🔊' : 'सुनें 🔊'}
                              </span>
                            </>
                          )}
                        </button>

                        {/* Button 2: Full Details & How to Apply */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/scheme/${scheme.id}`);
                          }}
                          className="min-h-[46px] px-3 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95"
                        >
                          <BookOpen className="w-4 h-4 flex-shrink-0" />
                          <span>
                            {lang === 'mr' ? 'पूर्ण माहिती' : lang === 'en' ? 'Details' : 'पूरी जानकारी'}
                          </span>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggested Voice Questions Section */}
            <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-6 border-[1.5px] border-[#E6D7C3] shadow-xs">
              <div className="flex items-center gap-2 mb-3.5">
                <Radio className="w-5 h-5 text-saffron" />
                <h3 className="text-base sm:text-lg font-bold text-[#1E1E1E]">
                  {lang === 'mr'
                    ? 'असे प्रश्न विचारून पहा (टॅप करा):'
                    : lang === 'en'
                    ? 'Popular Voice Questions (Tap to Ask):'
                    : 'आवाज में पूछे जाने वाले प्रमुख सवाल (टैप करके पूछें):'}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'PM-Kisan ke liye documents kya lagte hain?',
                  'Ladki Bahin yojana ke benefits kya hain?',
                  'Ayushman Bharat me kitna muft ilaj milta hai?',
                  'PM Vishwakarma yojana me silai machine aur loan kaise milega?',
                  'PM Surya Ghar muft bijli yojana me kitni subsidy milti hai?',
                  'Atal Pension aur e-Shram card ke kya fayde hain?',
                ].map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleChipClick(query)}
                    className="text-left p-3.5 rounded-2xl bg-white border border-[#E6D7C3] text-sm font-semibold text-[#1E1E1E] hover:border-saffron hover:bg-[#FFF3E0]/40 flex items-center justify-between gap-2 active:scale-[0.99] transition-all"
                  >
                    <span>🎙️ "{query}"</span>
                    <ChevronRight className="w-4 h-4 text-saffron flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Sticky Voice Assistant Hub & Conversation Results */}
          <div
            ref={answerPanelRef}
            className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24"
          >
            {/* Voice Assistant Hub Card */}
            <div className="bg-[#FFFDF9] rounded-3xl p-6 border-2 border-[#E6D7C3] shadow-md flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                  🎙️ Sarvam Voice AI
                </span>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    isDemoMode
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-[#FAF7F2] text-[#545454] border-[#E6D7C3]'
                  }`}
                >
                  {isDemoMode ? '⚡ Offline Demo: ON' : '⚙️ Demo Mode'}
                </button>
              </div>

              <h3 className="text-xl font-extrabold text-[#1E1E1E]">
                {lang === 'mr'
                  ? 'बोलून प्रश्न विचारा'
                  : lang === 'en'
                  ? 'Hold Mic & Speak'
                  : 'बोलकर सवाल पूछें'}
              </h3>
              <p className="text-sm text-[#545454] mt-1 leading-relaxed">
                {lang === 'mr'
                  ? 'खालील केशरी माईक बटण दाबून ठेवा आणि मराठी, हिंदी किंवा इंग्रजीत बोला'
                  : lang === 'en'
                  ? 'Press & hold the saffron button below and speak in Hindi, Marathi, or Hinglish'
                  : 'नीचे नारंगी माइक बटन दबाकर रखें और हिंदी, मराठी या हिंग्लिश में अपना सवाल बोलें'}
              </p>

              {/* Dynamic Mic Status Pill */}
              <div className="my-4 min-h-[36px] flex items-center justify-center">
                {micState === 'recording' && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-800 text-sm font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    रिकॉर्ड हो रहा है: {recordTimer}s (छोड़ें जवाब पाने के लिए)
                  </span>
                )}
                {micState === 'thinking' && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-sm font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-bounce" />
                    सुन रहा हूँ और जवाब तैयार कर रहा हूँ...
                  </span>
                )}
                {micState === 'speaking' && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-sm font-bold">
                    🔊 सरकारी सहायक बोल रहा है...
                  </span>
                )}
                {micState === 'idle' && (
                  <span className="text-xs font-bold text-[#545454] bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#E6D7C3]">
                    👇 दबाकर रखें और बोलें (Hold to Speak)
                  </span>
                )}
              </div>

              {/* Hero Microphone Button */}
              <div className="relative flex items-center justify-center my-1">
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
            </div>

            {/* Answer & Spoken Audio Card (Renders when user asks or clicks Listen on a scheme) */}
            {answer && (
              <div className="bg-[#FFFDF9] rounded-3xl p-5 sm:p-6 border-2 border-saffron shadow-lg">
                {/* User Query Bubble */}
                <div className="mb-4 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E6D7C3] flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#545454] block uppercase tracking-wider">
                      आपका सवाल / चुनी गई योजना:
                    </span>
                    <p className="text-base sm:text-lg font-extrabold text-[#1E1E1E] mt-0.5">
                      "{transcript}"
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAnswer(null);
                      setTranscript('');
                      if (currentAudioRef.current) currentAudioRef.current.pause();
                      setIsPlayingAudio(false);
                      setActiveSpeakingSchemeId(null);
                      setMicState('idle');
                    }}
                    className="p-1.5 text-[#545454] hover:text-[#1E1E1E] rounded-lg"
                    title="बंद करें"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Spoken Audio Box */}
                <div className="p-4 bg-[#FFF3E0] rounded-2xl border border-[#FFE0B2] mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-[#E65100] flex items-center gap-1.5">
                      <Volume2 className="w-5 h-5 text-saffron" />
                      सहायक का जवाब (Spoken Reply):
                    </span>

                    {isPlayingAudio && (
                      <div className="flex items-center gap-1 h-5">
                        <span className="w-1 bg-saffron rounded-full wave-bar-1" />
                        <span className="w-1 bg-saffron rounded-full wave-bar-2" />
                        <span className="w-1 bg-saffron rounded-full wave-bar-3" />
                        <span className="w-1 bg-saffron rounded-full wave-bar-4" />
                      </div>
                    )}
                  </div>

                  <p className="text-base sm:text-[17px] text-[#1E1E1E] font-medium leading-relaxed mb-3.5">
                    {answer.spokenText}
                  </p>

                  {audioUrl ? (
                    <button
                      onClick={toggleAudio}
                      className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-saffron hover:bg-saffron-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Square className="w-4 h-4 fill-white" />
                          <span>आवाज रोकें (Pause Audio)</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>दोबारा सुनें (Replay Audio) 🔊</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-[#545454] italic">
                      आवाज तैयार हो रही है या अनुपलब्ध है
                    </span>
                  )}
                </div>

                {/* Structured Eligibility / Benefits / Documents */}
                <h3 className="text-lg font-extrabold text-[#1E1E1E] mb-3">{answer.card.title}</h3>

                <div className="space-y-3">
                  {answer.card.benefits && answer.card.benefits.length > 0 && (
                    <div className="p-3.5 bg-[#E8F5E9]/70 rounded-2xl border border-[#A5D6A7]">
                      <div className="flex items-center gap-2 mb-1.5 text-[#1B5E20] font-extrabold text-sm">
                        <Gift className="w-4 h-4" />
                        <span>मिलने वाले लाभ (Benefits)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {answer.card.benefits.map((item, i) => (
                          <li key={i} className="text-sm sm:text-[15px] text-[#1E1E1E] flex items-start gap-2">
                            <span className="text-[#1B5E20] font-bold">✦</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {answer.card.eligibility && answer.card.eligibility.length > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#E6D7C3]">
                      <div className="flex items-center gap-2 mb-1.5 text-saffron-700 font-extrabold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>पात्रता (Eligibility)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {answer.card.eligibility.map((item, i) => (
                          <li key={i} className="text-sm sm:text-[15px] text-[#1E1E1E] flex items-start gap-2">
                            <span className="text-saffron font-bold">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {answer.card.documents && answer.card.documents.length > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[#E6D7C3]">
                      <div className="flex items-center gap-2 mb-2 text-amber-900 font-extrabold text-sm">
                        <FileText className="w-4 h-4" />
                        <span>जरूरी दस्तावेज (Documents)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {answer.card.documents.map((doc, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold px-2.5 py-1 bg-[#FFF3E0] text-amber-950 rounded-lg border border-[#FFE0B2]"
                          >
                            📄 {doc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {answer.schemeId && (
                  <button
                    onClick={() => router.push(`/scheme/${answer.schemeId}`)}
                    className="mt-4 w-full h-13 min-h-[52px] rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm active:scale-98 transition-all"
                  >
                    <span>आवेदन कैसे करें व आधिकारिक लिंक</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Official Helplines Quick Card */}
            <div className="bg-white rounded-3xl p-5 border-[1.5px] border-[#E6D7C3] shadow-2xs">
              <div className="flex items-center gap-2.5 mb-3">
                <PhoneCall className="w-5 h-5 text-[#1B5E20]" />
                <h4 className="text-base font-extrabold text-[#1E1E1E]">
                  निःशुल्क सरकारी हेल्पलाइन नंबर
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6D7C3]">
                  <span className="text-[#545454] block">पीएम किसान हेल्पलाइन</span>
                  <strong className="text-sm text-[#1E1E1E]">📞 155261</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6D7C3]">
                  <span className="text-[#545454] block">आयुष्मान भारत</span>
                  <strong className="text-sm text-[#1E1E1E]">📞 14555</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6D7C3]">
                  <span className="text-[#545454] block">महिला हेल्पलाइन</span>
                  <strong className="text-sm text-[#1E1E1E]">📞 181</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E6D7C3]">
                  <span className="text-[#545454] block">सूर्य घर / सोलर</span>
                  <strong className="text-sm text-[#1E1E1E]">📞 15555</strong>
                </div>
              </div>
              <p className="text-[11px] text-[#545454] mt-3 text-center">
                सभी जानकारी आधिकारिक सरकारी पोर्टल (gov.in) पर आधारित है।
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Bottom Voice Bar (< lg screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/95 to-transparent pt-3 pb-4 px-4 z-40 flex flex-col items-center border-t border-[#E6D7C3]/60">
        <div className="flex items-center gap-4 w-full max-w-md justify-between bg-white px-4 py-2.5 rounded-2xl border-2 border-[#E6D7C3] shadow-lg">
          <div className="flex-1">
            {micState === 'recording' ? (
              <span className="text-xs font-extrabold text-red-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                बोलें... {recordTimer}s (छोड़ें)
              </span>
            ) : micState === 'thinking' ? (
              <span className="text-xs font-extrabold text-amber-800">
                ⏳ जवाब तैयार हो रहा है...
              </span>
            ) : micState === 'speaking' ? (
              <span className="text-xs font-extrabold text-[#1B5E20]">
                🔊 सहायक बोल रहा है...
              </span>
            ) : (
              <div>
                <p className="text-sm font-extrabold text-[#1E1E1E]">बोलकर पूछें (Hold Mic)</p>
                <p className="text-[11px] text-[#545454]">हिंदी, मराठी या English में बोलें</p>
              </div>
            )}
          </div>

          <button
            onPointerDown={startRecording}
            onPointerUp={stopRecording}
            onPointerLeave={(e) => {
              if (micState === 'recording') stopRecording(e);
            }}
            disabled={micState === 'thinking'}
            className={`w-14 h-14 min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center shadow-md active:scale-95 transition-all select-none touch-none ${
              micState === 'recording'
                ? 'bg-red-600 text-white ring-4 ring-red-200'
                : micState === 'thinking'
                ? 'bg-amber-500 text-white animate-pulse'
                : 'bg-saffron text-white'
            }`}
            aria-label="Hold to speak"
          >
            <Mic className="w-7 h-7" />
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
        <div className="p-10 text-center text-[#545454] font-bold">
          सरकारी सहायक लोड हो रहा है...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
