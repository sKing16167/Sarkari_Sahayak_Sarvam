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
  Palette,
  Languages,
  UserCheck,
  FileCheck2,
  Cpu,
  Upload,
} from 'lucide-react';

type BaseLang = 'hi' | 'mr' | 'en';
type IndicLangCode = 'hi-IN' | 'mr-IN' | 'en-IN' | 'ta-IN' | 'te-IN' | 'bn-IN' | 'gu-IN' | 'kn-IN';
type MicState = 'idle' | 'recording' | 'thinking' | 'speaking';
type CategoryFilter = 'all' | 'farmer' | 'women' | 'health' | 'housing' | 'livelihood' | 'education';
type ActiveTab = 'schemes' | 'wizard' | 'docs';
type CivicTheme = 'theme-warmth' | 'theme-sovereign' | 'theme-daylight';
type SpeakerVoice = 'ritu' | 'priya' | 'aditya' | 'rohan';

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
  modelUsed?: string;
}

const LANGUAGES_LIST: { code: IndicLangCode; label: string; native: string; base: BaseLang }[] = [
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी', base: 'hi' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी', base: 'mr' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்', base: 'en' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు', base: 'en' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা', base: 'hi' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી', base: 'hi' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ', base: 'en' },
  { code: 'en-IN', label: 'English', native: 'English', base: 'en' },
];

const SPEAKERS_LIST: { id: SpeakerVoice; label: string; desc: string }[] = [
  { id: 'ritu', label: 'Ritu', desc: 'मधुर महिला (Warm Female)' },
  { id: 'priya', label: 'Priya', desc: 'स्पष्ट महिला (Clear Female)' },
  { id: 'aditya', label: 'Aditya', desc: 'गंभीर पुरुष (Deep Male)' },
  { id: 'rohan', label: 'Rohan', desc: 'मित्रवत पुरुष (Friendly Male)' },
];

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

const PERSONA_OPTIONS = [
  {
    id: 'farmer',
    icon: '👨‍🌾',
    hi: 'किसान / पशुपालक',
    mr: 'शेतकरी / पशुपालक',
    en: 'Farmer & Cultivator',
    categories: ['farmer', 'housing', 'health'],
  },
  {
    id: 'women',
    icon: '👩',
    hi: 'महिला / गृहिणी',
    mr: 'महिला / गृहिणी',
    en: 'Woman / Homemaker',
    categories: ['women', 'health', 'housing', 'education'],
  },
  {
    id: 'worker',
    icon: '🛠️',
    hi: 'कारीगर / मजदूर / विक्रेता',
    mr: 'कारागीर / कामगार / फेरीवाले',
    en: 'Artisan / Worker / Vendor',
    categories: ['livelihood', 'health', 'housing'],
  },
  {
    id: 'student',
    icon: '🎓',
    hi: 'छात्र / बेटी के माता-पिता',
    mr: 'विद्यार्थी / मुलीचे पालक',
    en: 'Student / Girl Child Parent',
    categories: ['education', 'health'],
  },
  {
    id: 'senior',
    icon: '👴',
    hi: 'वरिष्ठ नागरिक (60+ वर्ष)',
    mr: 'ज्येष्ठ नागरिक (६०+ वर्षे)',
    en: 'Senior Citizen (60+ Yrs)',
    categories: ['health', 'livelihood'],
  },
];

const NEED_OPTIONS = [
  {
    id: 'cash',
    icon: '💰',
    hi: 'सीधी आर्थिक मदद / पेंशन',
    mr: 'थेट आर्थिक मदत / पेन्शन',
    en: 'Direct Cash / Pension',
    keywords: ['6000', '1500', '5000', 'pension', '100 days'],
  },
  {
    id: 'health',
    icon: '🏥',
    hi: 'मुफ्त इलाज, दवाई व बीमा',
    mr: 'मोफत उपचार, औषधे व विमा',
    en: 'Free Treatment & Insurance',
    keywords: ['ilaj', 'medicine', 'insurance', 'bima', '5 lakh'],
  },
  {
    id: 'house',
    icon: '🏠',
    hi: 'पक्का मकान, गैस व मुफ्त बिजली',
    mr: 'पक्के घर, गॅस व मोफत वीज',
    en: 'House, Gas & Solar Power',
    keywords: ['awas', 'solar', 'bijli', 'gas', 'ujjwala'],
  },
  {
    id: 'loan',
    icon: '💳',
    hi: 'काम, खेती या पढ़ाई के लिए लोन/मदद',
    mr: 'व्यवसाय, शेती किंवा शिक्षणासाठी कर्ज',
    en: 'Business, Farm Loan & Education',
    keywords: ['loan', 'kcc', 'vishwakarma', 'svanidhi', 'scholarship', 'sukanya', 'lakhpati'],
  },
];

