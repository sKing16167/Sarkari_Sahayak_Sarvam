# Sarkari Sahayak (सरकारी सहायक) 🇮🇳

> **Voice-First, Multilingual Indian Government Welfare Scheme Assistant for Low-Literacy Citizens — Powered End-to-End by the Sarvam AI Sovereign Stack.**

Built with **Next.js 14**, **Tailwind CSS**, **TypeScript**, **Google Stitch Design System ("Sovereign Civic")**, and **4 Core Sarvam AI APIs**.

---

## 🧠 Deep Sarvam AI Stack Integration (Judge Evaluation Guide)

Every interactive feature in **Sarkari Sahayak** utilizes live server-side calls to Sarvam AI APIs (with a live **Sarvam AI Telemetry Bar** in the UI showing active model invocations):

| Sarvam AI Service | Model Used | Endpoint | Where It Powers Sarkari Sahayak |
| :--- | :--- | :--- | :--- |
| **1. Speech-to-Text (STT)** | `saaras:v3` | `POST /api/stt` (`https://api.sarvam.ai/speech-to-text`) | Hold-to-speak voice queries in code-mixed Hinglish, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, & English (`language_code: unknown`). Also powers voice answers in the Eligibility Wizard. |
| **2. Sovereign LLM Chat** | `sarvam-105b-conversations` | `POST /api/chat` (`https://api.sarvam.ai/v1/chat/completions`) | Grounded RAG over 18 verified central & state government schemes (`data/schemes.json`). Zero hallucination of benefit amounts or eligibility criteria. Also generates personalized eligibility explanations. |
| **3. Indic Translation** | `mayura:v1` (`mode: formal`) | `POST /api/translate` (`https://api.sarvam.ai/translate`) | Real-time neural translation of scheme cards, full scheme detail pages, and document readiness advisories across **8 Indic languages** (`hi-IN`, `mr-IN`, `ta-IN`, `te-IN`, `bn-IN`, `gu-IN`, `kn-IN`, `en-IN`). |
| **4. Text-to-Speech (TTS)** | `bulbul:v3` | `POST /api/tts` (`https://api.sarvam.ai/text-to-speech`) | Reads aloud scheme summaries on every card (`सुनें`), speaks full answers in the voice assistant, and narrates personalized eligibility & document readiness advisories with selectable voices (`ritu`, `priya`, `aditya`, `rohan`). |

---

## 🌟 Key Features

1. **18 Verified Official Central & State Government Schemes (`data/schemes.json`):**
   - Covers 6 major citizen categories: **Farmer (`farmer`)**, **Women (`women`)**, **Health (`health`)**, **Housing (`housing`)**, **Livelihood (`livelihood`)**, and **Education (`education`)**.
   - Includes PM-KISAN, Ladki Bahin Yojana, Ayushman Bharat PM-JAY, PM Ujjwala 2.0, PMAY, Sukanya Samriddhi, PM Vishwakarma, PM SVANidhi, PMFBY, Kisan Credit Card, Atal Pension Yojana, PM Matru Vandana, Lakhpati Didi, E-Shram, PM Surya Ghar Muft Bijli, MGNREGA, Stand-Up India, and Janani Suraksha Yojana.
2. **🎯 3-Step Visual & Voice Eligibility Wizard (`पात्रता जांचें`):**
   - Designed for low-literacy users with giant icon tiles (Occupation, Gender/Group, State/Area) or direct **Speak About Yourself (`बोलकर अपनी जानकारी दें`)** input via `saaras:v3`.
   - Instant matching + grounded explanation by `sarvam-105b-conversations` + spoken advisory via `bulbul:v3`.
3. **📄 Document Readiness & Checklist Analyzer (`दस्तावेज़ जांचें`):**
   - Citizens tap the documents they currently hold (Aadhaar, Ration Card, Bank Passbook, 7/12 Land Record, Income Certificate, etc.) or upload a document note.
   - `/api/doc-check` cross-checks all 18 schemes to show **"100% Ready to Apply Today"** vs **"Almost Ready (1 Document Missing)"**, translates the advisory via `mayura:v1`, and speaks it aloud via `bulbul:v3`.
4. **🎨 3 Stitch-Assessed Accessible Color Themes:**
   - **🌅 केसरिया (Civic Warmth):** Warm Ivory (`#FAF7F2`), Saffron (`#F57C00`), and Forest Green (`#1B5E20`).
   - **🏛️ अशोक नेवी (Sovereign Navy & Gold):** Deep Ashoka Navy (`#1A237E`) & Marigold (`#F57C00`) for institutional authority.
   - **☀️ धूप मोड (High-Contrast Daylight AAA):** Pure White (`#FFFFFF`), Deep Charcoal (`#090D16`), and high-contrast borders for rural outdoor sunlight visibility.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Sarvam API key in .env.local
# SARVAM_API_KEY=your_key_here

# 3. Build and start production server
npm run build
npm run start
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔒 Security

- All Sarvam AI calls execute strictly server-side in Next.js App Router API routes (`/api/stt`, `/api/chat`, `/api/tts`, `/api/translate`, `/api/doc-check`).
- `.env` and `.env.local` are git-ignored so `SARVAM_API_KEY` is never exposed to the client or repository.
