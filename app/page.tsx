'use client';

import React, { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import schemesData from '@/data/schemes.json';
import demoCache from '@/data/demo-cache.json';
import { audioBlobToWav } from '@/lib/audio';
import {
  CitizenProfile,
  CitizenOccupation,
  CitizenGender,
  CitizenArea,
  CitizenSocialCategory,
  DEFAULT_CITIZEN_PROFILE,
  CITIZEN_PROFILE_STORAGE_KEY,
  loadCitizenProfile,
  saveCitizenProfile,
  evaluateSchemeForCitizen,
} from '@/lib/citizen-profile';
import {
  SchemesRegisterIcon,
  CitizenProfileCheckIcon,
  DocumentFolderIcon,
  SchemeRealIcon,
  DocumentRealIcon,
} from '@/components/CivicIcons';
import { IntroSplash } from '@/components/IntroSplash';
import { UserManualModal } from '@/components/UserManualModal';
import { getT, SupportedLang } from '@/lib/translations';
import {
  Mic,
  Volume2,
  ChevronRight,
  CheckCircle2,
  FileText,
  Gift,
  Keyboard,
  X,
  RotateCcw,
  Sparkles,
  Square,
  PhoneCall,
  Loader2,
  AlertCircle,
  Upload,
  Palette,
  Languages,
  Cpu,
  BookOpen,
  SlidersHorizontal,
  Award,
} from 'lucide-react';

type MicState = 'idle' | 'recording' | 'thinking' | 'speaking';
type CategoryFilter = 'all' | 'farmer' | 'women' | 'health' | 'housing' | 'livelihood' | 'education';
type ActiveFeatureTab = 'schemes' | 'wizard' | 'doccheck';
type ThemeMode = 'theme-warmth' | 'theme-sovereign' | 'theme-daylight';
type SpeakerVoice = 'ritu' | 'priya' | 'aditya' | 'rohan';

interface ChatResponse {
  schemeId: string | null;
  schemeName: string;
  spokenAnswer: string;
  eligibility: string[];
  benefits: string[];
  documents: string[];
  officialLink: string;
  confidence: string;
  fallbackUsed?: boolean;
  demoCached?: boolean;
}

const LANG_OPTIONS: { id: SupportedLang; code: string; label: string; sub: string }[] = [
  { id: 'hi', code: 'hi-IN', label: 'हिन्दी', sub: 'Hindi' },
  { id: 'mr', code: 'mr-IN', label: 'मराठी', sub: 'Marathi' },
  { id: 'ta', code: 'ta-IN', label: 'தமிழ்', sub: 'Tamil' },
  { id: 'te', code: 'te-IN', label: 'తెలుగు', sub: 'Telugu' },
  { id: 'bn', code: 'bn-IN', label: 'বাংলা', sub: 'Bengali' },
  { id: 'gu', code: 'gu-IN', label: 'ગુજરાતી', sub: 'Gujarati' },
  { id: 'kn', code: 'kn-IN', label: 'ಕನ್ನಡ', sub: 'Kannada' },
  { id: 'en', code: 'en-IN', label: 'English', sub: 'English' },
];

const VOICE_OPTIONS: { id: SpeakerVoice; label: string; gender: string }[] = [
  { id: 'ritu', label: 'Ritu (Female)', gender: 'F' },
  { id: 'priya', label: 'Priya (Female)', gender: 'F' },
  { id: 'aditya', label: 'Aditya (Male)', gender: 'M' },
  { id: 'rohan', label: 'Rohan (Male)', gender: 'M' },
];

const DOC_OPTIONS = [
  { id: 'aadhaar', hi: 'आधार कार्ड', mr: 'आधार कार्ड', en: 'Aadhaar Card' },
  { id: 'bank', hi: 'बैंक पासबुक', mr: 'बँक पासबुक', en: 'Bank Passbook' },
  { id: 'ration', hi: 'राशन कार्ड', mr: 'रेशन कार्ड', en: 'Ration Card' },
  { id: 'land', hi: '7/12 जमीन कागज', mr: '7/12 जमीन उतारा', en: '7/12 Land Record' },
  { id: 'income', hi: 'आय प्रमाण पत्र', mr: 'उत्पन्नाचा दाखला', en: 'Income Certificate' },
  { id: 'mobile', hi: 'आधार लिंक मोबाइल', mr: 'आधार लिंक मोबाईल', en: 'Linked Mobile No.' },
  { id: 'caste', hi: 'जाति प्रमाण पत्र', mr: 'जात प्रमाणपत्र', en: 'Caste Certificate' },
  { id: 'photo', hi: 'पासपोर्ट फोटो', mr: 'पासपोर्ट फोटो', en: 'Passport Photo' },
];

const OCCUPATION_TILES: {
  id: CitizenOccupation;
  iconId: string;
  hi: string;
  mr: string;
  en: string;
}[] = [
  { id: 'farmer', iconId: 'tractor_harvest', hi: 'किसान / खेती', mr: 'शेतकरी / कृषी', en: 'Farmer / Agriculture' },
  { id: 'homemaker', iconId: 'women_empowerment', hi: 'गृहिणी / महिला', mr: 'गृहिणी / महिला', en: 'Homemaker / Woman' },
  { id: 'laborer', iconId: 'rural_work', hi: 'मजदूर / निर्माण श्रमिक', mr: 'मजूर / बांधकाम कामगार', en: 'Daily Wage Worker' },
  { id: 'vendor', iconId: 'street_cart', hi: 'रेहड़ी-पटरी / दुकानदार', mr: 'भाजीपाला / छोटा दुकानदार', en: 'Street Vendor / Shop' },
  { id: 'artisan', iconId: 'artisan_tools', hi: 'कारीगर / विश्वकर्मा', mr: 'कारागीर / विश्वकर्मा', en: 'Artisan / Craftsperson' },
  { id: 'student', iconId: 'graduation_cap', hi: 'छात्र / युवा', mr: 'विद्यार्थी / तरुण', en: 'Student / Youth' },
  { id: 'entrepreneur', iconId: 'mudra_bank', hi: 'स्वरोजगार / उद्यमी', mr: 'स्वयंरोजगार / उद्योजक', en: 'Micro-Business' },
  { id: 'senior', iconId: 'pension_shield', hi: 'वरिष्ठ नागरिक (60+)', mr: 'ज्येष्ठ नागरिक (60+)', en: 'Senior Citizen 60+' },
];

function SarkariEmblem() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0 rounded-2xl shadow-sm"
      aria-label="Sarkari Sahayak Emblem"
    >
      <rect width="64" height="64" rx="16" fill="#1E1E1E" />
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
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDemo = searchParams.get('demo') === '1';

  // Intro Splash & User Manual Modal states
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);

  // Theme, Language, Speaker, and Feature Tabs
  const [themeMode, setThemeMode] = useState<ThemeMode>('theme-warmth');
  const [lang, setLang] = useState<SupportedLang>('hi');
  const [speaker, setSpeaker] = useState<SpeakerVoice>('ritu');
  const [activeTab, setActiveTab] = useState<ActiveFeatureTab>('schemes');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [sortByProfileMatch, setSortByProfileMatch] = useState<boolean>(true);

  // Localized string dictionary helper
  const t = getT(lang);

  // Persistent Citizen Profile ("Character Build") stored in localStorage
  const [citizenProfile, setCitizenProfile] = useState<CitizenProfile>(DEFAULT_CITIZEN_PROFILE);

  // Live Sarvam Mayura translated strings for schemes when lang is ta/te/bn/gu/kn
  const [translatedMap, setTranslatedMap] = useState<
    Record<string, Record<string, { name: string; tagline: string; badge: string }>>
  >({});
  const [isTranslatingFeed, setIsTranslatingFeed] = useState(false);

  // Sarvam Active API Telemetry Badge for Judges
  const [lastSarvamCall, setLastSarvamCall] = useState<string>(
    'Ready: saaras:v3 (STT) • sarvam-105b (LLM) • mayura:v1 (Translate) • bulbul:v3 (TTS)'
  );

  // Voice & Chat states
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initialDemo);
  const [micState, setMicState] = useState<MicState>('idle');
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [answer, setAnswer] = useState<ChatResponse | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showTextInput, setShowTextInput] = useState<boolean>(false);
  const [textQuery, setTextQuery] = useState<string>('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Card / Manual quick-listen state
  const [playingCardId, setPlayingCardId] = useState<string | null>(null);
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null);

  // Eligibility Wizard AI explanation states
  const [wizAiAdvisory, setWizAiAdvisory] = useState<string>('');
  const [isGeneratingWizAi, setIsGeneratingWizAi] = useState(false);

  // Document Readiness Checker states
  const [docNoteText, setDocNoteText] = useState<string>('');
  const [docCheckResult, setDocCheckResult] = useState<any | null>(null);
  const [isCheckingDocs, setIsCheckingDocs] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const cardAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentLangObj = LANG_OPTIONS.find((l) => l.id === lang) || LANG_OPTIONS[0];

  // Load Citizen Profile from localStorage on mount & check intro session state
  useEffect(() => {
    const loaded = loadCitizenProfile();
    setCitizenProfile(loaded);

    const introSeen = sessionStorage.getItem('sarkari_sahayak_intro_seen_v2');
    if (introSeen === '1') {
      setShowIntro(false);
    }
  }, []);

  const handleCompleteIntro = () => {
    sessionStorage.setItem('sarkari_sahayak_intro_seen_v2', '1');
    setShowIntro(false);
  };

  const updateCitizenProfile = (patch: Partial<CitizenProfile>) => {
    setCitizenProfile((prev) => {
      const next = saveCitizenProfile({ ...prev, ...patch });
      return next;
    });
  };

  const handleResetProfile = () => {
    const fresh = saveCitizenProfile(DEFAULT_CITIZEN_PROFILE);
    setCitizenProfile(fresh);
  };

  useEffect(() => {
    if (searchParams.get('demo') === '1') {
      setIsDemoMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      if (cardAudioRef.current) cardAudioRef.current.pause();
    };
  }, []);

  // Evaluate all schemes against the stored Citizen Profile ("Character Build")
  const evaluatedSchemes = useMemo(() => {
    const map: Record<string, ReturnType<typeof evaluateSchemeForCitizen>> = {};
    for (const s of schemesData as any[]) {
      map[s.id] = evaluateSchemeForCitizen(s, citizenProfile);
    }
    return map;
  }, [citizenProfile]);

  // Translate scheme cards dynamically via Sarvam Mayura (mayura:v1) when user picks Tamil, Telugu, Bengali, Gujarati, or Kannada
  useEffect(() => {
    if (lang === 'hi' || lang === 'mr' || lang === 'en') return;
    if (translatedMap[lang]) return;

    const translateSchemesToIndic = async () => {
      try {
        setIsTranslatingFeed(true);
        setLastSarvamCall(`Calling Sarvam mayura:v1 (/api/translate) → ${currentLangObj.code}...`);
        const textsToTranslate: string[] = [];
        for (const s of schemesData as any[]) {
          textsToTranslate.push(s.name.en);
          textsToTranslate.push(s.tagline.en);
          textsToTranslate.push(s.benefitBadge?.en || s.benefits[0]);
        }

        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texts: textsToTranslate,
            sourceLanguageCode: 'en-IN',
            targetLanguageCode: currentLangObj.code,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const arr: string[] = data.translatedTexts || [];
          const langMap: Record<string, { name: string; tagline: string; badge: string }> = {};
          (schemesData as any[]).forEach((s, idx) => {
            const base = idx * 3;
            langMap[s.id] = {
              name: arr[base] || s.name.en,
              tagline: arr[base + 1] || s.tagline.en,
              badge: arr[base + 2] || s.benefitBadge?.en || s.benefits[0],
            };
          });
          setTranslatedMap((prev) => ({ ...prev, [lang]: langMap }));
          setLastSarvamCall(
            `Sarvam mayura:v1 translated ${schemesData.length} schemes to ${currentLangObj.code}`
          );
        }
      } catch (e) {
        console.error('Mayura feed translation error:', e);
      } finally {
        setIsTranslatingFeed(false);
      }
    };

    translateSchemesToIndic();
  }, [lang, currentLangObj.code, translatedMap]);

  const getSchemeDisplay = (scheme: any) => {
    if (lang === 'en') {
      return {
        name: scheme.name.en || scheme.name.hi,
        tagline: scheme.tagline.en || scheme.tagline.hi,
        badge: scheme.benefitBadge?.en || scheme.benefits[0],
      };
    }
    if (lang === 'mr') {
      return {
        name: scheme.name.mr || scheme.name.hi,
        tagline: scheme.tagline.mr || scheme.tagline.hi,
        badge: scheme.benefitBadge?.mr || scheme.benefitBadge?.hi || scheme.benefits[0],
      };
    }
    if (lang === 'hi') {
      return {
        name: scheme.name.hi,
        tagline: scheme.tagline.hi,
        badge: scheme.benefitBadge?.hi || scheme.benefits[0],
      };
    }
    const tTrans = translatedMap[lang]?.[scheme.id];
    return {
      name: tTrans?.name || scheme.name.en || scheme.name.hi,
      tagline: tTrans?.tagline || scheme.tagline.en || scheme.tagline.hi,
      badge: tTrans?.badge || scheme.benefitBadge?.en || scheme.benefits[0],
    };
  };

  const stopAllAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }
    if (cardAudioRef.current) {
      cardAudioRef.current.pause();
      setPlayingCardId(null);
    }
    if (micState === 'speaking') {
      setMicState('idle');
    }
  };

  const playAudioFromDataUrl = async (dataUrl: string) => {
    try {
      stopAllAudio();
      const audio = new Audio(dataUrl);
      audioPlayerRef.current = audio;
      setIsPlayingAudio(true);
      setMicState('speaking');

      audio.onended = () => {
        setIsPlayingAudio(false);
        setMicState('idle');
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setMicState('idle');
      };

      await audio.play();
    } catch (err) {
      console.warn('Autoplay blocked or failed:', err);
      setIsPlayingAudio(false);
      setMicState('idle');
    }
  };

  const speakAnyText = async (cardKey: string, spokenText: string) => {
    if (playingCardId === cardKey && cardAudioRef.current) {
      cardAudioRef.current.pause();
      setPlayingCardId(null);
      return;
    }

    try {
      stopAllAudio();
      setLoadingCardId(cardKey);
      setLastSarvamCall(
        `Calling Sarvam bulbul:v3 (/api/tts, speaker: ${speaker}, lang: ${currentLangObj.code})...`
      );

      let finalSpoken = spokenText;
      if (lang !== 'hi' && lang !== 'mr' && lang !== 'en') {
        const trRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: spokenText,
            sourceLanguageCode: 'en-IN',
            targetLanguageCode: currentLangObj.code,
          }),
        });
        if (trRes.ok) {
          const trData = await trRes.json();
          if (trData.translatedText) finalSpoken = trData.translatedText;
        }
      }

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: finalSpoken,
          languageCode: currentLangObj.code,
          speaker,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLastSarvamCall(
          `Sarvam bulbul:v3 audio ready (speaker: ${speaker}, ${currentLangObj.code})`
        );
        if (data.dataUrl) {
          const audio = new Audio(data.dataUrl);
          cardAudioRef.current = audio;
          setPlayingCardId(cardKey);
          audio.onended = () => setPlayingCardId(null);
          audio.onerror = () => setPlayingCardId(null);
          await audio.play();
        }
      }
    } catch (e) {
      console.error('TTS error:', e);
    } finally {
      setLoadingCardId(null);
    }
  };

  const handleCardListen = async (e: React.MouseEvent, scheme: any) => {
    e.stopPropagation();
    const disp = getSchemeDisplay(scheme);
    const benefitsList: string[] =
      scheme.benefitsI18n?.[lang === 'mr' || lang === 'en' ? lang : 'hi'] || scheme.benefits;
    const spokenSummary = `${disp.name}. ${disp.tagline}. ${benefitsList[0] || ''}`;
    await speakAnyText(scheme.id, spokenSummary);
  };

  const processQuery = async (userText: string, detectedLanguageCode?: string) => {
    setErrorBanner(null);
    setTranscript(userText);
    setMicState('thinking');
    setAudioDataUrl(null);
    stopAllAudio();

    const targetLangCode = detectedLanguageCode || currentLangObj.code;

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 450));
      const lower = userText.toLowerCase();
      const matchedEntry =
        (demoCache as any[]).find(
          (entry) =>
            lower.includes(entry.schemeId?.replace('-', ' ')) ||
            lower.includes(entry.query?.toLowerCase().slice(0, 10))
        ) || (demoCache as any[])[0];

      const cachedResponse: ChatResponse = {
        schemeId: matchedEntry.schemeId,
        schemeName: matchedEntry.card.title,
        spokenAnswer: matchedEntry.spokenText,
        eligibility: matchedEntry.card.eligibility,
        benefits: matchedEntry.card.benefits,
        documents: matchedEntry.card.documents,
        officialLink: 'https://www.myscheme.gov.in',
        confidence: 'high',
        demoCached: true,
      };
      setAnswer(cachedResponse);
      setLastSarvamCall(
        `Demo Cache matched → Calling Sarvam bulbul:v3 (${speaker}) for audio...`
      );

      try {
        const ttsRes = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cachedResponse.spokenAnswer,
            languageCode: targetLangCode,
            speaker,
          }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json();
          if (ttsData.dataUrl) {
            setAudioDataUrl(ttsData.dataUrl);
            await playAudioFromDataUrl(ttsData.dataUrl);
            return;
          }
        }
      } catch {
        // ignore TTS failure in demo mode
      }
      setMicState('idle');
      return;
    }

    try {
      setLastSarvamCall(
        `Calling Sarvam sarvam-105b-conversations (/api/chat) in ${targetLangCode}...`
      );
      const chatRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: userText,
          language: targetLangCode,
        }),
      });

      if (!chatRes.ok) {
        throw new Error('Chat request failed');
      }

      const chatData: ChatResponse = await chatRes.json();
      setAnswer(chatData);

      if (chatData.spokenAnswer) {
        try {
          setLastSarvamCall(
            `Calling Sarvam bulbul:v3 (/api/tts, speaker: ${speaker}) for spoken response...`
          );
          const ttsRes = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: chatData.spokenAnswer,
              languageCode: targetLangCode,
              speaker,
            }),
          });

          if (ttsRes.ok) {
            const ttsData = await ttsRes.json();
            setLastSarvamCall(
              `Completed pipeline: saaras:v3 → sarvam-105b-conversations → bulbul:v3 (${speaker})`
            );
            if (ttsData.dataUrl) {
              setAudioDataUrl(ttsData.dataUrl);
              await playAudioFromDataUrl(ttsData.dataUrl);
              return;
            }
          }
        } catch (ttsErr) {
          console.warn('TTS failed, showing text only:', ttsErr);
        }
      }

      setMicState('idle');
    } catch (err) {
      console.error('Query error:', err);
      setErrorBanner(
        lang === 'en'
          ? 'Network busy. You can type your question below as well.'
          : 'नेटवर्क व्यस्त है। आप नीचे अपनी बात लिखकर भी पूछ सकते हैं।'
      );
      setShowTextInput(true);
      setMicState('idle');
    }
  };

  const startRecording = async () => {
    if (micState === 'thinking') return;
    stopAllAudio();
    setErrorBanner(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);

        const rawBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        if (rawBlob.size < 800) {
          setMicState('idle');
          setErrorBanner(
            lang === 'en'
              ? 'Voice was too short. Please hold the mic and speak a little longer.'
              : 'आवाज बहुत छोटी थी। कृपया माइक दबाकर थोड़ा लंबा बोलें।'
          );
          return;
        }

        setMicState('thinking');
        try {
          setLastSarvamCall(
            'Calling Sarvam saaras:v3 (/api/stt) for code-mixed speech recognition...'
          );
          let uploadBlob = rawBlob;
          try {
            uploadBlob = await audioBlobToWav(rawBlob);
          } catch (convErr) {
            console.warn('WAV conversion fallback to raw blob:', convErr);
          }

          const formData = new FormData();
          formData.append('audio', uploadBlob, 'speech.wav');

          const sttRes = await fetch('/api/stt', {
            method: 'POST',
            body: formData,
          });

          if (!sttRes.ok) {
            throw new Error('STT failed');
          }

          const sttData = await sttRes.json();
          const userTranscript = sttData.transcript?.trim();

          if (!userTranscript) {
            setMicState('idle');
            setErrorBanner(
              lang === 'en'
                ? 'Could not hear voice clearly. Please speak again or type below.'
                : 'आवाज साफ नहीं सुनाई दी। कृपया फिर से बोलें या टाइप करें।'
            );
            setShowTextInput(true);
            return;
          }

          setLastSarvamCall(
            `Sarvam saaras:v3 transcribed (${sttData.languageCode || 'hi-IN'}): "${userTranscript}"`
          );
          await processQuery(userTranscript, sttData.languageCode || currentLangObj.code);
        } catch (err) {
          console.error('STT processing error:', err);
          setMicState('idle');
          setErrorBanner(
            lang === 'en'
              ? 'Voice recognition failed. Please type your question below.'
              : 'माइक से आवाज समझने में समस्या हुई। कृपया नीचे टाइप करके पूछें।'
          );
          setShowTextInput(true);
        }
      };

      mediaRecorder.start();
      setMicState('recording');
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 10) {
            stopRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission denied or unavailable:', err);
      setErrorBanner(
        lang === 'en'
          ? 'Microphone access was denied. Please type your question below.'
          : 'माइक की अनुमति नहीं मिली। कृपया नीचे अपने सवाल टाइप करें।'
      );
      setShowTextInput(true);
      setMicState('idle');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textQuery.trim()) return;
    const q = textQuery.trim();
    setTextQuery('');
    await processQuery(q);
  };

  // Filtered and optionally profile-sorted schemes
  const filteredSchemes = useMemo(() => {
    const base = (schemesData as any[]).filter((s) =>
      categoryFilter === 'all' ? true : s.category === categoryFilter
    );
    if (!sortByProfileMatch) return base;
    return [...base].sort((a, b) => {
      const scoreA = evaluatedSchemes[a.id]?.matchScore || 0;
      const scoreB = evaluatedSchemes[b.id]?.matchScore || 0;
      return scoreB - scoreA;
    });
  }, [categoryFilter, sortByProfileMatch, evaluatedSchemes]);

  // Top matched schemes for the Citizen Profile / Eligibility Wizard
  const wizardMatchedSchemes = useMemo(() => {
    return [...(schemesData as any[])]
      .sort((a, b) => {
        const scoreA = evaluatedSchemes[a.id]?.matchScore || 0;
        const scoreB = evaluatedSchemes[b.id]?.matchScore || 0;
        return scoreB - scoreA;
      })
      .filter((s) => (evaluatedSchemes[s.id]?.matchScore || 0) >= 60);
  }, [evaluatedSchemes]);

  const handleGenerateWizardAiAdvisory = async () => {
    try {
      setIsGeneratingWizAi(true);
      setLastSarvamCall(
        'Calling Sarvam sarvam-105b-conversations for personalized Citizen Profile eligibility advisory...'
      );
      const profilePrompt =
        lang === 'en'
          ? `My Citizen Profile: Occupation ${citizenProfile.occupation}, Age ${citizenProfile.age} years, Gender ${citizenProfile.gender}, Annual family income Rs ${citizenProfile.annualIncome}, Region ${citizenProfile.area}, State ${citizenProfile.state}. Which government welfare schemes am I best eligible for and how do I apply?`
          : `मेरी नागरिक प्रोफ़ाइल: पेशा ${citizenProfile.occupation}, आयु ${citizenProfile.age} वर्ष, लिंग ${citizenProfile.gender}, वार्षिक आय ₹${citizenProfile.annualIncome}, क्षेत्र ${citizenProfile.area}, राज्य ${citizenProfile.state}। मेरे लिए सबसे अच्छी सरकारी योजनाएं कौन सी हैं?`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: profilePrompt,
          language: currentLangObj.code,
        }),
      });

      if (res.ok) {
        const data: ChatResponse = await res.json();
        setWizAiAdvisory(data.spokenAnswer);
        await speakAnyText('wizard-advisory', data.spokenAnswer);
      }
    } catch (e) {
      console.error('Wizard AI error:', e);
    } finally {
      setIsGeneratingWizAi(false);
    }
  };

  // Toggle owned document & persist in Citizen Profile
  const toggleDoc = (docId: string) => {
    const exists = citizenProfile.ownedDocs.includes(docId);
    const nextDocs = exists
      ? citizenProfile.ownedDocs.filter((d) => d !== docId)
      : [...citizenProfile.ownedDocs, docId];
    updateCitizenProfile({ ownedDocs: nextDocs });
  };

  const runDocReadinessCheck = async () => {
    try {
      setIsCheckingDocs(true);
      setLastSarvamCall(
        `Calling /api/doc-check + Sarvam mayura:v1 (${currentLangObj.code}) to verify document readiness...`
      );
      const res = await fetch('/api/doc-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownedDocs: citizenProfile.ownedDocs,
          uploadedNoteText: docNoteText,
          targetLanguageCode: currentLangObj.code,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDocCheckResult(data);
        setLastSarvamCall(
          `Document Readiness verified (${data.readySchemes?.length || 0} ready, ${
            data.almostReadySchemes?.length || 0
          } almost ready) • Translated via ${data.modelUsed}`
        );
      }
    } catch (e) {
      console.error('Doc check error:', e);
    } finally {
      setIsCheckingDocs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'doccheck') {
      runDocReadinessCheck();
    }
  }, [activeTab, citizenProfile.ownedDocs, lang]);

  const handleDocFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const baseName = file.name.toLowerCase();
    let inferred = `Uploaded file: ${file.name}. `;
    if (baseName.includes('aadhar') || baseName.includes('aadhaar')) inferred += 'aadhaar card ';
    if (baseName.includes('ration')) inferred += 'ration card ';
    if (baseName.includes('bank') || baseName.includes('passbook')) inferred += 'bank passbook ';
    if (baseName.includes('7-12') || baseName.includes('satbara') || baseName.includes('land'))
      inferred += '7/12 land ';
    if (baseName.includes('income')) inferred += 'income certificate ';

    setDocNoteText((prev) => `${prev} ${inferred}`.trim());
    setTimeout(() => runDocReadinessCheck(), 200);
  };

  return (
    <div className={`${themeMode} min-h-screen flex flex-col justify-between transition-colors duration-200`}>
      {/* 3D Perspective Starting Intro Splash Animation */}
      {showIntro && (
        <IntroSplash forceOpen={showIntro} onComplete={handleCompleteIntro} />
      )}

      {/* Interactive User Manual & Database Guide Modal */}
      <UserManualModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        profile={citizenProfile}
        onResetProfile={handleResetProfile}
        onPlayManualAudio={(text) => speakAnyText('user-manual-audio', text)}
        isPlayingAudio={playingCardId === 'user-manual-audio'}
        isLoadingAudio={loadingCardId === 'user-manual-audio'}
        onReplayIntro={() => setShowIntro(true)}
        lang={lang}
      />

      {/* Top Tricolor Accent Ribbon */}
      <div className="h-1.5 w-full tricolor-ribbon sticky top-0 z-40" />

      {/* Top Sticky Navigation Header */}
      <header className="sticky top-1.5 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6D7C3]">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-2.5">
          {/* Row 1: Brand + User Manual Button + Theme Switcher + Voice Persona */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowIntro(true)}
                title="Replay 3D Intro Animation"
                className="hover:scale-105 transition-transform"
              >
                <SarkariEmblem />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1E1E1E] leading-none">
                    {lang === 'en' ? 'Sarkari Sahayak' : 'सरकारी सहायक'}
                  </h1>
                  <span className="text-xs sm:text-sm font-bold text-saffron bg-[#FFF3E0] px-2.5 py-0.5 rounded-lg border border-[#FFE0B2]">
                    {lang === 'en' ? 'Civic Voice Portal' : 'Sarkari Sahayak'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#545454] font-medium mt-1">
                  {t.brandTagline(schemesData.length)}
                </p>
              </div>
            </div>

            {/* Action Bar: User Manual Button + Theme Switcher + Voice Selector */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Interactive User Manual Button */}
              <button
                onClick={() => setIsManualOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-[#172554] text-white text-xs sm:text-sm font-extrabold flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <BookOpen className="w-4 h-4 text-amber-300" />
                <span>{t.userManualBtn}</span>
              </button>

              {/* Stitch-Assessed 3-Theme Switcher */}
              <div className="flex items-center bg-white rounded-xl p-1 border border-[#E6D7C3] shadow-2xs">
                <Palette className="w-4 h-4 text-saffron ml-1.5 mr-1 hidden sm:block" />
                {[
                  { id: 'theme-warmth', label: t.themeWarmth },
                  { id: 'theme-sovereign', label: t.themeSovereign },
                  { id: 'theme-daylight', label: t.themeDaylight },
                ].map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => setThemeMode(thm.id as ThemeMode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all ${
                      themeMode === thm.id
                        ? 'bg-saffron text-white shadow-2xs'
                        : 'text-[#545454] hover:text-[#1E1E1E]'
                    }`}
                  >
                    {thm.label}
                  </button>
                ))}
              </div>

              {/* Bulbul v3 Voice Persona Selector */}
              <div className="flex items-center bg-white rounded-xl px-2.5 py-1 border border-[#E6D7C3] shadow-2xs gap-1.5">
                <Volume2 className="w-4 h-4 text-[#1B5E20]" />
                <span className="text-[11px] font-bold text-[#545454]">{t.voiceLabel}</span>
                <select
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value as SpeakerVoice)}
                  aria-label="Select Sarvam Bulbul TTS Voice"
                  className="text-xs font-extrabold text-[#1E1E1E] bg-transparent focus:outline-none cursor-pointer"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: 8-Language Sarvam Mayura Bar + Active Sarvam Model Telemetry */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-[#E6D7C3]/60">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1E1E1E] mr-1 shrink-0">
                <Languages className="w-4 h-4 text-saffron" />
                {t.langLabel}
              </span>
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLang(l.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    lang === l.id
                      ? 'bg-saffron text-white shadow-xs'
                      : 'bg-white text-[#545454] border border-[#E6D7C3] hover:border-saffron'
                  }`}
                >
                  {l.label}
                </button>
              ))}
              {isTranslatingFeed && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-saffron ml-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mayura Translating...
                </span>
              )}
            </div>

            {/* Live Sarvam AI Telemetry Pill for Hackathon Judges */}
            <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-amber-300 text-[11px] font-mono font-semibold shadow-2xs max-w-md truncate">
              <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">{lastSarvamCall}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
        {/* 3 Real-Life Illustrated Primary Feature Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <button
            onClick={() => setActiveTab('schemes')}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
              activeTab === 'schemes'
                ? 'bg-saffron text-white border-saffron shadow-md'
                : 'bg-[#FFFDF9] text-[#1E1E1E] border-[#E6D7C3] hover:border-saffron'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                activeTab === 'schemes' ? 'bg-white/20' : 'bg-[#FFF3E0]'
              }`}
            >
              <SchemesRegisterIcon className="w-11 h-11" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold leading-snug">
                {t.tabSchemesTitle(schemesData.length)}
              </div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  activeTab === 'schemes' ? 'text-white/90' : 'text-[#545454]'
                }`}
              >
                {t.tabSchemesSub}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
              activeTab === 'wizard'
                ? 'bg-saffron text-white border-saffron shadow-md'
                : 'bg-[#FFFDF9] text-[#1E1E1E] border-[#E6D7C3] hover:border-saffron'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                activeTab === 'wizard' ? 'bg-white/20' : 'bg-[#E8F5E9]'
              }`}
            >
              <CitizenProfileCheckIcon className="w-11 h-11" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold leading-snug">
                {t.tabWizardTitle}
              </div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  activeTab === 'wizard' ? 'text-white/90' : 'text-[#545454]'
                }`}
              >
                {t.tabWizardSub}
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('doccheck')}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
              activeTab === 'doccheck'
                ? 'bg-saffron text-white border-saffron shadow-md'
                : 'bg-[#FFFDF9] text-[#1E1E1E] border-[#E6D7C3] hover:border-saffron'
            }`}
          >
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                activeTab === 'doccheck' ? 'bg-white/20' : 'bg-[#FFF3E0]'
              }`}
            >
              <DocumentFolderIcon className="w-11 h-11" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold leading-snug">
                {t.tabDocCheckTitle}
              </div>
              <div
                className={`text-xs font-semibold mt-0.5 ${
                  activeTab === 'doccheck' ? 'text-white/90' : 'text-[#545454]'
                }`}
              >
                {t.tabDocCheckSub}
              </div>
            </div>
          </button>
        </div>

        {/* Main 12-Col Responsive Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* LEFT COLUMN (7 Cols on Laptop): Active Feature Content */}
          <div className="lg:col-span-7 order-2 lg:order-1 space-y-5">
            {/* Voice / Chat Answer Card when user asks a question */}
            {answer && (
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border-2 border-saffron shadow-md space-y-5 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.answerVerifiedBadge} {answer.demoCached ? '• (Demo)' : ''}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] mt-2">
                      {answer.schemeName}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      stopAllAudio();
                      setAnswer(null);
                      setTranscript('');
                    }}
                    className="p-2 text-[#545454] hover:text-[#1E1E1E] rounded-full hover:bg-[#FAF7F2]"
                    aria-label="Close answer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {transcript && (
                  <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#E6D7C3]">
                    <p className="text-xs font-bold text-[#545454] mb-0.5">
                      {t.youAsked}
                    </p>
                    <p className="text-base font-bold text-[#1E1E1E]">&ldquo;{transcript}&rdquo;</p>
                  </div>
                )}

                <div className="bg-[#FFF3E0]/70 rounded-2xl p-4 border border-[#FFE0B2]">
                  <p className="text-base sm:text-lg font-semibold leading-relaxed text-[#1E1E1E]">
                    {answer.spokenAnswer}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#FFE0B2]">
                    {isPlayingAudio ? (
                      <div className="flex items-center gap-2 text-saffron font-bold text-sm">
                        <div className="flex items-end gap-1 h-5">
                          <span className="w-1 bg-saffron rounded-full eq-bar-1" />
                          <span className="w-1 bg-saffron rounded-full eq-bar-2" />
                          <span className="w-1 bg-saffron rounded-full eq-bar-3" />
                          <span className="w-1 bg-saffron rounded-full eq-bar-4" />
                        </div>
                        <span>Bulbul v3 ({speaker}) speaking...</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-[#545454]">
                        {t.voicePoweredBy(speaker)}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {isPlayingAudio ? (
                        <button
                          onClick={stopAllAudio}
                          className="h-10 px-4 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>{t.stopBtn}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            audioDataUrl
                              ? playAudioFromDataUrl(audioDataUrl)
                              : speakAnyText('answer-replay', answer.spokenAnswer)
                          }
                          className="h-10 px-4 rounded-xl bg-saffron text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>{t.replayAudio}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Benefits / Eligibility / Docs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-[#E8F5E9]/70 border border-[#C8E6C9] p-4">
                    <div className="flex items-center gap-2 text-[#1B5E20] font-extrabold text-sm mb-2">
                      <Gift className="w-4 h-4" />
                      <span>{t.keyBenefits}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {answer.benefits.map((item, idx) => (
                        <li key={idx} className="text-sm text-[#1E1E1E] flex items-start gap-2">
                          <span className="text-[#1B5E20] font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] p-4">
                    <div className="flex items-center gap-2 text-saffron font-extrabold text-sm mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.eligibilityCriteria}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {answer.eligibility.map((item, idx) => (
                        <li key={idx} className="text-sm text-[#1E1E1E] flex items-start gap-2">
                          <span className="text-saffron font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {answer.schemeId && (
                  <button
                    onClick={() => router.push(`/scheme/${answer.schemeId}`)}
                    className="w-full h-12 rounded-2xl bg-[#1E1E1E] hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <span>{t.viewCompleteGuide}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* ==================== TAB 1: ALL WELFARE SCHEMES ==================== */}
            {activeTab === 'schemes' && (
              <div className="space-y-5">
                {/* Active Citizen Profile Summary Banner */}
                <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E6D7C3] flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <CitizenProfileCheckIcon className="w-10 h-10 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black uppercase tracking-wider text-[#1B5E20]">
                          {t.profileBannerTitle}
                        </span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-[#FFF3E0] text-[#E65100]">
                          {citizenProfile.occupation.toUpperCase()} • {citizenProfile.age} {t.yearsSuffix} • ₹
                          {(citizenProfile.annualIncome / 100000).toFixed(1)}L {t.incomeLabel} •{' '}
                          {citizenProfile.ownedDocs.length} {t.docsLabel}
                        </span>
                      </div>
                      <p className="text-xs text-[#545454] mt-0.5">
                        {t.profileBannerExpl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSortByProfileMatch(!sortByProfileMatch)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 ${
                        sortByProfileMatch
                          ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]'
                          : 'bg-white text-[#545454] border-[#E6D7C3]'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{sortByProfileMatch ? t.sortedByMatch : t.defaultOrder}</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('wizard')}
                      className="px-3 py-1.5 rounded-xl bg-saffron text-white text-xs font-extrabold hover:bg-saffron-600 transition-colors"
                    >
                      {t.editProfile}
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                  {[
                    { id: 'all', label: t.catAll(schemesData.length), iconId: 'all' },
                    { id: 'farmer', label: t.catFarmer(schemesData.filter((s: any) => s.category === 'farmer').length), iconId: 'tractor_harvest' },
                    { id: 'women', label: t.catWomen(schemesData.filter((s: any) => s.category === 'women').length), iconId: 'women_empowerment' },
                    { id: 'health', label: t.catHealth(schemesData.filter((s: any) => s.category === 'health').length), iconId: 'hospital_shield' },
                    { id: 'housing', label: t.catHousing(schemesData.filter((s: any) => s.category === 'housing').length), iconId: 'brick_home' },
                    { id: 'livelihood', label: t.catLivelihood(schemesData.filter((s: any) => s.category === 'livelihood').length), iconId: 'artisan_tools' },
                    { id: 'education', label: t.catEducation(schemesData.filter((s: any) => s.category === 'education').length), iconId: 'graduation_cap' },
                  ].map((cat) => {
                    const active = categoryFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setCategoryFilter(cat.id as CategoryFilter)}
                        className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all flex items-center gap-2 border ${
                          active
                            ? 'bg-saffron text-white border-saffron shadow-xs'
                            : 'bg-[#FFFDF9] text-[#1E1E1E] border-[#E6D7C3] hover:border-saffron'
                        }`}
                      >
                        {cat.id !== 'all' && (
                          <SchemeRealIcon iconId={cat.iconId} className="w-5 h-5" />
                        )}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Scheme Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredSchemes.map((scheme: any) => {
                    const disp = getSchemeDisplay(scheme);
                    const isCardPlaying = playingCardId === scheme.id;
                    const isCardLoading = loadingCardId === scheme.id;
                    const matchInfo = evaluatedSchemes[scheme.id];

                    return (
                      <div
                        key={scheme.id}
                        onClick={() => router.push(`/scheme/${scheme.id}`)}
                        className="group cursor-pointer bg-[#FFFDF9] rounded-3xl p-5 border-[1.5px] border-[#E6D7C3] hover:border-saffron shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                      >
                        <div>
                          {/* Top Row: Real-Life Tactile Vector Icon + Profile Match % Pill */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="w-14 h-14 rounded-2xl bg-[#FFF8EE] border border-[#FFE0B2] flex items-center justify-center p-1.5 shrink-0 shadow-2xs">
                              <SchemeRealIcon
                                iconId={scheme.iconId}
                                category={scheme.category}
                                className="w-11 h-11"
                              />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {matchInfo && (
                                <span
                                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${
                                    matchInfo.matchScore >= 80
                                      ? 'bg-[#E8F5E9] text-[#1B5E20] border-[#A5D6A7]'
                                      : matchInfo.matchScore >= 60
                                      ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                                      : 'bg-slate-100 text-slate-600 border-slate-300'
                                  }`}
                                >
                                  {t.profileMatchPill(matchInfo.matchScore)}
                                </span>
                              )}
                              {scheme.helpline && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#545454]">
                                  <PhoneCall className="w-3 h-3 text-saffron" />
                                  {scheme.helpline}
                                </span>
                              )}
                            </div>
                          </div>

                          <h3 className="text-lg font-extrabold text-[#1E1E1E] group-hover:text-saffron transition-colors leading-snug">
                            {disp.name}
                          </h3>
                          <p className="text-sm text-[#545454] mt-1.5 leading-relaxed line-clamp-2">
                            {disp.tagline}
                          </p>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-3 border-t border-[#E6D7C3]/80 space-y-2.5">
                          <div className="w-full px-3 py-2 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-extrabold flex items-center gap-2">
                            <Gift className="w-4 h-4 shrink-0" />
                            <span className="truncate">{disp.badge}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={(e) => handleCardListen(e, scheme)}
                              className={`h-10 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                                isCardPlaying
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-[#FFF3E0] hover:bg-[#FFE0B2] text-[#E65100] border-[#FFE0B2]'
                              }`}
                            >
                              {isCardLoading ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isCardPlaying ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>{t.stopBtn}</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 className="w-3.5 h-3.5" />
                                  <span>{t.listenBtn(speaker)}</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/scheme/${scheme.id}`);
                              }}
                              className="h-10 px-3 rounded-xl bg-[#FAF7F2] hover:bg-saffron hover:text-white text-[#1E1E1E] border border-[#E6D7C3] font-extrabold text-xs flex items-center justify-center gap-1 transition-all"
                            >
                              <span>{t.fullDetailsBtn}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================== TAB 2: CITIZEN PROFILE ("CHARACTER BUILD") & ELIGIBILITY WIZARD ==================== */}
            {activeTab === 'wizard' && (
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border-2 border-[#E6D7C3] shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6D7C3] pb-4">
                  <div className="flex items-center gap-3">
                    <CitizenProfileCheckIcon className="w-12 h-12" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E]">
                          {t.wizTitle}
                        </h2>
                      </div>
                      <p className="text-xs sm:text-sm text-[#545454]">
                        {t.wizSub(schemesData.length)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleResetProfile}
                    className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E6D7C3] text-xs font-extrabold text-[#545454] hover:text-red-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t.resetProfile}</span>
                  </button>
                </div>

                {/* Step 1: Occupation Selection with Real-Life SVG Icons */}
                <div>
                  <label className="block text-sm font-extrabold text-[#1E1E1E] mb-2.5">
                    {t.wizOccupation}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {OCCUPATION_TILES.map((occ) => {
                      const selected = citizenProfile.occupation === occ.id;
                      return (
                        <button
                          key={occ.id}
                          onClick={() => updateCitizenProfile({ occupation: occ.id })}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col items-start gap-2 ${
                            selected
                              ? 'bg-[#FFF3E0] border-saffron shadow-xs'
                              : 'bg-[#FAF7F2] border-[#E6D7C3] hover:border-saffron'
                          }`}
                        >
                          <SchemeRealIcon iconId={occ.iconId} className="w-9 h-9" />
                          <div>
                            <div className="text-xs sm:text-sm font-extrabold text-[#1E1E1E]">
                              {lang === 'en' ? occ.en : lang === 'mr' ? occ.mr : occ.hi}
                            </div>
                            <div className="text-[11px] text-[#545454] font-medium">
                              {lang === 'en' ? occ.hi : occ.en}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Age, Gender & Social Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Gender */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3]">
                    <label className="block text-xs font-extrabold text-[#1E1E1E] mb-2">
                      {t.wizGender}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'female', label: t.genderFemale },
                        { id: 'male', label: t.genderMale },
                      ].map((g) => (
                        <button
                          key={g.id}
                          onClick={() => updateCitizenProfile({ gender: g.id as CitizenGender })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                            citizenProfile.gender === g.id
                              ? 'bg-saffron text-white border-saffron'
                              : 'bg-white text-[#1E1E1E] border-[#E6D7C3]'
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Preset / Slider */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3]">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-extrabold text-[#1E1E1E]">
                        {t.wizAge}
                      </label>
                      <span className="text-xs font-black text-saffron">
                        {citizenProfile.age} {t.yearsSuffix}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={80}
                      value={citizenProfile.age}
                      onChange={(e) =>
                        updateCitizenProfile({ age: parseInt(e.target.value, 10) })
                      }
                      className="w-full accent-[#F57C00] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-[#545454] mt-1">
                      <button onClick={() => updateCitizenProfile({ age: 20 })}>{t.ageYouth}</button>
                      <button onClick={() => updateCitizenProfile({ age: 35 })}>{t.ageAdult}</button>
                      <button onClick={() => updateCitizenProfile({ age: 65, occupation: 'senior' })}>
                        {t.ageSenior}
                      </button>
                    </div>
                  </div>

                  {/* Social Category */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3]">
                    <label className="block text-xs font-extrabold text-[#1E1E1E] mb-2">
                      {t.wizCategory}
                    </label>
                    <select
                      value={citizenProfile.socialCategory}
                      onChange={(e) =>
                        updateCitizenProfile({
                          socialCategory: e.target.value as CitizenSocialCategory,
                        })
                      }
                      className="w-full h-9 px-2.5 rounded-xl bg-white border border-[#E6D7C3] text-xs font-extrabold text-[#1E1E1E]"
                    >
                      <option value="obc">OBC (Other Backward Classes)</option>
                      <option value="sc_st">SC / ST (Scheduled Caste / Tribe)</option>
                      <option value="general">General / EWS</option>
                      <option value="minority">Minority</option>
                      <option value="divyang">Divyangjan (Persons with Disabilities)</option>
                    </select>
                  </div>
                </div>

                {/* Step 3: Annual Family Income & Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3]">
                    <label className="block text-xs font-extrabold text-[#1E1E1E] mb-2">
                      {t.wizIncome}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 80000, label: t.incBelow1L },
                        { val: 180000, label: t.inc1To25L },
                        { val: 450000, label: t.inc25To6L },
                        { val: 750000, label: t.incAbove6L },
                      ].map((inc) => (
                        <button
                          key={inc.val}
                          onClick={() => updateCitizenProfile({ annualIncome: inc.val })}
                          className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                            citizenProfile.annualIncome === inc.val
                              ? 'bg-[#1B5E20] text-white border-[#1B5E20]'
                              : 'bg-white text-[#1E1E1E] border-[#E6D7C3]'
                          }`}
                        >
                          {inc.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3]">
                    <label className="block text-xs font-extrabold text-[#1E1E1E] mb-2">
                      {t.wizRegion}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          updateCitizenProfile({
                            state: citizenProfile.state === 'maharashtra' ? 'all' : 'maharashtra',
                          })
                        }
                        className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border ${
                          citizenProfile.state === 'maharashtra'
                            ? 'bg-saffron text-white border-saffron'
                            : 'bg-white text-[#1E1E1E] border-[#E6D7C3]'
                        }`}
                      >
                        {citizenProfile.state === 'maharashtra' ? t.stateMh : t.stateOther}
                      </button>

                      <button
                        onClick={() =>
                          updateCitizenProfile({
                            area: citizenProfile.area === 'rural' ? 'urban' : 'rural',
                          })
                        }
                        className="py-2 px-2.5 rounded-xl text-xs font-extrabold border bg-white text-[#1E1E1E] border-[#E6D7C3] hover:border-saffron"
                      >
                        {citizenProfile.area === 'rural' ? t.areaRural : t.areaUrban}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Matched Schemes Output */}
                <div className="pt-4 border-t-2 border-[#E6D7C3] space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[#1B5E20] font-extrabold text-base sm:text-lg">
                      <Award className="w-6 h-6" />
                      <span>{t.matchedSchemesHeading(wizardMatchedSchemes.length)}</span>
                    </div>

                    <button
                      onClick={handleGenerateWizardAiAdvisory}
                      disabled={isGeneratingWizAi}
                      className="px-4 py-2 rounded-xl bg-saffron hover:bg-saffron-600 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
                    >
                      {isGeneratingWizAi ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{t.generatingAdvice}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>{t.listenAiAdvice}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {wizAiAdvisory && (
                    <div className="p-4 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] text-sm sm:text-base font-bold text-[#1E1E1E] leading-relaxed">
                      <span className="text-xs font-extrabold uppercase text-saffron block mb-1">
                        {t.aiAdviceTitle}
                      </span>
                      {wizAiAdvisory}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {wizardMatchedSchemes.slice(0, 8).map((s: any) => {
                      const disp = getSchemeDisplay(s);
                      const m = evaluatedSchemes[s.id];
                      return (
                        <div
                          key={s.id}
                          onClick={() => router.push(`/scheme/${s.id}`)}
                          className="p-4 rounded-2xl bg-[#FAF7F2] border-2 border-[#A5D6A7] hover:border-[#1B5E20] cursor-pointer transition-all flex flex-col justify-between gap-2.5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white border border-[#E6D7C3] flex items-center justify-center p-1 shrink-0">
                              <SchemeRealIcon iconId={s.iconId} category={s.category} className="w-9 h-9" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-[11px] font-black px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20]">
                                  {t.profileMatchPill(m.matchScore)}
                                </span>
                                <span className="text-[11px] font-bold text-[#545454]">
                                  {t.docsCount(m.docsReadyCount, m.docsTotalCount)}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-sm sm:text-base text-[#1E1E1E] mt-1 truncate">
                                {disp.name}
                              </h4>
                              <p className="text-xs font-bold text-[#1B5E20] mt-0.5">{disp.badge}</p>
                            </div>
                          </div>

                          {/* Matched Reason Chips */}
                          <div className="flex flex-wrap gap-1 pt-2 border-t border-[#E6D7C3]/60">
                            {m.matchedFactors.slice(0, 3).map((reason, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E6D7C3] text-[#1E1E1E]"
                              >
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================== TAB 3: DOCUMENT READINESS CHECKER ==================== */}
            {activeTab === 'doccheck' && (
              <div className="bg-[#FFFDF9] rounded-3xl p-6 border-2 border-[#E6D7C3] shadow-sm space-y-6">
                <div className="flex items-center gap-3 border-b border-[#E6D7C3] pb-4">
                  <DocumentFolderIcon className="w-12 h-12 shrink-0" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E]">
                      {t.docCheckTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#545454] mt-0.5">
                      {t.docCheckSub}
                    </p>
                  </div>
                </div>

                {/* Step A: Multi-select Document Grid with Real-Life SVG Document Icons */}
                <div>
                  <p className="text-sm font-extrabold text-[#1E1E1E] mb-3">
                    {t.docStep1}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {DOC_OPTIONS.map((doc) => {
                      const isSelected = citizenProfile.ownedDocs.includes(doc.id);
                      return (
                        <button
                          key={doc.id}
                          onClick={() => toggleDoc(doc.id)}
                          className={`p-3 rounded-2xl border-2 text-left transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'bg-[#E8F5E9] border-[#1B5E20] text-[#1B5E20] shadow-2xs'
                              : 'bg-[#FAF7F2] border-[#E6D7C3] text-[#545454] hover:border-saffron'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <DocumentRealIcon docId={doc.id} className="w-9 h-9" />
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected
                                  ? 'bg-[#1B5E20] text-white'
                                  : 'bg-white border border-[#E6D7C3]'
                              }`}
                            >
                              {isSelected ? '✓' : ''}
                            </span>
                          </div>
                          <div className="text-xs font-extrabold leading-snug text-[#1E1E1E]">
                            {lang === 'mr' ? doc.mr : lang === 'en' ? doc.en : doc.hi}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step B: Optional Document File / Note Upload */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold text-[#1E1E1E] flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-saffron" />
                      <span>{t.docUploadNote}</span>
                    </div>
                    <p className="text-xs text-[#545454] mt-0.5">
                      {lang === 'en'
                        ? 'Document types will be automatically detected from filename and contents'
                        : 'फाइल के नाम और विवरण से दस्तावेज़ अपने-आप पहचान लिए जाएंगे'}
                    </p>
                  </div>
                  <label className="px-4 py-2.5 rounded-xl bg-white border-2 border-saffron text-saffron font-extrabold text-xs cursor-pointer hover:bg-[#FFF3E0] transition-colors shrink-0">
                    <span>{t.docChooseFile}</span>
                    <input
                      type="file"
                      accept="image/*,.pdf,.txt"
                      onChange={handleDocFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Step C: Live Analysis Result + Sarvam Mayura & Bulbul v3 Advisory */}
                {isCheckingDocs ? (
                  <div className="py-8 flex items-center justify-center gap-2 text-saffron font-bold">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{t.docAnalyzing}</span>
                  </div>
                ) : (
                  docCheckResult && (
                    <div className="space-y-5 pt-2 border-t border-[#E6D7C3]">
                      <div className="p-4 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-extrabold uppercase text-saffron">
                            {t.docReportTitle(currentLangObj.label)}
                          </span>
                          <p className="text-sm sm:text-base font-bold text-[#1E1E1E] mt-1">
                            {docCheckResult.spokenSummary}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            speakAnyText('doc-summary', docCheckResult.spokenSummary)
                          }
                          className="px-4 py-2.5 rounded-xl bg-saffron text-white font-extrabold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>{t.docListenReport}</span>
                        </button>
                      </div>

                      {/* 100% Ready Schemes */}
                      <div>
                        <h3 className="text-base font-extrabold text-[#1B5E20] flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>{t.docReadyHeading(docCheckResult.readySchemes?.length || 0)}</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(docCheckResult.readySchemes || []).map((rs: any) => {
                            const dispRs = getSchemeDisplay(rs);
                            return (
                              <div
                                key={rs.id}
                                onClick={() => router.push(`/scheme/${rs.id}`)}
                                className="p-3.5 rounded-2xl bg-[#E8F5E9]/70 border border-[#A5D6A7] hover:border-[#1B5E20] cursor-pointer flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <SchemeRealIcon category={rs.category} className="w-9 h-9 shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-sm font-extrabold text-[#1E1E1E] truncate">
                                      {dispRs.name}
                                    </div>
                                    <div className="text-[11px] font-bold text-[#1B5E20]">
                                      {t.docAllPresent}
                                    </div>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#1B5E20] shrink-0" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Almost Ready (Missing 1 doc) */}
                      {(docCheckResult.almostReadySchemes || []).length > 0 && (
                        <div>
                          <h3 className="text-base font-extrabold text-amber-800 flex items-center gap-2 mb-3">
                            <AlertCircle className="w-5 h-5" />
                            <span>{t.docAlmostHeading(docCheckResult.almostReadySchemes.length)}</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {docCheckResult.almostReadySchemes.map((ars: any) => {
                              const dispArs = getSchemeDisplay(ars);
                              return (
                                <div
                                  key={ars.id}
                                  onClick={() => router.push(`/scheme/${ars.id}`)}
                                  className="p-3.5 rounded-2xl bg-[#FFF3E0]/50 border border-[#FFE0B2] cursor-pointer flex items-center justify-between gap-2"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <SchemeRealIcon category={ars.category} className="w-9 h-9 shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-sm font-extrabold text-[#1E1E1E] truncate">
                                        {dispArs.name}
                                      </div>
                                      <div className="text-[11px] font-bold text-red-700">
                                        {t.docMissingLabel}{' ' }
                                        {lang === 'mr'
                                          ? ars.missingDocs[0]?.mr
                                          : lang === 'en'
                                          ? ars.missingDocs[0]?.en
                                          : ars.missingDocs[0]?.hi}
                                      </div>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-saffron shrink-0" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN (5 Cols on Laptop, Sticky): Sarvam AI Voice Assistant Hub */}
          <div className="lg:col-span-5 order-1 lg:order-2 lg:sticky lg:top-28">
            <div className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-7 border-2 border-[#E6D7C3] shadow-md">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF3E0] text-saffron mb-3 border border-[#FFE0B2]">
                  <Mic className="w-7 h-7" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E]">
                  {t.assistantTitle}
                </h2>
                <p className="text-sm text-[#545454] mt-1">
                  {t.assistantSub}
                </p>
              </div>

              {errorBanner && (
                <div className="mt-4 bg-amber-50 border border-amber-300 text-amber-950 px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between gap-2">
                  <span>{errorBanner}</span>
                  <button onClick={() => setErrorBanner(null)} className="text-amber-800 font-bold">
                    ✕
                  </button>
                </div>
              )}

              {/* Hold-to-Speak Microphone Button */}
              <div className="my-6 flex flex-col items-center">
                <p className="text-sm font-extrabold text-[#1E1E1E] mb-4 text-center">
                  {micState === 'idle' && t.micIdle}
                  {micState === 'recording' && t.micRecording(recordSeconds)}
                  {micState === 'thinking' && t.micThinking}
                  {micState === 'speaking' && t.micSpeaking(speaker)}
                </p>

                <div className="relative flex items-center justify-center">
                  {micState === 'idle' && (
                    <span className="absolute w-24 h-24 rounded-full bg-saffron/25 mic-idle-ring pointer-events-none" />
                  )}
                  {micState === 'recording' && (
                    <span className="absolute w-28 h-28 rounded-full bg-red-500/30 mic-recording-ring pointer-events-none" />
                  )}

                  <button
                    type="button"
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={() => {
                      if (micState === 'recording') stopRecording();
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      startRecording();
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      stopRecording();
                    }}
                    disabled={micState === 'thinking'}
                    aria-label="Hold to speak"
                    className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform select-none ${
                      micState === 'recording'
                        ? 'bg-red-600 scale-110 text-white'
                        : micState === 'thinking'
                        ? 'bg-amber-500 text-white cursor-wait'
                        : micState === 'speaking'
                        ? 'bg-[#1B5E20] text-white'
                        : 'bg-saffron hover:bg-saffron-600 active:scale-95 text-white'
                    }`}
                  >
                    {micState === 'thinking' ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" />
                      </div>
                    ) : micState === 'speaking' ? (
                      <Volume2 className="w-10 h-10 animate-pulse" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Voice Sample Prompts */}
              <div className="pt-4 border-t border-[#E6D7C3]">
                <p className="text-xs font-extrabold text-[#545454] uppercase tracking-wider mb-2.5 text-center">
                  {t.quickPromptsTitle}
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      q: 'PM Kisan aur Namo Shetkari mein kul kitne paise milte hain?',
                      label: t.promptKisan,
                    },
                    {
                      q: 'Ladki Bahin yojana ke benefits kya hain?',
                      label: t.promptLadki,
                    },
                    {
                      q: 'Chhota vyapar shuru karne ke liye Mudra loan kaise milega?',
                      label: t.promptMudra,
                    },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => processQuery(chip.q)}
                      className="text-left text-xs sm:text-sm font-bold px-3.5 py-2.5 rounded-2xl bg-[#FAF7F2] hover:bg-[#FFF3E0] border border-[#E6D7C3] hover:border-saffron text-[#1E1E1E] transition-colors flex items-center justify-between gap-2"
                    >
                      <span>{chip.label}</span>
                      <ChevronRight className="w-4 h-4 text-saffron shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Typed Fallback Input */}
              {showTextInput && (
                <form onSubmit={handleTextSubmit} className="mt-4 flex gap-2">
                  <input
                    type="text"
                    value={textQuery}
                    onChange={(e) => setTextQuery(e.target.value)}
                    placeholder={t.typePlaceholder}
                    className="flex-1 h-12 px-4 rounded-xl bg-white border-2 border-[#E6D7C3] focus:border-saffron focus:outline-none text-sm text-[#1E1E1E]"
                  />
                  <button
                    type="submit"
                    className="h-12 px-5 rounded-xl bg-saffron text-white font-extrabold text-sm hover:bg-saffron-600 transition-colors"
                  >
                    {t.askBtn}
                  </button>
                </form>
              )}

              {/* Bottom Controls */}
              <div className="mt-5 pt-3 border-t border-[#E6D7C3] flex items-center justify-between text-xs font-bold text-[#545454]">
                <button
                  type="button"
                  onClick={() => setShowTextInput((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 hover:text-[#1E1E1E] underline"
                >
                  <Keyboard className="w-4 h-4 text-saffron" />
                  <span>{showTextInput ? t.hideKeyboard : t.typeToggle}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDemoMode((prev) => !prev)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                    isDemoMode
                      ? 'bg-[#E8F5E9] text-[#1B5E20]'
                      : 'hover:text-[#1E1E1E]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isDemoMode ? t.demoOn : t.demoOff}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] text-[#1E1E1E] font-bold">
          Sarkari Sahayak Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
