'use client';

import React, { useState } from 'react';
import {
  X,
  Volume2,
  Square,
  Loader2,
  BookOpen,
  Database,
  UserCheck,
  Mic,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  CitizenProfile,
  CITIZEN_PROFILE_STORAGE_KEY,
  OFFICIAL_SCHEME_DATA_SOURCES,
} from '@/lib/citizen-profile';
import {
  SchemesRegisterIcon,
  CitizenProfileCheckIcon,
  DocumentFolderIcon,
} from '@/components/CivicIcons';
import { SupportedLang } from '@/lib/translations';

export function UserManualModal({
  isOpen,
  onClose,
  profile,
  onResetProfile,
  onPlayManualAudio,
  isPlayingAudio,
  isLoadingAudio,
  onReplayIntro,
  lang = 'hi',
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile;
  onResetProfile: () => void;
  onPlayManualAudio: (text: string) => void;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
  onReplayIntro: () => void;
  lang?: SupportedLang;
}) {
  const [manualTab, setManualTab] = useState<'guide' | 'character' | 'databases'>('guide');

  if (!isOpen) return null;

  const isEn = lang === 'en';
  const isMr = lang === 'mr';

  const manualSpokenText = isEn
    ? 'Welcome to Sarkari Sahayak portal. Using this website is very easy. First: hold the large orange mic button on the right and ask any question about government schemes in your language. Second: visit the Citizen Profile tab to select your occupation, age, and state, creating your character profile to find matched schemes. Third: in the Document Readiness tab, select the documents you currently hold to see where you can apply immediately.'
    : isMr
    ? 'सरकारी सहायक पोर्टलवर आपले स्वागत आहे. ही वेबसाईट वापरणे अतिशय सोपे आहे. पहिली पद्धत: उजव्या बाजूचे मोठे नारिंगी माईक बटण दाबून ठेवा आणि आपल्या भाषेत कोणत्याही योजनेबद्दल विचारा. दुसरी पद्धत: नागरिक प्रोफाईल टॅबमध्ये जाऊन आपले वय, व्यवसाय आणि राज्य निवडा, ज्यामुळे तुमच्यासाठी योग्य योजना दिसतील. तिसरी पद्धत: कागदपत्रे तपासणी टॅबमध्ये तुमच्याकडील कागदपत्रे निवडा.'
    : 'सरकारी सहायक पोर्टल में आपका स्वागत है। इस वेबसाइट का उपयोग करना बहुत आसान है। पहला तरीका: दाईं तरफ दिए गए बड़े नारंगी माइक बटन को दबाकर रखें और अपनी भाषा में किसी भी योजना के बारे में पूछें। दूसरा तरीका: पात्रता जांचें टैब में जाकर अपनी आयु, पेशा और राज्य चुनें, जिससे आपकी नागरिक प्रोफ़ाइल बन जाएगी और आपको सबसे उपयुक्त योजनाएं दिखेंगी। तीसरा तरीका: दस्तावेज़ जांचें टैब में अपने पास मौजूद कागजात जैसे आधार कार्ड और राशन कार्ड पर टिक करें।';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="User Manual and System Guide"
    >
      <div className="relative w-full max-w-4xl bg-[#FFFDF9] border-2 border-[#E6D7C3] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Tricolor Bar */}
        <div className="h-1.5 w-full tricolor-ribbon shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-[#FAF3E8] border-b border-[#E6D7C3] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-saffron text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1E1E1E]">
                {isEn
                  ? 'Interactive User Manual & Platform Guide'
                  : isMr
                  ? 'वापर पुस्तिका व मार्गदर्शिका (User Manual)'
                  : 'उपयोग पुस्तिका एवं मार्गदर्शिका (Interactive User Manual)'}
              </h2>
              <p className="text-xs sm:text-sm text-[#545454] font-medium">
                {isEn
                  ? 'Step-by-step illustrated guide with Sarvam AI voice narration'
                  : isMr
                  ? 'सोपी चित्रे आणि आवाजासह सरकारी सहायक वापरण्याचे मार्गदर्शन'
                  : 'सरल चित्र और आवाज के साथ जानें कि सरकारी सहायक का उपयोग कैसे करें'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPlayManualAudio(manualSpokenText)}
              disabled={isLoadingAudio}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-xs transition-all ${
                isPlayingAudio
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1B5E20] hover:bg-[#2E7D32] text-white'
              }`}
            >
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isPlayingAudio ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span>
                {isPlayingAudio
                  ? isEn
                    ? 'Stop Audio'
                    : 'आवाज रोकें'
                  : isEn
                  ? 'Listen to Manual Aloud 🔊'
                  : isMr
                  ? 'पुस्तिका आवाजात ऐका 🔊'
                  : 'पुस्तिका आवाज में सुनें 🔊'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white border border-[#E6D7C3] flex items-center justify-center text-[#1E1E1E] hover:border-red-500 hover:text-red-600 transition-colors"
              aria-label="Close manual"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="px-4 sm:px-6 pt-3 bg-[#FFFDF9] border-b border-[#E6D7C3] flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setManualTab('guide')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              manualTab === 'guide'
                ? 'border-saffron text-saffron bg-[#FFF3E0]/50'
                : 'border-transparent text-[#545454] hover:text-[#1E1E1E]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>
              {isEn
                ? '1. How to Use the Portal'
                : isMr
                ? '1. पोर्टल कसे वापरावे (Guide)'
                : '1. वेबसाइट कैसे चलाएं (Step-by-Step Guide)'}
            </span>
          </button>

          <button
            onClick={() => setManualTab('character')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              manualTab === 'character'
                ? 'border-saffron text-saffron bg-[#FFF3E0]/50'
                : 'border-transparent text-[#545454] hover:text-[#1E1E1E]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>
              {isEn
                ? '2. Citizen Profile Storage (Character Build)'
                : isMr
                ? '2. नागरिक प्रोफाईल साठा (Character Build)'
                : '2. नागरिक प्रोफ़ाइल स्टोरेज (Character Build Engine)'}
            </span>
          </button>

          <button
            onClick={() => setManualTab('databases')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-extrabold border-b-2 transition-all flex items-center gap-2 ${
              manualTab === 'databases'
                ? 'border-saffron text-saffron bg-[#FFF3E0]/50'
                : 'border-transparent text-[#545454] hover:text-[#1E1E1E]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>
              {isEn
                ? '3. Government Scheme Databases (2,650+)'
                : isMr
                ? '3. सरकारी योजना डेटाबेस स्रोत'
                : '3. सरकारी योजना डेटाबेस स्रोत (Scheme Databases)'}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {manualTab === 'guide' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-saffron text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-saffron">
                      {isEn ? 'Step 1 • Voice-First Query' : 'चरण 1 • Voice-First Query'}
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      {isEn
                        ? 'Hold Mic to Speak in any Language'
                        : isMr
                        ? 'माईक दाबून आपल्या भाषेत विचारा'
                        : 'बोलकर अपनी भाषा में पूछें (Hold Mic to Speak)'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      {isEn
                        ? 'Hold the large orange microphone button on the right and ask in English, Hindi, Marathi, or mixed vernacular. Sarvam saaras:v3 transcribes your speech and 105B provides verified answers spoken aloud.'
                        : 'दाईं ओर नारंगी माइक बटन दबाकर रखें और हिंदी, मराठी, हिंग्लिश या किसी भी भारतीय भाषा में बोलें—जैसे "पीएम किसान में कितने पैसे मिलते हैं?"। Sarvam saaras:v3 आपकी आवाज समझकर बोलकर उत्तर देगा।'}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6D7C3] flex items-center justify-center shrink-0">
                    <CitizenProfileCheckIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#1B5E20]">
                      {isEn ? 'Step 2 • Citizen Character Build' : 'चरण 2 • Citizen Character Build'}
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      {isEn
                        ? 'Build your Citizen Profile & Eligibility'
                        : isMr
                        ? 'नागरिक प्रोफाईल तयार करा (पात्रता)'
                        : 'अपनी नागरिक प्रोफ़ाइल बनाएं (पात्रता जांचें)'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      {isEn
                        ? 'Under "Citizen Profile & Eligibility", select your occupation (Farmer, Homemaker, Artisan, Student), age, and income. The system calculates real-time % Match across all 34+ welfare schemes.'
                        : 'दूसरे टैब "पात्रता जांचें" में अपना पेशा, आयु और वार्षिक आय चुनें। सिस्टम तुरंत 34+ योजनाओं में से आपके लिए % Match की गणना करेगा।'}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6D7C3] flex items-center justify-center shrink-0">
                    <DocumentFolderIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800">
                      {isEn ? 'Step 3 • Document Readiness' : 'चरण 3 • Document Readiness'}
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      {isEn
                        ? 'Check your Documents (Doc Readiness)'
                        : isMr
                        ? 'कागदपत्रे तपासा (Doc Readiness)'
                        : 'अपने कागजात टिक करें (दस्तावेज़ जांचें)'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      {isEn
                        ? 'Select the documents you currently hold (Aadhaar, Bank Passbook, Ration Card, 7/12 Land Record). Discover instantly which schemes are 100% ready for application today.'
                        : 'तीसरे टैब "दस्तावेज़ जांचें" में आपके पास जो कागजात हैं उन्हें चुनें। तुरंत देखें कि किन योजनाओं में आज ही आवेदन हो सकता है।'}
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#E6D7C3] flex items-center justify-center shrink-0">
                    <SchemesRegisterIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-800">
                      {isEn ? 'Step 4 • 8 Indic Languages & Themes' : 'चरण 4 • 8 Languages & Sunlight Theme'}
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      {isEn
                        ? '8 Indic Languages via Sarvam Mayura & Daylight Mode'
                        : isMr
                        ? '8 भाषांमध्ये भाषांतर व उच्च-कॉन्ट्रास्ट मोड'
                        : '8 भाषाओं में अनुवाद और तेज धूप मोड'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      {isEn
                        ? 'Switch between Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, and English powered by Sarvam mayura:v1. Use Daylight Mode for high-contrast outdoor sunlight readability.'
                        : 'ऊपर दिए गए भाषा बार से 8 भाषाओं में अनुवाद चुनें (Sarvam mayura:v1)। बाहर धूप में देखने के लिए ☀️ धूप मोड चुनें।'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6D7C3]">
                <button
                  onClick={() => {
                    onClose();
                    onReplayIntro();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#FFF3E0] hover:bg-saffron hover:text-white text-[#E65100] border border-[#FFE0B2] text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isEn ? 'Replay 3D Intro Animation' : 'शुरुआती 3D एनिमेशन फिर से देखें (Replay Intro Animation)'}
                  </span>
                </button>

                <span className="text-xs font-bold text-[#545454]">
                  {isEn ? 'National Citizen Helpline Toll-Free:' : 'निःशुल्क नागरिक सहायता टोल-फ्री नंबर:'}{' '}
                  <strong>1950 / 14555</strong>
                </span>
              </div>
            </div>
          )}

          {manualTab === 'character' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#E8F5E9] border border-[#A5D6A7]">
                <h3 className="text-base font-extrabold text-[#1B5E20] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>
                    {isEn
                      ? 'Where is the Citizen Profile ("Character Build") stored and how does it work?'
                      : 'नागरिक प्रोफ़ाइल ("Character Build") कहां स्टोर होता है और कैसे काम करता है?'}
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E] mt-1.5 leading-relaxed">
                  {isEn
                    ? `Your citizen profile is stored securely and privately in your browser's localStorage under the key "${CITIZEN_PROFILE_STORAGE_KEY}". It evaluates a 6-factor rule engine (Occupation 35%, Gender 15%, Age 15%, Income 15%, State/Region 10%, Documents 10%) against criteria in all 34+ schemes.`
                    : `आपकी नागरिक प्रोफ़ाइल पूरी सुरक्षा और गोपनीयता के साथ आपके ब्राउज़र के localStorage["${CITIZEN_PROFILE_STORAGE_KEY}"] में सेव रहती है और lib/citizen-profile.ts के 6-फैक्टर नियम इंजन द्वारा सभी योजनाओं के criteria से मिलाई जाती है।`}
                </p>
              </div>

              {/* Live Character Build JSON & Attribute Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-saffron">
                      {isEn ? 'Active Character Build Attributes' : 'सक्रिय नागरिक प्रोफ़ाइल (Active Character Build)'}
                    </span>
                    <button
                      onClick={onResetProfile}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {isEn ? 'Reset' : 'रीसेट करें'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">{isEn ? 'Occupation' : 'पेशा'}</span>
                      <strong className="text-[#1E1E1E] uppercase">{profile.occupation}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">{isEn ? 'Age / Gender' : 'आयु व लिंग'}</span>
                      <strong className="text-[#1E1E1E]">
                        {profile.age} {isEn ? 'yrs' : 'वर्ष'} • {profile.gender}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">{isEn ? 'Annual Income' : 'वार्षिक आय'}</span>
                      <strong className="text-[#1B5E20]">
                        ₹{profile.annualIncome.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">{isEn ? 'Region / State' : 'क्षेत्र व राज्य'}</span>
                      <strong className="text-[#1E1E1E]">
                        {profile.area} • {profile.state}
                      </strong>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3] text-xs">
                    <span className="text-[#545454] block text-[11px] mb-1">
                      {isEn
                        ? `Owned Documents (${profile.ownedDocs.length} Saved in Profile):`
                        : `उपलब्ध दस्तावेज़ (${profile.ownedDocs.length} Saved in Profile):`}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.ownedDocs.map((d) => (
                        <span
                          key={d}
                          className="px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#1B5E20] font-bold"
                        >
                          ✓ {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                  <div className="text-amber-400 font-bold mb-2">
                    // Live Stored JSON ({CITIZEN_PROFILE_STORAGE_KEY})
                  </div>
                  <pre className="leading-relaxed text-[11px]">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {manualTab === 'databases' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#FFF3E0] border border-[#FFE0B2]">
                <h3 className="text-base font-extrabold text-[#E65100]">
                  {isEn
                    ? 'Where to access official datasets for all 2,650+ Indian Government Welfare Schemes?'
                    : 'भारत की सभी सरकारी योजनाओं और उनकी पात्रता शर्तों का आधिकारिक डेटाबेस कहां मिलता है?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E] mt-1 leading-relaxed">
                  {isEn
                    ? `Sarkari Sahayak comes pre-loaded with 34+ verified flagship central and state schemes with structured criteria rules (minAge, maxAge, genders, occupations, maxAnnualIncome, requiredDocIds). To connect across all 2,650+ Indian government schemes, the following official national portals provide public datasets and APIs:`
                    : `इस वेबसाइट में 34+ प्रमुख केंद्रीय और राज्य योजनाएं अपने पूर्ण संरचित पात्रता नियमों के साथ शामिल हैं। पूरे भारत की 2,650+ योजनाओं को जोड़ने के लिए नीचे दिए गए आधिकारिक सरकारी पोर्टल और API उपलब्ध हैं:`}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {OFFICIAL_SCHEME_DATA_SOURCES.map((src, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#E8F5E9] text-[#1B5E20] text-[11px] font-extrabold">
                          {src.totalSchemesAvailable}
                        </span>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-saffron hover:underline"
                        >
                          <span>{isEn ? 'Open Portal' : 'पोर्टल खोलें'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <h4 className="text-sm sm:text-base font-extrabold text-[#1E1E1E] mt-2">
                        {src.name}
                      </h4>
                      <p className="text-xs font-bold text-[#545454] mt-0.5">{src.authority}</p>
                      <p className="text-xs text-[#1E1E1E] mt-2 leading-relaxed">{src.howToAccess}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
