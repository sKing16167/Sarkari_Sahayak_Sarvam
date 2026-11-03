export type SupportedLang = 'hi' | 'mr' | 'en' | 'ta' | 'te' | 'bn' | 'gu' | 'kn';

export interface TranslationStrings {
  brandTitle: string;
  brandTagline: (total: number) => string;
  userManualBtn: string;
  themeTitle: string;
  themeWarmth: string;
  themeSovereign: string;
  themeDaylight: string;
  voiceLabel: string;
  langLabel: string;
  tabSchemesTitle: (total: number) => string;
  tabSchemesSub: string;
  tabWizardTitle: string;
  tabWizardSub: string;
  tabDocCheckTitle: string;
  tabDocCheckSub: string;
  profileBannerTitle: string;
  profileBannerExpl: string;
  sortedByMatch: string;
  defaultOrder: string;
  editProfile: string;
  yearsSuffix: string;
  incomeLabel: string;
  docsLabel: string;
  catAll: (total: number) => string;
  catFarmer: (count: number) => string;
  catWomen: (count: number) => string;
  catHealth: (count: number) => string;
  catHousing: (count: number) => string;
  catLivelihood: (count: number) => string;
  catEducation: (count: number) => string;
  profileMatchPill: (score: number) => string;
  listenBtn: (speaker: string) => string;
  stopBtn: string;
  fullDetailsBtn: string;
  assistantTitle: string;
  assistantSub: string;
  micIdle: string;
  micRecording: (sec: number) => string;
  micThinking: string;
  micSpeaking: (speaker: string) => string;
  quickPromptsTitle: string;
  promptKisan: string;
  promptLadki: string;
  promptMudra: string;
  typePlaceholder: string;
  askBtn: string;
  typeToggle: string;
  hideKeyboard: string;
  demoOn: string;
  demoOff: string;
  answerVerifiedBadge: string;
  youAsked: string;
  voicePoweredBy: (speaker: string) => string;
  replayAudio: string;
  keyBenefits: string;
  eligibilityCriteria: string;
  viewCompleteGuide: string;
  wizTitle: string;
  wizSub: (total: number) => string;
  resetProfile: string;
  wizOccupation: string;
  wizGender: string;
  wizAge: string;
  wizCategory: string;
  wizIncome: string;
  wizRegion: string;
  genderFemale: string;
  genderMale: string;
  ageYouth: string;
  ageAdult: string;
  ageSenior: string;
  incBelow1L: string;
  inc1To25L: string;
  inc25To6L: string;
  incAbove6L: string;
  stateMh: string;
  stateOther: string;
  areaRural: string;
  areaUrban: string;
  matchedSchemesHeading: (count: number) => string;
  listenAiAdvice: string;
  generatingAdvice: string;
  aiAdviceTitle: string;
  docsCount: (ready: number, total: number) => string;
  docCheckTitle: string;
  docCheckSub: string;
  docStep1: string;
  docUploadNote: string;
  docChooseFile: string;
  docAnalyzing: string;
  docReportTitle: (lang: string) => string;
  docListenReport: string;
  docReadyHeading: (count: number) => string;
  docAlmostHeading: (count: number) => string;
  docAllPresent: string;
  docMissingLabel: string;
}

