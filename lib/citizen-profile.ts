export type CitizenOccupation =
  | 'farmer'
  | 'homemaker'
  | 'laborer'
  | 'vendor'
  | 'artisan'
  | 'student'
  | 'entrepreneur'
  | 'senior'
  | 'unemployed';

export type CitizenGender = 'female' | 'male' | 'other';
export type CitizenArea = 'rural' | 'urban';
export type CitizenSocialCategory = 'general' | 'obc' | 'sc_st' | 'minority' | 'divyang';

export interface CitizenProfile {
  name: string;
  age: number;
  gender: CitizenGender;
  occupation: CitizenOccupation;
  annualIncome: number; // in INR, e.g. 120000
  area: CitizenArea;
  state: 'maharashtra' | 'all';
  socialCategory: CitizenSocialCategory;
  ownedDocs: string[];
  updatedAt: string;
}

export const CITIZEN_PROFILE_STORAGE_KEY = 'sarkari_sahayak_citizen_profile_v1';

export const DEFAULT_CITIZEN_PROFILE: CitizenProfile = {
  name: 'रमेश / सुनीता (नागरिक प्रोफ़ाइल)',
  age: 34,
  gender: 'female',
  occupation: 'farmer',
  annualIncome: 120000,
  area: 'rural',
  state: 'maharashtra',
  socialCategory: 'obc',
  ownedDocs: ['aadhaar', 'bank', 'ration', 'mobile'],
  updatedAt: new Date().toISOString(),
};

export function loadCitizenProfile(): CitizenProfile {
  if (typeof window === 'undefined') return DEFAULT_CITIZEN_PROFILE;
  try {
    const raw = window.localStorage.getItem(CITIZEN_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_CITIZEN_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CITIZEN_PROFILE,
      ...parsed,
      ownedDocs: Array.isArray(parsed.ownedDocs)
        ? parsed.ownedDocs
        : DEFAULT_CITIZEN_PROFILE.ownedDocs,
    };
  } catch {
    return DEFAULT_CITIZEN_PROFILE;
  }
}

export function saveCitizenProfile(profile: CitizenProfile): CitizenProfile {
  const updated: CitizenProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CITIZEN_PROFILE_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }
  }
  return updated;
}

export interface SchemeMatchResult {
  schemeId: string;
  matchScore: number; // 0 - 100
  isPrimaryMatch: boolean;
  matchedFactors: string[];
  unmetFactors: string[];
  docsReadyCount: number;
  docsTotalCount: number;
  missingDocIds: string[];
}

const OCCUPATION_LABELS_HI: Record<CitizenOccupation, string> = {
  farmer: 'किसान (Farmer)',
  homemaker: 'गृहिणी / महिला (Homemaker)',
  laborer: 'मजदूर / निर्माण श्रमिक (Worker)',
  vendor: 'रेहड़ी-पटरी / दुकानदार (Vendor)',
  artisan: 'कारीगर / विश्वकर्मा (Artisan)',
  student: 'छात्र / युवा (Student)',
  entrepreneur: 'स्वरोजगार / उद्यमी (Business)',
  senior: 'वरिष्ठ नागरिक 60+ (Senior)',
  unemployed: 'बेरोजगार / जॉब सीकर',
};

