# 🇮🇳 Sarkari Sahayak (सरकारी सहायक)

<div align="center">

![Sarkari Sahayak Banner](https://img.shields.io/badge/Sarkari_Sahayak-Sovereign_Civic_Portal-FF9933?style=for-the-badge&logo=india&logoColor=white)
![Sarvam AI Stack](https://img.shields.io/badge/Powered_by-Sarvam_AI_Sovereign_Stack-138808?style=for-the-badge&logoColor=white)
![Next.js 14](https://img.shields.io/badge/Next.js_14-App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)
![Vercel Ready](https://img.shields.io/badge/Deploy-Vercel_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Languages](https://img.shields.io/badge/Indic_Languages-8_Supported-1B5E20?style=for-the-badge)

**Voice-First, Multilingual Indian Welfare Scheme Navigator with Automated Sarvam Vision OCR Document Verification**

*Empowering 1.4 Billion Citizens with Access to Government Welfare — Regardless of Literacy, Script, or Language.*

[✨ Live Demo](#-quick-deployment-guide) • [🚀 Key Features](#-key-features) • [🧠 Sarvam AI Architecture](#-sarvam-ai-stack-integration-guide-for-judges) • [📜 Schemes Covered](#-database-of-34-welfare-schemes) • [🛠️ Getting Started](#-getting-started)

---

</div>

## 📌 The Problem & Our Mission

Millions of deserving citizens in India miss out on life-changing central and state government benefits due to three critical bottlenecks:
1. **The Digital & Literacy Divide:** Government portals are text-heavy, bureaucratic, and overwhelmingly in English or formal script.
2. **Complex Document Prerequisites:** Citizens do not know which physical documents (Aadhaar, Ration Card, Bank Passbook, 7/12 Satbara, Income Certificate) unlock which specific schemes.
3. **Linguistic Fragmentation:** India speaks in hundreds of dialects and code-mixed patterns (Hinglish, Marathi-English blends) that conventional Western AI engines fail to comprehend.

**Sarkari Sahayak** transforms public welfare access into a simple, conversational, voice-first experience powered by **Sarvam AI's sovereign Indic stack**.

---

## 🧠 Sarvam AI Stack Integration Guide (For Judges)

Sarkari Sahayak connects directly to the official **Sarvam AI API Suite** across 5 distinct server-side routes:

```
                                  ┌──────────────────────────────┐
                                  │   Citizen Interaction Hub    │
                                  │   (Voice, Text, Photo Upload)│
                                  └──────────────┬───────────────┘
                                                 │
            ┌───────────────────┬────────────────┼─────────────────┬───────────────────┐
            │                   │                │                 │                   │
            ▼                   ▼                ▼                 ▼                   ▼
    ┌──────────────┐    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
    │ Speech-to-   │    │  LLM Citizen │  │ Indic Neural │  │ Text-to-     │   │ Sarvam Vision│
    │  Text (STT)  │    │   Advisory   │  │ Translation  │  │ Speech (TTS) │   │   OCR 2.1    │
    ├──────────────┤    ├──────────────┤  ├──────────────┤  ├──────────────┤   ├──────────────┤
    │  saaras:v3   │    │ sarvam-105b- │  │  mayura:v1   │  │  bulbul:v3   │   │ Doc AI v1    │
    │              │    │conversations │  │              │  │              │   │   Digitise   │
    │  POST /api/  │    │  POST /api/  │  │  POST /api/  │  │  POST /api/  │   │  POST /api/  │
    │     stt      │    │     chat     │  │  translate   │  │     tts      │   │     ocr      │
    └──────────────┘    └──────────────┘  └──────────────┘  └──────────────┘   └──────────────┘
```

| Sarvam AI Service | Model / Engine | Endpoint | Role in Sarkari Sahayak |
| :--- | :--- | :--- | :--- |
| **1. Vision & Document AI** | `doc-ai/v1/job/digitise` (Vision OCR 2.1) | `POST /api/ocr` | **Automatic Document Digitization & Verification:** Citizens upload photos of their Aadhaar card, Ration card, 7/12 Land Record, or Passbook. Sarvam Vision extracts layout-aware Indic text and auto-selects their verified documents to unlock matching schemes. |
| **2. Speech-to-Text (STT)** | `saaras:v3` | `POST /api/stt` | **Voice-First Input:** Transcribes natural code-mixed voice inputs (Hinglish, regional dialects) across 8 Indian languages with zero microphone latency. |
| **3. Grounded Conversational AI** | `sarvam-105b-conversations` | `POST /api/chat` | **Citizen Scheme Advisory:** Strict grounded RAG over 34 verified government schemes. Answers questions on eligibility, benefits, and required steps without hallucinations. |
| **4. Indic Neural Translation** | `mayura:v1` (`mode: formal`) | `POST /api/translate` | **8-Language Localization:** Translates queries, scheme cards, and eligibility reports across Hindi, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, and English. |
| **5. Text-to-Speech (TTS)** | `bulbul:v3` | `POST /api/tts` | **Audio Narration:** High-fidelity voice synthesis across 4 natural personas (`ritu`, `priya`, `aditya`, `rohan`) narrating advice for low-literacy citizens. |

---

## 🚀 Key Features

### 1. 🪪 Automated Document Readiness via Sarvam Vision OCR 2.1
- Upload an image or PDF of any official paper (Aadhaar, Ration Card, Bank Passbook, 7/12 Satbara, Income Certificate).
- Powered by `https://api.sarvam.ai/doc-ai/v1/job/digitise`.
- Automatically classifies document types from layout-preserved text blocks across Devanagari and Latin scripts.
- Instantly updates the citizen profile and re-evaluates which schemes are **100% Ready to Apply** vs. **Schemes with Only 1 Document Missing**.

### 2. 🎙️ Sovereign Voice Assistant Hub
- Hold-to-speak interface tuned for Indian accents and everyday conversational speech.
- Uses Sarvam `saaras:v3` for speech recognition and `bulbul:v3` for spoken responses.
- Sample prompt chips allow instant one-tap queries (e.g., *"How much total benefit under PM Kisan and Namo Shetkari?"*, *"What are the key benefits of Ladki Bahin Yojana?"*).

### 3. 👤 Character-Build Citizen Profile Engine
- Configurable citizen profile (`localStorage` persistent):
  - **Occupation:** Farmer, Artisan / Laborer, Woman Entrepreneur, Student / Youth, Small Business, Senior Citizen, Divyangjan.
  - **Demographics:** Age slider (18–80), Gender, Annual Income (₹50k to ₹5L+), Social Category (OBC, SC/ST, General/EWS, Minority), and State/Area.
- Computes real-time **Profile Match Score (%)** across all 34 schemes using a weighted 6-factor algorithm.

### 4. 🌐 Real-Time 8-Language Indic Localization
- Switch seamlessly between **Hindi (हिंदी)**, **Marathi (मराठी)**, **Tamil (தமிழ்)**, **Telugu (తెలుగు)**, **Bengali (বাংলা)**, **Gujarati (ગુજરાતી)**, **Kannada (ಕನ್ನಡ)**, and **English**.
- Real-time caching and dynamic fallback via Sarvam Mayura v1.

### 5. 🎨 Tactile "Sovereign Civic" UI & Bespoke Illustrations
- Built according to the **Google Stitch Design System**:
  - Tricolor ribbons and warm saffron (`#FF9933`), Ashoka navy (`#000080`), and India green (`#138808`) accents.
  - Custom SVG iconography representing real-life Indian civic documents (Aadhaar cards, ration booklets, bank passbooks, tractors, pucca homes, and LPG cylinders).
- Cinematic 3D perspective opening splash animation (`components/IntroSplash.tsx`).

---

## 📜 Database of 34 Welfare Schemes

The application includes a verified, comprehensive database (`data/schemes.json`) spanning central and state welfare initiatives:

| Domain | Schemes Included |
| :--- | :--- |
| 🌾 **Agriculture & Farmers** | PM-KISAN, Namo Shetkari Yojana, PM Fasal Bima Yojana, Kisan Credit Card (KCC), PM KUSUM Solar Pump, Soil Health Card Scheme, PM Matsya Sampada Yojana (PMMSY) |
| 👩 **Women & Child Development** | Majhi Ladki Bahin Yojana, PM Ujjwala Yojana, Lakhpati Didi, Sukanya Samriddhi Yojana, PM Matru Vandana Yojana, Lek Ladki Yojana Maharashtra, PM Poshan (Mid-Day Meal) |
| 🏥 **Health & Social Security** | Ayushman Bharat (PM-JAY), Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY), PM Jan Suraksha (PMSBY & PMJJBY), PM Bharatiya Janaushadhi Pariyojana, PM Shram Yogi Maan-dhan |
| 💼 **Livelihood & Entrepreneurship** | PM Vishwakarma Yojana, PM SVANidhi (Street Vendors), PM Employment Generation Programme (PMEGP), PM Mudra Yojana, Stand-Up India, MGNREGA Job Card |
| 🎓 **Education & Youth** | National Scholarship Portal (NSP), PM-YASASVI, Pragati Scholarship for Girls |
| 🏡 **Housing & Infrastructure** | PM Awas Yojana (PMAY Gramin & Urban), PM Surya Ghar Muft Bijli Yojana, PM SVAMITVA (Drone Property Cards) |
| 🤝 **Seniors & Divyangjan** | PM Vaya Vandana Yojana, ADIP Divyangjan Assistance Scheme, Atal Pension Yojana (e-Shram) |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server-side API Routes)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with Custom Indian Civic Palettes
- **Typography:** Inter & Noto Sans Indic fonts
- **AI Sovereign Stack:** [Sarvam AI](https://www.sarvam.ai/)
  - `doc-ai/v1/job/digitise` (Vision OCR 2.1)
  - `saaras:v3` (Speech-to-Text)
  - `bulbul:v3` (Text-to-Speech)
  - `mayura:v1` (Indic Machine Translation)
  - `sarvam-105b-conversations` (Indic LLM Reasoning)
- **Design Framework:** Google Stitch Sovereign Civic
- **Deployment:** Vercel Zero-Config CI/CD

---

## 🚀 Quick Deployment Guide

### Deploying to Vercel (1-Click)

1. Fork or import this repository into **[Vercel](https://vercel.com/new)**:
   ```
   https://github.com/sKing16167/Sarkari_Sahayak_Sarvam
   ```
2. In the **Environment Variables** configuration, add:
   - **Name:** `SARVAM_API_KEY`
   - **Value:** `your_sarvam_api_key_here`
3. Click **Deploy**. Vercel will build the Next.js App Router and all 6 API routes automatically.

---

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sKing16167/Sarkari_Sahayak_Sarvam.git
   cd Sarkari_Sahayak_Sarvam
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   SARVAM_API_KEY=your_sarvam_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🔒 Security & Data Privacy

- **Zero-Storage PII Architecture:** Uploaded documents are streamed to Sarvam Doc AI for in-memory digitization and are never stored on persistent disks.
- **Client Profile Privacy:** Citizen profile information is stored purely on the user's client device via `localStorage`.
- **Protected API Keys:** Server-side API routes shield the `SARVAM_API_KEY` so credentials are never exposed in browser network bundles.

---

## 👥 Authors & Acknowledgments

- **Author:** [sKing16167](https://github.com/sKing16167)
- **Built for:** Sarvam AI Indic AI Hackathon / Bootcamp
- **Special Thanks:** The Sarvam AI team for pioneering state-of-the-art sovereign Indic AI models.

<div align="center">
  <sub>Made with ❤️ for Bharat 🇮🇳</sub>
</div>