export const TRANSLATIONS: Record<'hi' | 'mr' | 'en', TranslationStrings> = {
  en: {
    brandTitle: 'Sarkari Sahayak',
    brandTagline: (total) => `${total}+ Official Schemes • Powered by Sarvam AI Sovereign Stack`,
    userManualBtn: 'User Manual',
    themeTitle: 'Theme',
    themeWarmth: 'Saffron (Warm)',
    themeSovereign: 'Ashoka Navy',
    themeDaylight: 'Daylight (High Contrast)',
    voiceLabel: 'Voice:',
    langLabel: 'Language (Mayura v1):',
    tabSchemesTitle: (total) => `All ${total} Welfare Schemes`,
    tabSchemesSub: 'Explore by category & profile match, listen aloud',
    tabWizardTitle: 'Citizen Profile & Eligibility',
    tabWizardSub: 'Build profile (Character) & check % match',
    tabDocCheckTitle: 'Check Documents (Doc Readiness)',
    tabDocCheckSub: 'Select your documents & discover instant readiness',
    profileBannerTitle: 'ACTIVE CITIZEN PROFILE (CHARACTER BUILD):',
    profileBannerExpl: 'Showing your personalized % eligibility match across all schemes',
    sortedByMatch: 'Sorted by Profile Match ✓',
    defaultOrder: 'Default Order',
    editProfile: 'Edit Profile',
    yearsSuffix: 'yrs',
    incomeLabel: 'Income',
    docsLabel: 'Docs',
    catAll: (total) => `All (${total})`,
    catFarmer: (c) => `Farmers (${c})`,
    catWomen: (c) => `Women (${c})`,
    catHealth: (c) => `Health (${c})`,
    catHousing: (c) => `Housing & Solar (${c})`,
    catLivelihood: (c) => `Livelihood & Loans (${c})`,
    catEducation: (c) => `Education (${c})`,
    profileMatchPill: (score) => `${score}% Profile Match`,
    listenBtn: (speaker) => `Listen (${speaker})`,
    stopBtn: 'Stop',
    fullDetailsBtn: 'Full Details',
    assistantTitle: 'Speak to Assistant (Sarvam Voice)',
    assistantSub: 'Hold mic button and speak in English, Hindi, or any Indian language',
    micIdle: 'Hold the orange button below and speak (Hold to Speak)',
    micRecording: (sec) => `🔴 Listening... (${sec}s) — Release when finished`,
    micThinking: '⏳ Sarvam AI is searching verified schemes...',
    micSpeaking: (speaker) => `🔊 Bulbul v3 (${speaker}) is speaking the answer...`,
    quickPromptsTitle: 'Or tap these sample questions for instant demo:',
    promptKisan: '“How much total benefit under PM Kisan and Namo Shetkari?”',
    promptLadki: '“What are the key benefits of Ladki Bahin Yojana?”',
    promptMudra: '“How to get a Mudra loan to start a small business?”',
    typePlaceholder: 'Type your question here (e.g. Mudra loan details)...',
    askBtn: 'Ask',
    typeToggle: 'Type Question',
    hideKeyboard: 'Hide Keyboard',
    demoOn: 'Demo Mode: ON',
    demoOff: 'Live Sarvam API',
    answerVerifiedBadge: 'Sarvam 105B Grounded Answer',
    youAsked: 'You asked (Transcribed by Sarvam saaras:v3):',
    voicePoweredBy: (speaker) => `Voice: Sarvam Bulbul v3 (${speaker})`,
    replayAudio: 'Listen Again',
    keyBenefits: 'Key Benefits',
    eligibilityCriteria: 'Eligibility Criteria',
    viewCompleteGuide: 'View Complete Details & Application Process',
    wizTitle: 'Citizen Profile & Eligibility Engine (Character Build)',
    wizSub: (total) => `Your profile is saved locally in browser storage and matched across ${total} schemes`,
    resetProfile: 'Reset Profile',
    wizOccupation: '1. What is your primary occupation? (35% Weight)',
    wizGender: '2. Select Gender (15% Weight)',
    wizAge: '3. Age (15% Weight):',
    wizCategory: '4. Social Category',
    wizIncome: '5. Annual Family Income (15% Weight)',
    wizRegion: '6. State & Region (10% Weight)',
    genderFemale: 'Female',
    genderMale: 'Male',
    ageYouth: '20 (Youth)',
    ageAdult: '35 (Adult)',
    ageSenior: '65 (Senior)',
    incBelow1L: 'Under ₹1 Lakh (BPL)',
    inc1To25L: '₹1 to ₹2.5 Lakh',
    inc25To6L: '₹2.5 to ₹6 Lakh',
    incAbove6L: 'Above ₹6 Lakh',
    stateMh: 'Maharashtra + Central (MH)',
    stateOther: 'Other States (All India)',
    areaRural: 'Rural Area',
    areaUrban: 'Urban Area',
    matchedSchemesHeading: (count) => `High-Eligibility Schemes for your Profile (${count}):`,
    listenAiAdvice: 'Listen to Personalized AI Advice 🔊',
    generatingAdvice: 'Sarvam 105B is generating advice...',
    aiAdviceTitle: 'Sarvam 105B + Bulbul v3 Personalized Advisory:',
    docsCount: (ready, total) => `${ready}/${total} Documents`,
    docCheckTitle: 'Document Readiness Analyzer',
    docCheckSub: 'Tap documents you hold — syncs with your Citizen Profile to calculate immediate scheme readiness',
    docStep1: '1. Which documents do you currently have? (Tap to select):',
    docUploadNote: 'Upload Ration Card / Aadhaar / Document Photo or Receipt (Optional)',
    docChooseFile: 'Choose File (Upload Document)',
    docAnalyzing: 'Sarvam AI is analyzing your documents...',
    docReportTitle: (lang) => `Sarvam Mayura v1 + Bulbul v3 Document Report (${lang})`,
    docListenReport: 'Listen to Report 🔊',
    docReadyHeading: (count) => `Schemes Ready for Immediate Application (${count} Ready Now)`,
    docAlmostHeading: (count) => `Schemes with Only 1 Document Missing (${count} Almost Ready)`,
    docAllPresent: '✓ All Required Documents Present',
    docMissingLabel: 'Missing Document:',
  },
  hi: {
    brandTitle: 'सरकारी सहायक',
    brandTagline: (total) => `${total}+ आधिकारिक सरकारी योजनाएं • Sarvam AI Sovereign Voice Stack`,
    userManualBtn: 'उपयोग पुस्तिका (User Manual)',
    themeTitle: 'थीम',
    themeWarmth: 'केसरिया (Warm)',
    themeSovereign: 'अशोक नेवी (Navy)',
    themeDaylight: 'धूप मोड (High Contrast)',
    voiceLabel: 'आवाज:',
    langLabel: 'भाषा (Mayura v1):',
    tabSchemesTitle: (total) => `सभी ${total} सरकारी योजनाएं`,
    tabSchemesSub: 'श्रेणी व प्रोफ़ाइल मैच के अनुसार देखें और आवाज में सुनें',
    tabWizardTitle: 'नागरिक प्रोफ़ाइल व पात्रता',
    tabWizardSub: 'अपनी प्रोफ़ाइल (Character Build) बनाएं व % मैच जानें',
    tabDocCheckTitle: 'दस्तावेज़ जांचें (Doc Readiness)',
    tabDocCheckSub: 'अपने कागजात चुनें और तुरंत आवेदन योग्यता जानें',
    profileBannerTitle: 'सक्रिय नागरिक प्रोफ़ाइल (CHARACTER BUILD):',
    profileBannerExpl: 'योजनाओं पर आपका व्यक्तिगत % पात्रता मैच दिखाया जा रहा है',
    sortedByMatch: 'प्रोफ़ाइल मैच के अनुसार क्रमबद्ध ✓',
    defaultOrder: 'डिफ़ॉल्ट क्रम',
    editProfile: 'प्रोफ़ाइल बदलें',
    yearsSuffix: 'वर्ष',
    incomeLabel: 'आय',
    docsLabel: 'दस्तावेज़',
    catAll: (total) => `सभी (${total})`,
    catFarmer: (c) => `किसान (${c})`,
    catWomen: (c) => `महिला (${c})`,
    catHealth: (c) => `स्वास्थ्य (${c})`,
    catHousing: (c) => `आवास व बिजली (${c})`,
    catLivelihood: (c) => `रोज़गार व पेंशन (${c})`,
    catEducation: (c) => `शिक्षा (${c})`,
    profileMatchPill: (score) => `${score}% प्रोफ़ाइल मैच`,
    listenBtn: (speaker) => `सुनें (${speaker})`,
    stopBtn: 'रोकें',
    fullDetailsBtn: 'पूरी जानकारी',
    assistantTitle: 'बोलकर पूछें (Sarvam Voice Assistant)',
    assistantSub: 'माइक बटन दबाकर रखें और हिंदी, मराठी, हिंग्लिश या किसी भी भारतीय भाषा में पूछें',
    micIdle: 'नीचे नारंगी बटन दबाकर रखें और बोलें (Hold to Speak)',
    micRecording: (sec) => `🔴 सुन रहा हूँ... (${sec}s) — बोलना खत्म होने पर छोड़ें`,
    micThinking: '⏳ Sarvam AI योजना खोज रहा है...',
    micSpeaking: (speaker) => `🔊 Bulbul v3 (${speaker}) उत्तर बोल रहा है...`,
    quickPromptsTitle: 'या इन सवालों पर टैप करके तुरंत डेमो देखें:',
    promptKisan: '“पीएम किसान और नमो शेतकरी में कुल कितने पैसे मिलते हैं?”',
    promptLadki: '“लाडकी बहिन योजना के क्या फायदे हैं?”',
    promptMudra: '“छोटा व्यापार शुरू करने के लिए मुद्रा लोन कैसे मिलेगा?”',
    typePlaceholder: 'यहाँ अपना सवाल लिखें (e.g. Mudra loan details)...',
    askBtn: 'पूछें',
    typeToggle: 'लिखकर पूछें (Type)',
    hideKeyboard: 'कीबोर्ड छुपाएं',
    demoOn: 'Demo Mode: ON',
    demoOff: 'Live Sarvam API',
    answerVerifiedBadge: 'Sarvam 105B सत्यापित उत्तर',
    youAsked: 'आपने पूछा (Transcribed by Sarvam saaras:v3):',
    voicePoweredBy: (speaker) => `आवाज: Sarvam Bulbul v3 (${speaker})`,
    replayAudio: 'दोबारा सुनें',
    keyBenefits: 'मुख्य लाभ (Benefits)',
    eligibilityCriteria: 'पात्रता (Eligibility)',
    viewCompleteGuide: 'पूरी जानकारी व आवेदन प्रक्रिया देखें',
    wizTitle: 'नागरिक प्रोफ़ाइल एवं पात्रता इंजन (Citizen Character Build)',
    wizSub: (total) => `आपकी प्रोफ़ाइल ब्राउज़र में सुरक्षित सेव होती है और ${total} योजनाओं से तुरंत मिलान करती है`,
    resetProfile: 'प्रोफ़ाइल रीसेट करें',
    wizOccupation: '1. आपका मुख्य काम / पेशा क्या है? (Occupation — 35% Weight)',
    wizGender: '2. लिंग चुनें (Gender — 15% Weight)',
    wizAge: '3. आयु (Age — 15% Weight):',
    wizCategory: '4. वर्ग / श्रेणी (Social Category)',
    wizIncome: '5. वार्षिक पारिवारिक आय (Annual Income — 15% Weight)',
    wizRegion: '6. राज्य एवं निवास क्षेत्र (State & Rural/Urban — 10% Weight)',
    genderFemale: 'महिला (Female)',
    genderMale: 'पुरुष (Male)',
    ageYouth: '20 (युवा)',
    ageAdult: '35 (वयस्क)',
    ageSenior: '65 (वरिष्ठ)',
    incBelow1L: '₹1 लाख से कम (BPL)',
    inc1To25L: '₹1 से ₹2.5 लाख',
    inc25To6L: '₹2.5 से ₹6 लाख',
    incAbove6L: '₹6 लाख से अधिक',
    stateMh: 'महाराष्ट्र + केंद्र (MH)',
    stateOther: 'अन्य राज्य (All India)',
    areaRural: 'ग्रामीण क्षेत्र (Rural)',
    areaUrban: 'शहरी क्षेत्र (Urban)',
    matchedSchemesHeading: (count) => `आपकी नागरिक प्रोफ़ाइल के लिए उच्च-पात्रता योजनाएं (${count}):`,
    listenAiAdvice: 'Sarvam AI से व्यक्तिगत सलाह सुनें 🔊',
    generatingAdvice: 'Sarvam 105B सलाह बना रहा है...',
    aiAdviceTitle: 'Sarvam 105B + Bulbul v3 व्यक्तिगत परामर्श:',
    docsCount: (ready, total) => `${ready}/${total} दस्तावेज़`,
    docCheckTitle: 'दस्तावेज़ रेडीनेस चेक (Document Readiness Analyzer)',
    docCheckSub: 'आपके पास जो कागजात हैं उन पर टैप करें — यह आपकी नागरिक प्रोफ़ाइल के साथ सिंक होकर तुरंत बताएगा कि आप किन योजनाओं के लिए तैयार हैं',
    docStep1: '1. आपके पास अभी कौन-कौन से दस्तावेज़ हैं? (टैप करके चुनें):',
    docUploadNote: 'राशन कार्ड / आधार / दस्तावेज़ की फोटो या रसीद अपलोड करें (Optional)',
    docChooseFile: 'फाइल चुनें (Upload Document)',
    docAnalyzing: 'Sarvam AI आपके दस्तावेज़ों की जांच कर रहा है...',
    docReportTitle: (lang) => `Sarvam Mayura v1 + Bulbul v3 दस्तावेज़ रिपोर्ट (${lang})`,
    docListenReport: 'रिपोर्ट सुनें 🔊',
    docReadyHeading: (count) => `तुरंत आवेदन के लिए तैयार योजनाएं (${count} Ready Now)`,
    docAlmostHeading: (count) => `सिर्फ 1 दस्तावेज़ बनवाते ही मिलेंगी ये योजनाएं (${count} Almost Ready)`,
    docAllPresent: '✓ सभी आवश्यक दस्तावेज़ मौजूद',
    docMissingLabel: 'बाकी दस्तावेज़:',
  },
  mr: {
    brandTitle: 'सरकारी सहायक',
    brandTagline: (total) => `${total}+ अधिकृत सरकारी योजना • Sarvam AI Sovereign Voice Stack`,
    userManualBtn: 'वापर पुस्तिका (User Manual)',
    themeTitle: 'थीम',
    themeWarmth: 'केसरिया (Warm)',
    themeSovereign: 'अशोक नेव्ही (Navy)',
    themeDaylight: 'सूर्यप्रकाश मोड (High Contrast)',
    voiceLabel: 'आवाज:',
    langLabel: 'भाषा (Mayura v1):',
    tabSchemesTitle: (total) => `सर्व ${total} सरकारी योजना`,
    tabSchemesSub: 'वर्ग आणि प्रोफाईल जुळणीनुसार पहा आणि आवाजात ऐका',
    tabWizardTitle: 'नागरिक प्रोफाईल व पात्रता',
    tabWizardSub: 'तुमचे प्रोफाईल तयार करा आणि % पात्रता जाणून घ्या',
    tabDocCheckTitle: 'कागदपत्रे तपासा (Doc Readiness)',
    tabDocCheckSub: 'तुमची कागदपत्रे निवडा आणि त्वरित पात्रता जाणून घ्या',
    profileBannerTitle: 'सक्रिय नागरिक प्रोफाईल (CHARACTER BUILD):',
    profileBannerExpl: 'योजनांवर तुमची वैयक्तिक % पात्रता दाखवली जात आहे',
    sortedByMatch: 'प्रोफाईल जुळणीनुसार क्रमबद्ध ✓',
    defaultOrder: 'मूळ क्रम',
    editProfile: 'प्रोफाईल बदला',
    yearsSuffix: 'वर्षे',
    incomeLabel: 'उत्पन्न',
    docsLabel: 'कागदपत्रे',
    catAll: (total) => `सर्व (${total})`,
    catFarmer: (c) => `शेतकरी (${c})`,
    catWomen: (c) => `महिला (${c})`,
    catHealth: (c) => `आरोग्य (${c})`,
    catHousing: (c) => `घर आणि वीज (${c})`,
    catLivelihood: (c) => `रोजगार व पेन्शन (${c})`,
    catEducation: (c) => `शिक्षण (${c})`,
    profileMatchPill: (score) => `${score}% प्रोफाईल जुळणी`,
    listenBtn: (speaker) => `ऐका (${speaker})`,
    stopBtn: 'थांबवा',
    fullDetailsBtn: 'सविस्तर माहिती',
    assistantTitle: 'बोलून विचारा (Sarvam Voice Assistant)',
    assistantSub: 'माईक बटण दाबून ठेवा आणि मराठी, हिंदी किंवा कोणत्याही भाषेत विचारा',
    micIdle: 'खालील नारिंगी बटण दाबून ठेवा आणि बोला (Hold to Speak)',
    micRecording: (sec) => `🔴 ऐकत आहे... (${sec}s) — बोलून झाल्यावर सोडा`,
    micThinking: '⏳ Sarvam AI योजना शोधत आहे...',
    micSpeaking: (speaker) => `🔊 Bulbul v3 (${speaker}) उत्तर बोलत आहे...`,
    quickPromptsTitle: 'किंवा या प्रश्नांवर टॅप करून त्वरित डेमो पहा:',
    promptKisan: '“पीएम किसान आणि नमो शेतकरी मिळून एकूण किती पैसे मिळतात?”',
    promptLadki: '“लाडकी बहीण योजनेचे काय फायदे आहेत?”',
    promptMudra: '“छोटा व्यवसाय सुरू करण्यासाठी मुद्रा कर्ज कसे मिळेल?”',
    typePlaceholder: 'येथे तुमचा प्रश्न लिहा (उदा. मुद्रा कर्ज)...',
    askBtn: 'विचारा',
    typeToggle: 'टाईप करून विचारा',
    hideKeyboard: 'कीबोर्ड लपवा',
    demoOn: 'Demo Mode: ON',
    demoOff: 'Live Sarvam API',
    answerVerifiedBadge: 'Sarvam 105B पडताळलेले उत्तर',
    youAsked: 'तुम्ही विचारले (Transcribed by Sarvam saaras:v3):',
    voicePoweredBy: (speaker) => `आवाज: Sarvam Bulbul v3 (${speaker})`,
    replayAudio: 'पुन्हा ऐका',
    keyBenefits: 'मिळणारे फायदे (Benefits)',
    eligibilityCriteria: 'पात्रता (Eligibility)',
    viewCompleteGuide: 'सविस्तर माहिती व अर्ज प्रक्रिया पहा',
    wizTitle: 'नागरिक प्रोफाईल व पात्रता इंजिन (Character Build)',
    wizSub: (total) => `तुमचे प्रोफाईल सुरक्षित सेव्ह राहते आणि सर्व ${total} योजनांशी पडताळणी करते`,
    resetProfile: 'प्रोफाईल पूर्ववत करा',
    wizOccupation: '1. तुमचा मुख्य व्यवसाय/काम काय आहे? (35% Weight)',
    wizGender: '2. लिंग निवडा (15% Weight)',
    wizAge: '3. वय (15% Weight):',
    wizCategory: '4. प्रवर्ग / श्रेणी (Social Category)',
    wizIncome: '5. वार्षिक कौटुंबिक उत्पन्न (15% Weight)',
    wizRegion: '6. राज्य व परिसर (10% Weight)',
    genderFemale: 'महिला (Female)',
    genderMale: 'पुरुष (Male)',
    ageYouth: '20 (तरुण)',
    ageAdult: '35 (प्रौढ)',
    ageSenior: '65 (ज्येष्ठ)',
    incBelow1L: '₹1 लाखापेक्षा कमी (BPL)',
    inc1To25L: '₹1 ते ₹2.5 लाख',
    inc25To6L: '₹2.5 ते ₹6 लाख',
    incAbove6L: '₹6 लाखांपेक्षा जास्त',
    stateMh: 'महाराष्ट्र + केंद्र (MH)',
    stateOther: 'इतर राज्ये (All India)',
    areaRural: 'ग्रामीण परिसर',
    areaUrban: 'शहरी परिसर',
    matchedSchemesHeading: (count) => `तुमच्या प्रोफाईलनुसार उच्च-पात्रता योजना (${count}):`,
    listenAiAdvice: 'Sarvam AI कडून वैयक्तिक सल्ला ऐका 🔊',
    generatingAdvice: 'Sarvam 105B सल्ला तयार करत आहे...',
    aiAdviceTitle: 'Sarvam 105B + Bulbul v3 वैयक्तिक सल्ला:',
    docsCount: (ready, total) => `${ready}/${total} कागदपत्रे`,
    docCheckTitle: 'कागदपत्रे तपासणी (Document Readiness Analyzer)',
    docCheckSub: 'तुमच्याकडील कागदपत्रांवर टॅप करा — कोणत्या योजनांसाठी तुम्ही पात्र आहात हे त्वरित समजेल',
    docStep1: '1. तुमच्याकडे सध्या कोणती कागदपत्रे आहेत? (टॅप करून निवडा):',
    docUploadNote: 'कागदपत्रांची फोटो किंवा पावती अपलोड करा (ऐच्छिक)',
    docChooseFile: 'फाईल निवडा (Upload Document)',
    docAnalyzing: 'Sarvam AI तपासणी करत आहे...',
    docReportTitle: (lang) => `Sarvam Mayura v1 + Bulbul v3 अहवाल (${lang})`,
    docListenReport: 'अहवाल ऐका 🔊',
    docReadyHeading: (count) => `तात्काळ अर्जासाठी पात्र योजना (${count} Ready Now)`,
    docAlmostHeading: (count) => `फक्त 1 कागदपत्र काढल्यास मिळणाऱ्या योजना (${count} Almost Ready)`,
    docAllPresent: '✓ सर्व आवश्यक कागदपत्रे उपलब्ध',
    docMissingLabel: 'उर्वरित कागदपत्र:',
  },
};

export function getT(lang: SupportedLang): TranslationStrings {
  if (lang === 'mr') return TRANSLATIONS.mr;
  if (lang === 'en') return TRANSLATIONS.en;
  return TRANSLATIONS.hi;
}