export function evaluateSchemeForCitizen(
  scheme: any,
  profile: CitizenProfile
): SchemeMatchResult {
  const criteria = scheme.criteria || {
    minAge: 0,
    maxAge: 100,
    genders: ['female', 'male', 'other'],
    occupations: ['farmer', 'homemaker', 'laborer', 'vendor', 'artisan', 'student', 'entrepreneur', 'senior', 'unemployed'],
    maxAnnualIncome: null,
    areas: ['rural', 'urban'],
    states: ['all'],
    socialCategories: ['general', 'obc', 'sc_st', 'minority', 'divyang'],
    requiredDocIds: ['aadhaar', 'bank'],
  };

  let score = 0;
  const matchedFactors: string[] = [];
  const unmetFactors: string[] = [];

  // 1. Occupation weight (35 points)
  if (criteria.occupations.includes(profile.occupation)) {
    score += 35;
    matchedFactors.push(`पेशा पात्र: ${OCCUPATION_LABELS_HI[profile.occupation]}`);
  } else {
    unmetFactors.push('पेशा श्रेणी भिन्न है');
  }

  // 2. Gender weight (15 points)
  if (criteria.genders.includes(profile.gender)) {
    score += 15;
    if (criteria.genders.length === 1 && criteria.genders[0] === 'female') {
      matchedFactors.push('महिला विशेष योजना पात्र');
    }
  } else {
    score -= 40; // hard filter for gender-exclusive schemes
    unmetFactors.push('केवल महिला आवेदकों के लिए');
  }

  // 3. Age range weight (15 points)
  if (profile.age >= criteria.minAge && profile.age <= criteria.maxAge) {
    score += 15;
    matchedFactors.push(`आयु पात्र (${profile.age} वर्ष)`);
  } else {
    score -= 25;
    unmetFactors.push(`निर्धारित आयु: ${criteria.minAge}–${criteria.maxAge} वर्ष`);
  }

  // 4. Income threshold weight (15 points)
  if (criteria.maxAnnualIncome === null || profile.annualIncome <= criteria.maxAnnualIncome) {
    score += 15;
    if (criteria.maxAnnualIncome) {
      matchedFactors.push(
        `वार्षिक आय सीमा (≤ ₹${(criteria.maxAnnualIncome / 100000).toFixed(1)} लाख) में पात्र`
      );
    }
  } else {
    score -= 20;
    unmetFactors.push(
      `आय सीमा ₹${(criteria.maxAnnualIncome / 100000).toFixed(1)} लाख से कम होनी चाहिए`
    );
  }

  // 5. State / Area (10 points)
  const stateOk =
    criteria.states.includes('all') || criteria.states.includes(profile.state);
  const areaOk = criteria.areas.includes(profile.area);
  if (stateOk && areaOk) {
    score += 10;
    if (criteria.states.includes('maharashtra') && !criteria.states.includes('all')) {
      matchedFactors.push('महाराष्ट्र राज्य विशेष पात्रता');
    }
  } else {
    if (!stateOk) {
      score -= 30;
      unmetFactors.push('केवल महाराष्ट्र राज्य निवासियों हेतु');
    }
    if (!areaOk) {
      score -= 10;
      unmetFactors.push(criteria.areas[0] === 'rural' ? 'ग्रामीण क्षेत्र हेतु' : 'शहरी क्षेत्र हेतु');
    }
  }

  // 6. Document readiness weight (10 points)
  const reqDocs: string[] = criteria.requiredDocIds || [];
  const missingDocIds = reqDocs.filter((d) => !profile.ownedDocs.includes(d));
  const docsReadyCount = reqDocs.length - missingDocIds.length;
  if (reqDocs.length === 0 || missingDocIds.length === 0) {
    score += 10;
    matchedFactors.push('सभी आवश्यक दस्तावेज़ उपलब्ध');
  } else {
    const docRatio = docsReadyCount / reqDocs.length;
    score += Math.round(docRatio * 10);
  }

  // Social category boost
  if (profile.socialCategory === 'divyang' && scheme.id === 'udid-divyang-swavalamban') {
    score = 100;
    matchedFactors.unshift('दिव्यांग विशेष प्राथमिकता योजना');
  }

  const clampedScore = Math.max(5, Math.min(100, score));

  return {
    schemeId: scheme.id,
    matchScore: clampedScore,
    isPrimaryMatch: clampedScore >= 75 && unmetFactors.length === 0,
    matchedFactors,
    unmetFactors,
    docsReadyCount,
    docsTotalCount: reqDocs.length,
    missingDocIds,
  };
}

export const OFFICIAL_SCHEME_DATA_SOURCES = [
  {
    name: 'myScheme.gov.in (National Platform for Government Schemes)',
    authority: 'National e-Governance Division (NeGD), MeitY, Govt of India',
    url: 'https://www.myscheme.gov.in',
    totalSchemesAvailable: '2,650+ Central & State Schemes',
    howToAccess:
      'Provides structured JSON eligibility rules (Age, Gender, Caste, Income, Occupation, State, Disability) via API Setu (apisetu.gov.in) & public scheme catalog endpoints.',
  },
  {
    name: 'Open Government Data (OGD) Platform India',
    authority: 'National Informatics Centre (NIC), MeitY',
    url: 'https://www.data.gov.in',
    totalSchemesAvailable: '12,000+ Welfare & Ministry Datasets (CSV / JSON / REST API)',
    howToAccess:
      'Free API key from data.gov.in allows direct REST querying of PM-KISAN, PMAY, PM-JAY, NSAP, and state DBT scheme catalogs.',
  },
  {
    name: 'JanSamarth & Stand-Up Mitra National Credit Portals',
    authority: 'Department of Financial Services, Ministry of Finance',
    url: 'https://www.jansamarth.in',
    totalSchemesAvailable: '15+ Central Credit-Linked Subsidy & Loan Schemes',
    howToAccess:
      'Standardized credit eligibility rules for KCC, PMMY Mudra, PM SVANidhi, PM Vishwakarma, and Stand-Up India.',
  },
  {
    name: 'MahitiAapleSarkar / MahaDBT Portal',
    authority: 'Government of Maharashtra (DIT)',
    url: 'https://mahadbt.maharashtra.gov.in',
    totalSchemesAvailable: '45+ Maharashtra State Direct Benefit Schemes',
    howToAccess:
      'Official rulebooks for Mukhyamantri Majhi Ladki Bahin Yojana, Namo Shetkari Mahasanman Nidhi, and Sanjay Gandhi Niradhar Yojana.',
  },
];