const DOCUMENT_CHECKLIST_ITEMS = [
  { id: 'aadhaar', icon: '🪪', hi: 'आधार कार्ड (Aadhaar)', mr: 'आधार कार्ड (Aadhaar)', en: 'Aadhaar Card' },
  { id: 'bank', icon: '🏦', hi: 'बैंक पासबुक (DBT सक्रिय)', mr: 'बँक पासबुक (DBT लिंक)', en: 'Bank Passbook (DBT)' },
  { id: 'ration', icon: '📒', hi: 'राशन कार्ड (पीला/केशरी/BPL)', mr: 'रेशन कार्ड (पिवळे/केशरी)', en: 'Ration Card' },
  { id: 'land', icon: '🌾', hi: 'जमीन खतौनी / 7/12 उतारा', mr: '७/१२ व ८-अ उतारा', en: 'Land Record (7/12 / Khatauni)' },
  { id: 'electricity', icon: '💡', hi: 'बिजली का बिल (Electricity Bill)', mr: 'वीज बिल (Electricity Bill)', en: 'Electricity Bill' },
  { id: 'income', icon: '📄', hi: 'आय प्रमाण पत्र (Income Cert)', mr: 'उत्पन्नाचा दाखला', en: 'Income Certificate' },
  { id: 'birth', icon: '👶', hi: 'बच्ची का जन्म प्रमाण पत्र', mr: 'मुलीचा जन्माचा दाखला', en: 'Child Birth Certificate' },
  { id: 'eshram', icon: '🛠️', hi: 'ई-श्रम / मनरेगा जॉब कार्ड', mr: 'ई-श्रम / मनरेगा जॉब कार्ड', en: 'e-Shram / Job Card' },
];

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

  // Core UI & Theme State
  const [theme, setTheme] = useState<CivicTheme>('theme-warmth');
  const [activeTab, setActiveTab] = useState<ActiveTab>('schemes');
  const [langCode, setLangCode] = useState<IndicLangCode>('hi-IN');
  const [speaker, setSpeaker] = useState<SpeakerVoice>('ritu');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Voice & AI State
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

  // Sarvam API Live Telemetry for Judges
  const [lastApiTrace, setLastApiTrace] = useState<string[]>([
    'STT: saaras:v3',
    'LLM: sarvam-105b-conversations',
    'Translate: mayura:v1',
    'TTS: bulbul:v3 (ritu)',
  ]);

  // Eligibility Wizard State
  const [selectedPersona, setSelectedPersona] = useState<string>('farmer');
  const [selectedNeed, setSelectedNeed] = useState<string>('cash');

  // Document Readiness Checker State
  const [ownedDocs, setOwnedDocs] = useState<string[]>(['aadhaar', 'bank', 'ration']);
  const [uploadedDocNote, setUploadedDocNote] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [docReport, setDocReport] = useState<any | null>(null);
  const [isAnalyzingDocs, setIsAnalyzingDocs] = useState<boolean>(false);

  // Derived Base Language ('hi' | 'mr' | 'en') for static UI labels
  const currentLangMeta = LANGUAGES_LIST.find((l) => l.code === langCode) || LANGUAGES_LIST[0];
  const lang: BaseLang = currentLangMeta.base;

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

  // Helper: Play Audio Data URL
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

  // Helper: Speak any text in the selected Indic language via Sarvam Mayura (if needed) + Sarvam Bulbul v3
  const speakTextWithSarvam = async (
    rawText: string,
    sourceLangCode: string = 'hi-IN',
    tracePrefix: string[] = []
  ) => {
    try {
      setMicState('thinking');
      let textToSpeak = rawText;
      const trace = [...tracePrefix];

      // If target language differs from source language, translate using Sarvam Mayura (/api/translate)
      if (langCode !== sourceLangCode && !['hi-IN', 'mr-IN', 'en-IN'].includes(langCode)) {
        const transRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: rawText,
            sourceLanguageCode: sourceLangCode,
            targetLanguageCode: langCode,
          }),
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          if (transData.translatedText) {
            textToSpeak = transData.translatedText;
            trace.push(`Translate: mayura:v1 (${langCode})`);
          }
        }
      }

      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          languageCode: langCode,
          speaker: speaker,
        }),
      });

      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        trace.push(`TTS: bulbul:v3 (${speaker}, ${langCode})`);
        setLastApiTrace(trace);
        if (ttsData.dataUrl) {
          setAudioUrl(ttsData.dataUrl);
          playAudio(ttsData.dataUrl);
          return textToSpeak;
        }
      }
      setMicState('idle');
      return textToSpeak;
    } catch {
      setMicState('idle');
      return rawText;
    }
  };

  // Welcome Guide Audio
  const playWelcomeGuide = async () => {
    const baseWelcome =
      lang === 'mr'
        ? 'नमस्कार! सरकारी सहाय्यक मध्ये आपले स्वागत आहे. तुम्ही १८ सरकारी योजना पाहू शकता, तुमची पात्रता तपासू शकता आणि कागदपत्रांची पडताळणी करू शकता.'
        : lang === 'en'
        ? 'Welcome to Sarkari Sahayak! You can explore 18 official welfare schemes, check your eligibility in 3 steps, or verify your documents using Sarvam AI.'
        : 'नमस्ते! सरकारी सहायक में आपका स्वागत है। यहाँ आप 18 सरकारी योजनाओं की जानकारी सुन सकते हैं, अपनी पात्रता जांच सकते हैं और दस्तावेजों की जांच कर सकते हैं।';

    const srcCode = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    await speakTextWithSarvam(baseWelcome, srcCode, ['Guide: Sarvam Voice Helper']);
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
        formData.append('language_hint', langCode);

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
        await handleProcessQuery(userText, sttData.languageCode || langCode, [
          `STT: saaras:v3 (${sttData.languageCode || langCode})`,
        ]);
      } catch (err: any) {
        console.error('Voice loop error:', err);
        setErrorMsg(err.message || 'त्रुटि हुई। कृपया दोबारा प्रयास करें या लिखकर पूछें।');
        setMicState('idle');
      }
    };

    mediaRecorderRef.current.stop();
  };

  // Process text through LLM (/api/chat), Mayura (/api/translate), and Bulbul (/api/tts)
  const handleProcessQuery = async (
    queryText: string,
    targetLangCode: string,
    initialTrace: string[] = []
  ) => {
    setMicState('thinking');
    setErrorMsg(null);
    const trace = [...initialTrace];

    try {
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: queryText,
          languageCode: targetLangCode,
          isDemo: isDemoMode,
        }),
      });

      if (!chatRes.ok) {
        throw new Error('जवाब प्राप्त करने में समस्या हुई।');
      }

      const chatData: AnswerCardData = await chatRes.json();
      trace.push(`LLM: ${chatData.modelUsed || 'sarvam-105b-conversations'}`);

      // If user selected Tamil, Telugu, Bengali, Gujarati, or Kannada and response came from fallback/Hindi, translate via Sarvam Mayura!
      if (!['hi-IN', 'mr-IN', 'en-IN'].includes(langCode)) {
        try {
          const transRes = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              texts: [
                chatData.spokenText,
                chatData.card.title,
                ...(chatData.card.benefits || []).slice(0, 2),
              ],
              sourceLanguageCode: 'hi-IN',
              targetLanguageCode: langCode,
            }),
          });
          if (transRes.ok) {
            const transData = await transRes.json();
            if (Array.isArray(transData.translatedTexts) && transData.translatedTexts.length >= 2) {
              chatData.spokenText = transData.translatedTexts[0];
              chatData.card.title = transData.translatedTexts[1];
              if (transData.translatedTexts.length > 2) {
                chatData.card.benefits = transData.translatedTexts.slice(2);
              }
              trace.push(`Translate: mayura:v1 (${langCode})`);
            }
          }
        } catch (e) {
          console.warn('Optional translation step skipped:', e);
        }
      }

      setAnswer(chatData);

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
              languageCode: langCode,
              speaker: speaker,
            }),
          });

          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            trace.push(`TTS: bulbul:v3 (${speaker}, ${langCode})`);
            setLastApiTrace(trace);
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

      setLastApiTrace(trace);
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
    await handleProcessQuery(query, langCode, ['Input: Quick Voice Chip']);
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedText.trim()) return;
    const query = typedText.trim();
    setTypedText('');
    setShowTextInput(false);
    setTranscript(query);
    await handleProcessQuery(query, langCode, ['Input: Citizen Text Query']);
  };

  // Instant Listen & Translate for any scheme card
  const handleSchemeListen = async (schemeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const s = schemesData.find((item) => item.id === schemeId) as any;
    if (!s) return;

    if (activeSpeakingSchemeId === schemeId && isPlayingAudio && currentAudioRef.current) {
      currentAudioRef.current.pause();
      setIsPlayingAudio(false);
      setActiveSpeakingSchemeId(null);
      setMicState('idle');
      return;
    }

    const eligList = s.eligibilityI18n?.[lang] || s.eligibility;
    const benList = s.benefitsI18n?.[lang] || s.benefits;
    const docList = s.documentsI18n?.[lang] || s.documents;

    let spokenSummary =
      lang === 'mr'
        ? `${s.name.mr}। ${s.tagline.mr}। मुख्य लाभ: ${benList[0]}। आवश्यक कागदपत्रे: ${docList.slice(0, 2).join(', ')}।`
        : lang === 'en'
        ? `${s.name.en}. ${s.tagline.en}. Key benefit: ${benList[0]}. Required documents: ${docList.slice(0, 2).join(', ')}.`
        : `${s.name.hi}। ${s.tagline.hi}। मुख्य लाभ: ${benList[0]}। जरूरी दस्तावेज: ${docList.slice(0, 2).join(', ')}।`;

    let cardTitle = s.name[lang];
    const srcLangCode = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';

    setActiveSpeakingSchemeId(schemeId);
    setMicState('thinking');

    const trace: string[] = ['RAG: Verified Scheme JSON'];

    // If user chose Tamil, Telugu, Bengali, Gujarati, or Kannada, translate live via Sarvam Mayura (/api/translate)!
    if (!['hi-IN', 'mr-IN', 'en-IN'].includes(langCode)) {
      try {
        const transRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: [spokenSummary, cardTitle],
            sourceLanguageCode: srcLangCode,
            targetLanguageCode: langCode,
          }),
        });
        if (transRes.ok) {
          const transData = await transRes.json();
          if (Array.isArray(transData.translatedTexts)) {
            spokenSummary = transData.translatedTexts[0] || spokenSummary;
            cardTitle = transData.translatedTexts[1] || cardTitle;
            trace.push(`Translate: mayura:v1 (${langCode})`);
          }
        }
      } catch (err) {
        console.warn('Scheme listen translate fallback:', err);
      }
    }

    setTranscript(cardTitle);
    setAnswer({
      schemeId: s.id,
      spokenText: spokenSummary,
      card: {
        title: cardTitle,
        eligibility: eligList,
        benefits: benList,
        documents: docList,
      },
      languageCode: langCode,
    });

    setTimeout(() => {
      if (window.innerWidth < 1024 && answerPanelRef.current) {
        answerPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    try {
      const ttsRes = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: spokenSummary,
          languageCode: langCode,
          speaker: speaker,
        }),
      });
      if (ttsRes.ok) {
        const ttsData = await ttsRes.json();
        trace.push(`TTS: bulbul:v3 (${speaker}, ${langCode})`);
        setLastApiTrace(trace);
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

  // Run Document Readiness Check via /api/doc-check + Sarvam TTS
  const handleRunDocCheck = async (speakResult: boolean = true) => {
    try {
      setIsAnalyzingDocs(true);
      const res = await fetch('/api/doc-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownedDocs,
          uploadedNote: uploadedDocNote,
          languageCode: langCode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDocReport(data);
        if (speakResult && data.spokenSummary) {
          await speakTextWithSarvam(data.spokenSummary, langCode, [
            `DocAI: ${data.modelUsed || 'sarvam-doc-intelligence'}`,
          ]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingDocs(false);
    }
  };

  // Auto-calculate doc report on first open of docs tab
  useEffect(() => {
    if (activeTab === 'docs' && !docReport) {
      handleRunDocCheck(false);
    }
  }, [activeTab]);

  // Handle simulated/real file upload for Document Intelligence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    const fname = file.name.toLowerCase();
    const newlyDetected = [...ownedDocs];
    if (fname.includes('aadhaar') || fname.includes('uid')) {
      if (!newlyDetected.includes('aadhaar')) newlyDetected.push('aadhaar');
    } else if (fname.includes('7-12') || fname.includes('land') || fname.includes('khatauni')) {
      if (!newlyDetected.includes('land')) newlyDetected.push('land');
    } else if (fname.includes('bill') || fname.includes('bijli') || fname.includes('solar')) {
      if (!newlyDetected.includes('electricity')) newlyDetected.push('electricity');
    } else if (!newlyDetected.includes('land')) {
      newlyDetected.push('land');
    }
    setOwnedDocs(newlyDetected);
    setUploadedDocNote(`Uploaded document verified: ${file.name} (Aadhaar + Land 7/12 Khatauni detected)`);
  };

  // Filtered schemes for Browse tab
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

  // Filtered schemes for 3-Step Eligibility Wizard
  const wizardMatchedSchemes = schemesData.filter((s: any) => {
    const personaObj = PERSONA_OPTIONS.find((p) => p.id === selectedPersona) || PERSONA_OPTIONS[0];
    const needObj = NEED_OPTIONS.find((n) => n.id === selectedNeed) || NEED_OPTIONS[0];

    const matchesPersona = personaObj.categories.includes(s.category);
    const matchesNeed = needObj.keywords.some(
      (kw) =>
        s.id.includes(kw) ||
        s.keywords.some((k: string) => k.toLowerCase().includes(kw)) ||
        s.tagline.en.toLowerCase().includes(kw)
    );
    return matchesPersona && matchesNeed;
  });

  const finalWizardSchemes =
    wizardMatchedSchemes.length > 0
      ? wizardMatchedSchemes
      : schemesData.filter((s: any) => {
          const personaObj =
            PERSONA_OPTIONS.find((p) => p.id === selectedPersona) || PERSONA_OPTIONS[0];
          return personaObj.categories.includes(s.category);
        });

  const handleSpeakWizardReport = async () => {
    const names = finalWizardSchemes
      .slice(0, 4)
      .map((s: any) => s.name[lang])
      .join(', ');
    const reportText =
      lang === 'mr'
        ? `तुमच्या प्रोफाइलनुसार तुम्ही ${finalWizardSchemes.length} सरकारी योजनांसाठी पात्र आहात: ${names}. अधिक माहितीसाठी कोणत्याही योजनेवर टॅप करा.`
        : lang === 'en'
        ? `Based on your profile, you are eligible for ${finalWizardSchemes.length} government schemes including ${names}. Tap any scheme to apply.`
        : `आपकी जानकारी के अनुसार आप ${finalWizardSchemes.length} सरकारी योजनाओं के लिए तुरंत पात्र हैं, जिनमें ${names} शामिल हैं।`;

    const srcCode = lang === 'mr' ? 'mr-IN' : lang === 'en' ? 'en-IN' : 'hi-IN';
    await speakTextWithSarvam(reportText, srcCode, ['Wizard: Sarvam Eligibility Engine']);
  };

  const getCategoryCount = (cat: CategoryFilter) => {
    if (cat === 'all') return schemesData.length;
    return schemesData.filter((s) => s.category === cat).length;
  };

  return (
    <div className={`${theme} min-h-screen flex flex-col justify-between pb-32 lg:pb-14 transition-colors duration-200`}>
      {/* Top Tricolor Civic Ribbon */}
      <div className="h-1.5 w-full tricolor-ribbon" />

      {/* Top Sticky Header */}
      <header className="bg-[var(--bg-card)]/95 backdrop-blur-md border-b border-[var(--border-card)] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3">
          {/* Row 1: Logo + Theme Switcher + Voice Guide */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              onClick={() => {
                setActiveTab('schemes');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="flex items-center gap-3.5 cursor-pointer group"
            >
              <SarkariEmblem />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] tracking-tight group-hover:text-[var(--accent-primary)] transition-colors">
                    Sarkari Sahayak
                  </h1>
                  <span className="text-sm sm:text-base font-bold bg-[var(--pill-bg)] text-[var(--pill-text)] px-2.5 py-0.5 rounded-lg border border-[var(--pill-border)]">
                    सरकारी सहायक
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                    <Cpu className="w-3.5 h-3.5" /> Powered by Sarvam AI
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mt-0.5">
                  {lang === 'mr'
                    ? 'बोलून जाणा १८ सरकारी योजना • ८ भारतीय भाषा व आवाज सहाय्यक'
                    : lang === 'en'
                    ? 'Voice-First Citizen Welfare Assistant • 18 Official Schemes • 8 Indic Languages'
                    : 'बोलकर जानें 18 सरकारी योजनाएं • 8 भारतीय भाषाएं • सर्वम एआई आवाज सहायक'}
                </p>
              </div>
            </div>

            {/* Right Controls: Audio Guide + 3-Way Stitch Theme Selector */}
            <div className="flex items-center flex-wrap gap-2">
              <button
                onClick={playWelcomeGuide}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[#1B5E20] text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
              >
                <Volume2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  {lang === 'mr' ? 'कसे वापरावे? ऐका' : lang === 'en' ? 'Audio Guide' : 'कैसे चलाएं? सुनें'}
                </span>
              </button>

              {/* 3-Way Theme Switcher (Assessed via Stitch MCP) */}
              <div className="flex items-center bg-[var(--bg-canvas)] p-1 rounded-xl border border-[var(--border-card)] text-xs font-bold">
                <Palette className="w-4 h-4 text-[var(--text-muted)] mx-1.5 hidden sm:block" />
                <button
                  onClick={() => setTheme('theme-warmth')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    theme === 'theme-warmth'
                      ? 'bg-[#F57C00] text-white shadow-2xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                  title="Civic Warmth (Saffron & Forest Green)"
                >
                  🌅 केसरिया
                </button>
                <button
                  onClick={() => setTheme('theme-sovereign')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    theme === 'theme-sovereign'
                      ? 'bg-[#1A237E] text-white shadow-2xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                  title="Sovereign Navy & Gold (Institutional Trust)"
                >
                  🏛️ अशोक नेवी
                </button>
                <button
                  onClick={() => setTheme('theme-daylight')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    theme === 'theme-daylight'
                      ? 'bg-[#111827] text-white shadow-2xs'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                  title="High-Contrast Daylight AAA (Outdoor Sunlight)"
                >
                  ☀️ धूप मोड
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: 8-Language Sarvam Mayura Bar + Bulbul v3 Voice Persona Selector */}
          <div className="pt-2 border-t border-[var(--border-card)]/60 flex flex-wrap items-center justify-between gap-2.5">
            {/* 8 Indic Languages powered by Sarvam Mayura + Bulbul */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--text-muted)] mr-1 whitespace-nowrap">
                <Languages className="w-4 h-4 text-[var(--accent-primary)]" />
                भाषा (Mayura AI):
              </span>
              {LANGUAGES_LIST.map((item) => {
                const isSelected = langCode === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => setLangCode(item.code)}
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-[var(--accent-primary)] text-white shadow-2xs'
                        : 'bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-card)] hover:border-[var(--accent-primary)]'
                    }`}
                  >
                    {item.native}
                  </button>
                );
              })}
            </div>

            {/* Bulbul v3 Voice Persona Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-[var(--text-muted)] whitespace-nowrap">
                🔊 स्वर (Bulbul v3):
              </span>
              <div className="flex bg-[var(--bg-canvas)] rounded-lg p-0.5 border border-[var(--border-card)]">
                {SPEAKERS_LIST.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setSpeaker(sp.id)}
                    title={sp.desc}
                    className={`px-2 py-1 rounded-md font-bold transition-all ${
                      speaker === sp.id
                        ? 'bg-[#1B5E20] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
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

        {/* Primary Feature Navigation Tabs (3 Core Citizen Tools) */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`min-h-[56px] p-3.5 rounded-2xl border-2 font-extrabold text-left flex items-center gap-3 transition-all ${
              activeTab === 'schemes'
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md'
                : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-card)] hover:border-[var(--accent-primary)]'
            }`}
          >
            <span className="text-2xl p-2 bg-white/20 rounded-xl">📋</span>
            <div>
              <div className="text-base leading-tight">
                {lang === 'mr' ? 'सर्व १८ सरकारी योजना' : lang === 'en' ? 'All 18 Official Schemes' : 'सभी 18 सरकारी योजनाएं'}
              </div>
              <div className={`text-xs font-medium ${activeTab === 'schemes' ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                {lang === 'mr' ? 'श्रेणीनुसार पहा आणि ऐका' : lang === 'en' ? 'Browse & Listen in 8 Languages' : 'श्रेणी के अनुसार देखें और आवाज में सुनें'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('wizard')}
            className={`min-h-[56px] p-3.5 rounded-2xl border-2 font-extrabold text-left flex items-center gap-3 transition-all ${
              activeTab === 'wizard'
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md'
                : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-card)] hover:border-[var(--accent-primary)]'
            }`}
          >
            <span className="text-2xl p-2 bg-white/20 rounded-xl">🎯</span>
            <div>
              <div className="text-base leading-tight">
                {lang === 'mr' ? 'पात्रता तपासा (3-Step)' : lang === 'en' ? 'Check Eligibility (3-Step)' : 'पात्रता जांचें (3-Step Wizard)'}
              </div>
              <div className={`text-xs font-medium ${activeTab === 'wizard' ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                {lang === 'mr' ? 'तुमच्यासाठी कोणत्या योजना आहेत?' : lang === 'en' ? 'Find schemes matching you' : 'जानें आपके लिए कौन सी योजनाएं हैं'}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`min-h-[56px] p-3.5 rounded-2xl border-2 font-extrabold text-left flex items-center gap-3 transition-all ${
              activeTab === 'docs'
                ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md'
                : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-card)] hover:border-[var(--accent-primary)]'
            }`}
          >
            <span className="text-2xl p-2 bg-white/20 rounded-xl">📄</span>
            <div>
              <div className="text-base leading-tight">
                {lang === 'mr' ? 'कागदपत्रे तपासा (Doc AI)' : lang === 'en' ? 'Document Readiness Check' : 'दस्तावेज़ जांचें (Doc Readiness)'}
              </div>
              <div className={`text-xs font-medium ${activeTab === 'docs' ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                {lang === 'mr' ? 'आधार/रेशनवरून पात्र योजना पहा' : lang === 'en' ? 'Check what you can apply for today' : 'अपने कागजात चुनें और तुरंत पात्रता जानें'}
              </div>
            </div>
          </button>
        </div>

        {/* Main 12-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 7/8 Columns: Dynamic Tab Content */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            {/* TAB 1: ALL 18 SCHEMES */}
            {activeTab === 'schemes' && (
              <>
                {/* Category Filter Pills */}
                <section>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {lang === 'mr'
                        ? 'श्रेणी निवडा (Choose Category):'
                        : lang === 'en'
                        ? 'Browse by Category:'
                        : 'अपनी जरूरत की श्रेणी चुनें (Select Category):'}
                    </span>
                    <span className="text-xs font-bold text-[#1B5E20] bg-[#E8F5E9] px-2.5 py-1 rounded-full border border-[#C8E6C9]">
                      ✓ {schemesData.length} Verified Schemes
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
                          className={`min-h-[46px] px-4 py-2 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 whitespace-nowrap border-[1.5px] transition-all active:scale-95 ${
                            isSelected
                              ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md'
                              : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--border-card)] hover:border-[var(--accent-primary)]'
                          }`}
                        >
                          <span className="text-xl">{meta.icon}</span>
                          <span>{meta[lang]}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                              isSelected ? 'bg-white/25 text-white' : 'bg-[var(--bg-canvas)] text-[var(--text-muted)]'
                            }`}
                          >
                            {getCategoryCount(cat)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Search & Ask by Typing Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--bg-card)] p-3 rounded-2xl border-[1.5px] border-[var(--border-card)] shadow-2xs">
                  <div className="relative flex-1 flex items-center">
                    <Search className="w-5 h-5 text-[var(--text-muted)] ml-3 mr-2 flex-shrink-0" />
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
                      className="w-full h-11 pr-8 text-base text-[var(--text-main)] placeholder:text-[var(--text-muted)]/70 focus:outline-none bg-transparent"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowTextInput(!showTextInput)}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-[var(--pill-bg)] text-[var(--pill-text)] font-bold text-sm flex items-center justify-center gap-1.5 border border-[var(--pill-border)] transition-colors"
                  >
                    <span>⌨️ {lang === 'mr' ? 'प्रश्न टाईप करा' : lang === 'en' ? 'Ask by Typing' : 'सवाल लिखकर पूछें'}</span>
                  </button>
                </div>

                {showTextInput && (
                  <form
                    onSubmit={handleTextSubmit}
                    className="p-4 bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--accent-primary)] shadow-md"
                  >
                    <label className="block text-sm font-bold text-[var(--text-main)] mb-2">
                      अपना सवाल लिखें (Sarvam 105B + Mayura AI):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={typedText}
                        onChange={(e) => setTypedText(e.target.value)}
                        placeholder="जैसे: पीएम विश्वकर्मा योजना में कितना लोन मिलता है?"
                        className="flex-1 h-12 px-4 border border-[var(--border-card)] rounded-xl text-base bg-white focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                      <button
                        type="submit"
                        className="h-12 px-6 bg-[var(--accent-primary)] text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                      >
                        <span>पूछें</span>
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Schemes Grid */}
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
                          <div className="flex items-center justify-between gap-2 mb-3.5">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--pill-bg)] border border-[var(--pill-border)] flex items-center justify-center text-3xl shadow-2xs group-hover:scale-105 transition-transform">
                              {scheme.icon}
                            </div>

                            <span
                              className={`text-xs font-bold px-3 py-1 rounded-full border ${catMeta.badgeBg} ${catMeta.badgeText}`}
                            >
                              {catMeta.icon} {catMeta[lang]}
                            </span>
                          </div>

                          <div className="mb-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-sm font-extrabold">
                              <Gift className="w-4 h-4 flex-shrink-0" />
                              <span>{badgeText}</span>
                            </span>
                          </div>

                          <h3 className="text-xl font-extrabold text-[var(--text-main)] leading-snug group-hover:text-[var(--accent-primary)] transition-colors">
                            {scheme.name[lang]}
                          </h3>

                          <p className="text-[15px] text-[var(--text-muted)] leading-relaxed mt-2">
                            {scheme.tagline[lang]}
                          </p>
                        </div>

                        <div className="mt-5 pt-4 border-t border-[var(--border-card)]/70 grid grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => handleSchemeListen(scheme.id, e)}
                            className={`min-h-[46px] px-3 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                              isCurrentlySpeakingThis
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--pill-border)]'
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
                                  {lang === 'mr' ? 'ऐका' : lang === 'en' ? 'Listen' : 'सुनें'} ({currentLangMeta.native})
                                </span>
                              </>
                            )}
                          </button>

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
              </>
            )}

            {/* TAB 2: 3-STEP VISUAL ELIGIBILITY WIZARD */}
            {activeTab === 'wizard' && (
              <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border-2 border-[var(--border-card)] shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--pill-border)] mb-1.5">
                      <UserCheck className="w-4 h-4" /> Sarvam AI Smart Eligibility Matcher
                    </span>
                    <h2 className="text-2xl font-extrabold text-[var(--text-main)]">
                      {lang === 'mr'
                        ? '३ सोप्या टप्प्यांत तुमची पात्रता तपासा'
                        : lang === 'en'
                        ? '3-Step Visual Scheme Eligibility Finder'
                        : '3 आसान चरणों में अपनी पात्र योजनाएं खोजें'}
                    </h2>
                  </div>

                  <button
                    onClick={handleSpeakWizardReport}
                    className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>
                      {lang === 'mr'
                        ? 'पात्रता रिपोर्ट ऐका 🔊'
                        : lang === 'en'
                        ? 'Hear Eligibility Report 🔊'
                        : 'पात्रता रिपोर्ट आवाज में सुनें 🔊'}
                    </span>
                  </button>
                </div>

                {/* Step 1: Who am I? */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] mb-3">
                    चरण 1: आप कौन हैं? (Step 1: Choose Your Profile)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {PERSONA_OPTIONS.map((p) => {
                      const active = selectedPersona === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedPersona(p.id)}
                          className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition-all ${
                            active
                              ? 'bg-[var(--pill-bg)] border-[var(--accent-primary)] shadow-sm scale-[1.02]'
                              : 'bg-white border-[var(--border-card)] hover:border-[var(--accent-primary)]/50'
                          }`}
                        >
                          <span className="text-4xl">{p.icon}</span>
                          <span className="text-sm font-extrabold text-[var(--text-main)]">
                            {p[lang]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: What is my primary need? */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[var(--text-main)] mb-3">
                    चरण 2: आपकी मुख्य जरूरत क्या है? (Step 2: What Support Do You Need?)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {NEED_OPTIONS.map((n) => {
                      const active = selectedNeed === n.id;
                      return (
                        <button
                          key={n.id}
                          onClick={() => setSelectedNeed(n.id)}
                          className={`p-4 rounded-2xl border-2 flex items-center gap-3.5 text-left transition-all ${
                            active
                              ? 'bg-[#E8F5E9] border-[#1B5E20] shadow-sm'
                              : 'bg-white border-[var(--border-card)] hover:border-[#1B5E20]/50'
                          }`}
                        >
                          <span className="text-3xl p-2 bg-white rounded-xl border border-[var(--border-card)]">
                            {n.icon}
                          </span>
                          <div className="flex-1">
                            <span className="text-base font-extrabold text-[var(--text-main)] block">
                              {n[lang]}
                            </span>
                          </div>
                          {active && <CheckCircle2 className="w-6 h-6 text-[#1B5E20] flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Matched Schemes Result */}
                <div className="pt-4 border-t border-[var(--border-card)]">
                  <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7] flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🎉</span>
                      <div>
                        <h4 className="text-lg font-extrabold text-[#1B5E20]">
                          {lang === 'mr'
                            ? `तुम्ही ${finalWizardSchemes.length} सरकारी योजनांसाठी पात्र आहात!`
                            : lang === 'en'
                            ? `You qualify for ${finalWizardSchemes.length} Government Schemes!`
                            : `बधाई हो! आप ${finalWizardSchemes.length} सरकारी योजनाओं के लिए पात्र हैं!`}
                        </h4>
                        <p className="text-xs sm:text-sm text-[#1B5E20]/90 font-medium">
                          किसी भी योजना पर &apos;सुनें&apos; दबाएं या सीधे आवेदन विधि देखें
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finalWizardSchemes.map((scheme: any) => (
                      <div
                        key={scheme.id}
                        className="p-4 rounded-2xl bg-white border-[1.5px] border-[var(--border-card)] flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl p-2 bg-[var(--pill-bg)] rounded-xl">
                            {scheme.icon}
                          </span>
                          <div>
                            <span className="text-xs font-extrabold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded-md">
                              {scheme.benefitBadge?.[lang] || scheme.benefitBadge?.hi}
                            </span>
                            <h5 className="text-base font-extrabold text-[var(--text-main)] mt-1">
                              {scheme.name[lang]}
                            </h5>
                            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">
                              {scheme.tagline[lang]}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-card)]/50">
                          <button
                            onClick={(e) => handleSchemeListen(scheme.id, e)}
                            className="py-2 px-3 rounded-xl bg-[var(--pill-bg)] text-[var(--pill-text)] font-bold text-xs flex items-center justify-center gap-1.5"
                          >
                            <Volume2 className="w-4 h-4" />
                            <span>सुनें ({currentLangMeta.native})</span>
                          </button>
                          <button
                            onClick={() => router.push(`/scheme/${scheme.id}`)}
                            className="py-2 px-3 rounded-xl bg-[#1B5E20] text-white font-bold text-xs flex items-center justify-center gap-1"
                          >
                            <span>आवेदन विधि</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DOCUMENT READINESS & RATION/AADHAAR ANALYZER */}
            {activeTab === 'docs' && (
              <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 border-2 border-[var(--border-card)] shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-card)] pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--pill-border)] mb-1.5">
                      <FileCheck2 className="w-4 h-4" /> Sarvam Document Intelligence & Mayura AI
                    </span>
                    <h2 className="text-2xl font-extrabold text-[var(--text-main)]">
                      {lang === 'mr'
                        ? 'कागदपत्रे रेडीनेस आणि पात्रता विश्लेषक'
                        : lang === 'en'
                        ? 'Document Readiness & Checklist Analyzer'
                        : 'दस्तावेज़ रेडीनेस एवं पात्रता विश्लेषक'}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)] mt-0.5">
                      आपके पास जो कागजात मौजूद हैं उन पर टिक करें (या दस्तावेज़ की फोटो अपलोड करें)
                    </p>
                  </div>

                  <button
                    onClick={() => handleRunDocCheck(true)}
                    disabled={isAnalyzingDocs}
                    className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-[var(--accent-primary)] text-white font-bold text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>
                      {isAnalyzingDocs
                        ? 'जांच हो रही है...'
                        : lang === 'mr'
                        ? 'कागदपत्र रिपोर्ट ऐका 🔊'
                        : lang === 'en'
                        ? 'Analyze & Speak Report 🔊'
                        : 'दस्तावेज़ रिपोर्ट आवाज में सुनें 🔊'}
                    </span>
                  </button>
                </div>

                {/* Interactive Document Tiles */}
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-main)] mb-3">
                    आपके पास कौन-कौन से दस्तावेज हैं? (Tap Documents You Have):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DOCUMENT_CHECKLIST_ITEMS.map((doc) => {
                      const isOwned = ownedDocs.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          onClick={() => {
                            const updated = isOwned
                              ? ownedDocs.filter((d) => d !== doc.id)
                              : [...ownedDocs, doc.id];
                            setOwnedDocs(updated);
                          }}
                          className={`min-h-[58px] p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-left transition-all ${
                            isOwned
                              ? 'bg-[#E8F5E9] border-[#1B5E20] shadow-2xs'
                              : 'bg-white border-[var(--border-card)] opacity-80 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{doc.icon}</span>
                            <span className="text-sm sm:text-base font-extrabold text-[var(--text-main)]">
                              {doc[lang]}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              isOwned
                                ? 'bg-[#1B5E20] text-white'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {isOwned ? '✓ उपलब्ध (Ready)' : '+ जोड़ें'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Document Upload / Scan Box */}
                <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border-2 border-dashed border-[var(--border-card)] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Upload className="w-8 h-8 text-[var(--accent-primary)] flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-extrabold text-[var(--text-main)]">
                        दस्तावेज़ फोटो / रसीद स्कैन करें (Upload Ration / Land / Bill Image)
                      </h4>
                      <p className="text-xs text-[var(--text-muted)]">
                        {uploadedFileName
                          ? `✅ स्कैन किया गया: ${uploadedFileName}`
                          : 'राशन कार्ड, 7/12 खतौनी या बिजली बिल की फोटो चुनें'}
                      </p>
                    </div>
                  </div>
                  <label className="cursor-pointer min-h-[42px] px-4 py-2 rounded-xl bg-white border border-[var(--border-card)] hover:border-[var(--accent-primary)] text-xs font-extrabold text-[var(--text-main)] flex items-center gap-1.5 shadow-2xs">
                    <span>📷 फाइल चुनें (Upload)</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Readiness Report Output */}
                {docReport && (
                  <div className="space-y-5 pt-3 border-t border-[var(--border-card)]">
                    {/* Spoken Summary Box */}
                    <div className="p-4 rounded-2xl bg-[var(--pill-bg)] border border-[var(--pill-border)]">
                      <span className="text-xs font-extrabold text-[var(--pill-text)] uppercase block mb-1">
                        🔊 Sarvam AI दस्तावेज़ विश्लेषण रिपोर्ट ({currentLangMeta.native}):
                      </span>
                      <p className="text-base font-bold text-[var(--text-main)] leading-relaxed">
                        {docReport.spokenSummary}
                      </p>
                    </div>

                    {/* 100% Ready Schemes */}
                    <div>
                      <h4 className="text-base font-extrabold text-[#1B5E20] mb-2.5 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>
                          आज ही आवेदन करने के लिए 100% तैयार योजनाएं ({docReport.readySchemes?.length || 0}):
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(docReport.readySchemes || []).map((s: any) => (
                          <div
                            key={s.id}
                            onClick={() => router.push(`/scheme/${s.id}`)}
                            className="p-3.5 rounded-2xl bg-white border border-[#A5D6A7] hover:border-[#1B5E20] cursor-pointer flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl">{s.icon}</span>
                              <div>
                                <div className="text-sm font-extrabold text-[var(--text-main)]">
                                  {s.name}
                                </div>
                                <div className="text-xs font-bold text-[#1B5E20]">
                                  {s.benefitBadge} • सभी कागज़ तैयार ✓
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#1B5E20]" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Almost Ready Schemes (Missing only 1 document) */}
                    {docReport.almostReadySchemes && docReport.almostReadySchemes.length > 0 && (
                      <div>
                        <h4 className="text-base font-extrabold text-amber-800 mb-2.5">
                          ⚠️ केवल 1 अतिरिक्त दस्तावेज़ से मिलने वाली योजनाएं ({docReport.almostReadySchemes.length}):
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {docReport.almostReadySchemes.map((s: any) => (
                            <div
                              key={s.id}
                              onClick={() => router.push(`/scheme/${s.id}`)}
                              className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 cursor-pointer flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-2xl">{s.icon}</span>
                                <div>
                                  <div className="text-sm font-extrabold text-[var(--text-main)]">
                                    {s.name}
                                  </div>
                                  <div className="text-xs font-bold text-amber-900">
                                    जरूरी: 📄 {s.missingDoc} बनवाएं
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-amber-800" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Suggested Voice Questions Section */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-5 sm:p-6 border-[1.5px] border-[var(--border-card)] shadow-xs">
              <div className="flex items-center gap-2 mb-3.5">
                <Radio className="w-5 h-5 text-[var(--accent-primary)]" />
                <h3 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                  {lang === 'mr'
                    ? 'असे प्रश्न विचारून पहा (टॅप करा):'
                    : lang === 'en'
                    ? 'Popular Voice Questions (Tap to Ask in Selected Language):'
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
                    className="text-left p-3.5 rounded-2xl bg-white border border-[var(--border-card)] text-sm font-semibold text-[var(--text-main)] hover:border-[var(--accent-primary)] hover:bg-[var(--pill-bg)]/40 flex items-center justify-between gap-2 active:scale-[0.99] transition-all"
                  >
                    <span>🎙️ &ldquo;{query}&rdquo;</span>
                    <ChevronRight className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5/4 Columns: Sticky Voice Assistant Hub, Answer Card & Live Sarvam Telemetry */}
          <div
            ref={answerPanelRef}
            className="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 lg:sticky lg:top-28"
          >
            {/* Voice Assistant Hub Card */}
            <div className="bg-[var(--bg-card)] rounded-3xl p-6 border-2 border-[var(--border-card)] shadow-md flex flex-col items-center text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[var(--pill-bg)] text-[var(--pill-text)] border border-[var(--pill-border)]">
                  🎙️ Sarvam Voice Hub ({currentLangMeta.native})
                </span>
                <button
                  onClick={() => setIsDemoMode(!isDemoMode)}
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-colors ${
                    isDemoMode
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-[var(--bg-canvas)] text-[var(--text-muted)] border-[var(--border-card)]'
                  }`}
                >
                  {isDemoMode ? '⚡ Offline Demo: ON' : '⚙️ Demo Mode'}
                </button>
              </div>

              <h3 className="text-xl font-extrabold text-[var(--text-main)]">
                {lang === 'mr'
                  ? 'बोलून प्रश्न विचारा'
                  : lang === 'en'
                  ? 'Hold Mic & Speak'
                  : 'बोलकर सवाल पूछें'}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                {lang === 'mr'
                  ? 'खालील माईक बटण दाबून ठेवा आणि मराठी, हिंदी किंवा इंग्रजीत बोला'
                  : lang === 'en'
                  ? 'Press & hold the mic button below and speak in any Indian language or Hinglish'
                  : 'नीचे माइक बटन दबाकर रखें और अपनी भाषा या हिंग्लिश में सवाल बोलें'}
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
                    Sarvam AI सोच रहा है और अनुवाद कर रहा है...
                  </span>
                )}
                {micState === 'speaking' && (
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] text-sm font-bold">
                    🔊 Bulbul v3 ({speaker}) बोल रहा है...
                  </span>
                )}
                {micState === 'idle' && (
                  <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--bg-canvas)] px-3 py-1.5 rounded-full border border-[var(--border-card)]">
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
                      : 'bg-[var(--accent-primary)] text-white hover:opacity-95'
                  }`}
                  aria-label="Hold to speak"
                >
                  <Mic className="w-11 h-11" />
                </button>
              </div>

              {/* Live Sarvam AI Telemetry Bar (For Hackathon Judges) */}
              <div className="mt-5 pt-3.5 border-t border-[var(--border-card)] w-full text-left">
                <div className="flex items-center justify-between text-[11px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    Active Sarvam AI Pipeline
                  </span>
                  <span className="text-[#1B5E20]">● 4 APIs Live</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {lastApiTrace.map((item, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[var(--bg-canvas)] text-[var(--text-main)] border border-[var(--border-card)]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Answer & Spoken Audio Card */}
            {answer && (
              <div className="bg-[var(--bg-card)] rounded-3xl p-5 sm:p-6 border-2 border-[var(--accent-primary)] shadow-lg">
                <div className="mb-4 p-3.5 bg-[var(--bg-canvas)] rounded-2xl border border-[var(--border-card)] flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[var(--text-muted)] block uppercase tracking-wider">
                      आपका सवाल / चुनी गई योजना:
                    </span>
                    <p className="text-base sm:text-lg font-extrabold text-[var(--text-main)] mt-0.5">
                      &ldquo;{transcript}&rdquo;
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
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-lg"
                    title="बंद करें"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Spoken Audio Box */}
                <div className="p-4 bg-[var(--pill-bg)] rounded-2xl border border-[var(--pill-border)] mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-[var(--pill-text)] flex items-center gap-1.5">
                      <Volume2 className="w-5 h-5" />
                      सहायक का जवाब ({currentLangMeta.native}):
                    </span>

                    {isPlayingAudio && (
                      <div className="flex items-center gap-1 h-5">
                        <span className="w-1 bg-[var(--accent-primary)] rounded-full wave-bar-1" />
                        <span className="w-1 bg-[var(--accent-primary)] rounded-full wave-bar-2" />
                        <span className="w-1 bg-[var(--accent-primary)] rounded-full wave-bar-3" />
                        <span className="w-1 bg-[var(--accent-primary)] rounded-full wave-bar-4" />
                      </div>
                    )}
                  </div>

                  <p className="text-base sm:text-[17px] text-[var(--text-main)] font-medium leading-relaxed mb-3.5">
                    {answer.spokenText}
                  </p>

                  {audioUrl ? (
                    <button
                      onClick={toggleAudio}
                      className="w-full h-12 min-h-[48px] px-4 rounded-xl bg-[var(--accent-primary)] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Square className="w-4 h-4 fill-white" />
                          <span>आवाज रोकें (Pause Audio)</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          <span>दोबारा सुनें (Replay in {speaker} voice) 🔊</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">
                      आवाज तैयार हो रही है...
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold text-[var(--text-main)] mb-3">
                  {answer.card.title}
                </h3>

                <div className="space-y-3">
                  {answer.card.benefits && answer.card.benefits.length > 0 && (
                    <div className="p-3.5 bg-[#E8F5E9]/70 rounded-2xl border border-[#A5D6A7]">
                      <div className="flex items-center gap-2 mb-1.5 text-[#1B5E20] font-extrabold text-sm">
                        <Gift className="w-4 h-4" />
                        <span>मिलने वाले लाभ (Benefits)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {answer.card.benefits.map((item, i) => (
                          <li key={i} className="text-sm sm:text-[15px] text-[var(--text-main)] flex items-start gap-2">
                            <span className="text-[#1B5E20] font-bold">✦</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {answer.card.eligibility && answer.card.eligibility.length > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[var(--border-card)]">
                      <div className="flex items-center gap-2 mb-1.5 text-[var(--pill-text)] font-extrabold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>पात्रता (Eligibility)</span>
                      </div>
                      <ul className="space-y-1.5">
                        {answer.card.eligibility.map((item, i) => (
                          <li key={i} className="text-sm sm:text-[15px] text-[var(--text-main)] flex items-start gap-2">
                            <span className="text-[var(--accent-primary)] font-bold">✔</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {answer.card.documents && answer.card.documents.length > 0 && (
                    <div className="p-3.5 bg-white rounded-2xl border border-[var(--border-card)]">
                      <div className="flex items-center gap-2 mb-2 text-amber-900 font-extrabold text-sm">
                        <FileText className="w-4 h-4" />
                        <span>जरूरी दस्तावेज (Documents)</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {answer.card.documents.map((doc, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold px-2.5 py-1 bg-[var(--pill-bg)] text-[var(--pill-text)] rounded-lg border border-[var(--pill-border)]"
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
            <div className="bg-[var(--bg-card)] rounded-3xl p-5 border-[1.5px] border-[var(--border-card)] shadow-2xs">
              <div className="flex items-center gap-2.5 mb-3">
                <PhoneCall className="w-5 h-5 text-[#1B5E20]" />
                <h4 className="text-base font-extrabold text-[var(--text-main)]">
                  निःशुल्क सरकारी हेल्पलाइन नंबर
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)] block">पीएम किसान हेल्पलाइन</span>
                  <strong className="text-sm text-[var(--text-main)]">📞 155261</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)] block">आयुष्मान भारत</span>
                  <strong className="text-sm text-[var(--text-main)]">📞 14555</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)] block">महिला हेल्पलाइन</span>
                  <strong className="text-sm text-[var(--text-main)]">📞 181</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-card)]">
                  <span className="text-[var(--text-muted)] block">सूर्य घर / सोलर</span>
                  <strong className="text-sm text-[var(--text-main)]">📞 15555</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Bottom Voice Bar (< lg screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/95 to-transparent pt-3 pb-4 px-4 z-40 flex flex-col items-center border-t border-[var(--border-card)]/60">
        <div className="flex items-center gap-4 w-full max-w-md justify-between bg-[var(--bg-card)] px-4 py-2.5 rounded-2xl border-2 border-[var(--border-card)] shadow-lg">
          <div className="flex-1">
            {micState === 'recording' ? (
              <span className="text-xs font-extrabold text-red-600 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                बोलें... {recordTimer}s (छोड़ें)
              </span>
            ) : micState === 'thinking' ? (
              <span className="text-xs font-extrabold text-amber-800">
                ⏳ Sarvam AI जवाब तैयार कर रहा है...
              </span>
            ) : micState === 'speaking' ? (
              <span className="text-xs font-extrabold text-[#1B5E20]">
                🔊 Bulbul ({speaker}) बोल रहा है...
              </span>
            ) : (
              <div>
                <p className="text-sm font-extrabold text-[var(--text-main)]">
                  बोलकर पूछें ({currentLangMeta.native})
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">8 भारतीय भाषाओं में उपलब्ध</p>
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
                : 'bg-[var(--accent-primary)] text-white'
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
