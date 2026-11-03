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

export function UserManualModal({
  isOpen,
  onClose,
  profile,
  onResetProfile,
  onPlayManualAudio,
  isPlayingAudio,
  isLoadingAudio,
  onReplayIntro,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: CitizenProfile;
  onResetProfile: () => void;
  onPlayManualAudio: (text: string) => void;
  isPlayingAudio: boolean;
  isLoadingAudio: boolean;
  onReplayIntro: () => void;
}) {
  const [manualTab, setManualTab] = useState<'guide' | 'character' | 'databases'>('guide');

  if (!isOpen) return null;

  const manualSpokenText =
    'सरकारी सहायक पोर्टल में आपका स्वागत है। इस वेबसाइट का उपयोग करना बहुत आसान है। पहला तरीका: दाईं तरफ दिए गए बड़े नारंगी माइक बटन को दबाकर रखें और अपनी भाषा में किसी भी योजना के बारे में पूछें। दूसरा तरीका: पात्रता जांचें टैब में जाकर अपनी आयु, पेशा और राज्य चुनें, जिससे आपकी नागरिक प्रोफ़ाइल बन जाएगी और आपको सबसे उपयुक्त योजनाएं दिखेंगी। तीसरा तरीका: दस्तावेज़ जांचें टैब में अपने पास मौजूद कागजात जैसे आधार कार्ड और राशन कार्ड पर टिक करें।';

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
                उपयोग पुस्तिका एवं मार्गदर्शिका (Interactive User Manual)
              </h2>
              <p className="text-xs sm:text-sm text-[#545454] font-medium">
                सरल चित्र और आवाज के साथ जानें कि सरकारी सहायक का उपयोग कैसे करें
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
              <span>{isPlayingAudio ? 'आवाज रोकें' : 'पुस्तिका आवाज में सुनें'}</span>
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
            <span>1. वेबसाइट कैसे चलाएं (Step-by-Step Guide)</span>
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
            <span>2. नागरिक प्रोफ़ाइल स्टोरेज (Character Build Engine)</span>
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
            <span>3. सरकारी योजना डेटाबेस स्रोत (Scheme Databases)</span>
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
                      चरण 1 • Voice-First Query
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      बोलकर अपनी भाषा में पूछें (Hold Mic to Speak)
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      दाईं ओर नारंगी माइक बटन दबाकर रखें और हिंदी, मराठी, हिंग्लिश या किसी भी भारतीय भाषा में बोलें—जैसे{' '}
                      <strong>&ldquo;पीएम किसान में कितने पैसे मिलते हैं?&rdquo;</strong>। Sarvam{' '}
                      <code>saaras:v3</code> आपकी आवाज समझकर बोलकर उत्तर देगा।
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
                      चरण 2 • Citizen Character Build
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      अपनी नागरिक प्रोफ़ाइल बनाएं (पात्रता जांचें)
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      दूसरे टैब <strong>&ldquo;पात्रता जांचें&rdquo;</strong> में अपना पेशा (किसान, महिला, छात्र, कारीगर), आयु और वार्षिक आय चुनें। सिस्टम तुरंत 26 योजनाओं में से आपके लिए <strong>% Match</strong> की गणना करेगा।
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
                      चरण 3 • Document Readiness
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      अपने कागजात टिक करें (दस्तावेज़ जांचें)
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      तीसरे टैब <strong>&ldquo;दस्तावेज़ जांचें&rdquo;</strong> में आपके पास जो कागजात हैं (आधार, बैंक पासबुक, राशन कार्ड, 7/12 उतारा) उन्हें चुनें। तुरंत देखें कि किन योजनाओं में आज ही आवेदन हो सकता है।
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
                      चरण 4 • 8 Languages & Sunlight Theme
                    </span>
                    <h3 className="text-base font-extrabold text-[#1E1E1E] mt-0.5">
                      8 भाषाओं में अनुवाद और तेज धूप मोड
                    </h3>
                    <p className="text-xs sm:text-sm text-[#545454] mt-1 leading-relaxed">
                      ऊपर दिए गए भाषा बार से हिंदी, मराठी, तमिल, तेलुगु, बंगाली, गुजराती, कन्नड़ या अंग्रेजी चुनें (Sarvam{' '}
                      <code>mayura:v1</code>)। बाहर धूप में देखने के लिए <strong>☀️ धूप मोड</strong> चुनें।
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
                  <span>शुरुआती 3D एनिमेशन फिर से देखें (Replay Intro Animation)</span>
                </button>

                <span className="text-xs font-bold text-[#545454]">
                  निःशुल्क नागरिक सहायता टोल-फ्री नंबर: <strong>1950 / 14555</strong>
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
                    नागरिक प्रोफ़ाइल (&ldquo;Character Build&rdquo;) कहां स्टोर होता है और कैसे काम करता है?
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E] mt-1.5 leading-relaxed">
                  आपकी नागरिक प्रोफ़ाइल पूरी सुरक्षा और गोपनीयता के साथ आपके ब्राउज़र के{' '}
                  <code className="px-1.5 py-0.5 rounded bg-white border border-[#A5D6A7] font-mono text-xs">
                    localStorage[&quot;{CITIZEN_PROFILE_STORAGE_KEY}&quot;]
                  </code>{' '}
                  में सेव रहती है और <code>lib/citizen-profile.ts</code> के 6-फैक्टर नियम इंजन (Occupation 35%, Gender 15%, Age 15%, Income 15%, State/Area 10%, Documents 10%) द्वारा सभी 26 योजनाओं के <code>criteria</code> से मिलाई जाती है।
                </p>
              </div>

              {/* Live Character Build JSON & Attribute Inspector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E6D7C3] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-saffron">
                      सक्रिय नागरिक प्रोफ़ाइल (Active Character Build)
                    </span>
                    <button
                      onClick={onResetProfile}
                      className="inline-flex items-center gap-1 text-xs font-bold text-red-700 hover:underline"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      रीसेट करें
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">पेशा (Occupation)</span>
                      <strong className="text-[#1E1E1E] uppercase">{profile.occupation}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">आयु व लिंग (Age / Gender)</span>
                      <strong className="text-[#1E1E1E]">
                        {profile.age} yrs • {profile.gender}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">वार्षिक आय (Annual Income)</span>
                      <strong className="text-[#1B5E20]">
                        ₹{profile.annualIncome.toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3]">
                      <span className="text-[#545454] block text-[11px]">क्षेत्र व राज्य (Region)</span>
                      <strong className="text-[#1E1E1E]">
                        {profile.area} • {profile.state}
                      </strong>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white border border-[#E6D7C3] text-xs">
                    <span className="text-[#545454] block text-[11px] mb-1">
                      उपलब्ध दस्तावेज़ ({profile.ownedDocs.length} Saved in Profile):
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
                  भारत की सभी सरकारी योजनाओं और उनकी पात्रता शर्तों का आधिकारिक डेटाबेस कहां मिलता है?
                </h3>
                <p className="text-xs sm:text-sm text-[#1E1E1E] mt-1 leading-relaxed">
                  इस वेबसाइट के <code>data/schemes.json</code> में वर्तमान में <strong>26 प्रमुख केंद्रीय और राज्य योजनाएं</strong> अपने पूर्ण संरचित पात्रता नियमों (<code>criteria: minAge, maxAge, genders, occupations, maxAnnualIncome, requiredDocIds</code>) के साथ शामिल हैं। पूरे भारत की 2,650+ योजनाओं को जोड़ने के लिए नीचे दिए गए आधिकारिक सरकारी पोर्टल और API उपलब्ध हैं:
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
                          <span>पोर्टल खोलें</span>
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
