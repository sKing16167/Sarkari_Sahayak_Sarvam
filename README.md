# Sarkari Sahayak (सरकारी सहायक) 🇮🇳

> **Voice-First, Multilingual Indian Government Welfare Scheme Assistant for Low-Literacy Citizens — Powered End-to-End by the Sarvam AI Sovereign Stack.**

Built with **Next.js 14 (App Router)**, **Tailwind CSS**, **TypeScript**, **Google Stitch Design System ("Sovereign Civic")**, and **4 Core Sarvam AI APIs**. Optimized for **Windows, macOS, iOS, Android**, and **1-Click Vercel Deployment**.

---

## 🧠 Deep Sarvam AI Stack Integration (Judge Evaluation Guide)

Every interactive feature in **Sarkari Sahayak** utilizes live server-side calls to Sarvam AI APIs (with a live **Sarvam AI Telemetry Bar** in the UI showing active model invocations):

| Sarvam AI Service | Model Used | Endpoint | Where It Powers Sarkari Sahayak |
| :--- | :--- | :--- | :--- |
| **1. Speech-to-Text (STT)** | `saaras:v3` | `POST /api/stt` (`https://api.sarvam.ai/speech-to-text`) | Hold-to-speak voice queries in code-mixed Hinglish, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, & English (`language_code: unknown`). |
| **2. Sovereign LLM Chat** | `sarvam-105b-conversations` | `POST /api/chat` (`https://api.sarvam.ai/v1/chat/completions`) | Grounded RAG over **26 verified central & state government schemes** (`data/schemes.json`). Zero hallucination of benefit amounts or eligibility criteria. Also generates personalized eligibility explanations for the Citizen Profile. |
| **3. Indic Translation** | `mayura:v1` (`mode: formal`) | `POST /api/translate` (`https://api.sarvam.ai/translate`) | Real-time neural translation of scheme cards, full scheme detail pages, and document readiness advisories across **8 Indic languages** (`hi-IN`, `mr-IN`, `ta-IN`, `te-IN`, `bn-IN`, `gu-IN`, `kn-IN`, `en-IN`). |
| **4. Text-to-Speech (TTS)** | `bulbul:v3` | `POST /api/tts` (`https://api.sarvam.ai/text-to-speech`) | Reads aloud scheme summaries (`सुनें`), speaks full answers in the voice assistant, narrates the **Interactive User Manual**, and speaks personalized eligibility & document readiness advisories with 4 selectable voices (`ritu`, `priya`, `aditya`, `rohan`). |

---

## 🌟 Key Features

1. **🎬 3D Perspective Starting Animation (`components/IntroSplash.tsx`):**
   - The official **Sarkari Sahayak Emblem** scales in first with a rotating Ashoka Chakra watermark, followed by the **"सरकारी सहायक • SARKARI SAHAYAK"** lettering emerging from deep 3D Z-space towards the front before opening the portal. Can be replayed anytime from the header emblem or User Manual.
2. **🎨 Real-Life Tactile Vector Illustrations (`components/CivicIcons.tsx`):**
   - Replaces generic AI/system emojis with bespoke multi-layered SVG artwork of authentic Indian civic artifacts: Aadhaar card with tricolor band & QR code, Green Ration Booklet, Bank Passbook, Tractor & Wheat Harvest, Domestic LPG Cylinder, Pucca Brick Home, Solar Roof Array, Street Vendor Pushcart, and Graduation Cap.
3. **👤 Persistent Citizen Profile ("Character Build") Engine (`lib/citizen-profile.ts`):**
   - Stored locally in `localStorage["sarkari_sahayak_citizen_profile_v1"]`.
   - Evaluates 6 weighted attributes (**Occupation 35%**, **Gender 15%**, **Age 15%**, **Annual Income 15%**, **State/Area 10%**, **Owned Documents 10%**) against structured `criteria` on all **26 schemes** to display real-time **`% पात्रता मैच (Match Score)`** badges.
4. **📖 Interactive User Manual & Database Guide (`components/UserManualModal.tsx`):**
   - Accessible anytime via the top **"उपयोग पुस्तिका (User Manual)"** button, with full voice narration via Sarvam `bulbul:v3`, a live **Character Build JSON Inspector**, and links to official government scheme databases (`myScheme.gov.in`, `data.gov.in`, `JanSamarth`, `MahaDBT`).

---

## ☁️ Deploying to Vercel (Step-by-Step)

1. Go to **[vercel.com/new](https://vercel.com/new)** and import your GitHub repository: `sKing16167/Sarkari_Sahayak_Sarvam`.
2. In **Environment Variables**, add:
   - **Key:** `SARVAM_API_KEY`
   - **Value:** *(Your Sarvam AI API Subscription Key)*
3. Click **Deploy** — Next.js 14 App Router, PWA Manifest (`/manifest.webmanifest`), and all 5 server-side API routes (`/api/stt`, `/api/chat`, `/api/tts`, `/api/translate`, `/api/doc-check`) will deploy automatically.
