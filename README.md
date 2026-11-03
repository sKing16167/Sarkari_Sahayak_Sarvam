# Sarkari Sahayak (सरकारी सहायक)

> **Voice-first government welfare scheme assistant for low-literacy Indian citizens, powered by Sarvam AI.**

Built for the hackathon demo in Next.js 14, Tailwind CSS, TypeScript, and the Sarvam AI platform.

---

## 🌟 Key Features

1. **Voice-First Interaction (Hold to Speak):**
   - Natural speech in mixed Hindi/English (Hinglish) or Marathi/English.
   - Converts speech to 16kHz mono WAV and transcribes via **Sarvam Saaras STT (`saaras:v3`)**.
2. **Grounded Sovereign Intelligence:**
   - Powered by **Sarvam 105B (`sarvam-105b-conversations`)**.
   - Answers are strictly grounded in verified scheme data (`data/schemes.json`). Never hallucinates amounts or rules.
3. **Voice Response (Audio Autoplay):**
   - Speaks answers aloud using **Sarvam Bulbul TTS (`bulbul:v3`, speaker `ritu`)** in Hindi, Marathi, and English.
   - Animated visual equalizer waveform and replay controls.
4. **Accessible Mobile UI (Tactile Clarity):**
   - 390px mobile viewport, ≥56px touch targets, 18px+ readable text, high contrast.
   - Saffron (`#F57C00`) action colors & civic green (`#1B5E20`) for confirmed benefits.
5. **Bulletproof Fallbacks (Never Fails):**
   - **Microphone Denied:** Instant toggle to typed text query.
   - **LLM Parsing Error:** Automatic fallback to verified static card.
   - **TTS Unavailable:** Soft text-only display without crashing.
   - **Offline / Rate-Limit Demo Mode:** Toggleable `?demo=1` mode serving instant cached answers.

---

## 🚀 Quick Start / How to Run the Demo

The production server is already built and running locally at:
👉 **[http://localhost:3000](http://localhost:3000)**

If you ever need to restart the server manually:

```bash
# 1. Install dependencies (if fresh clone)
npm install

# 2. Build the optimized production bundle
npm run build

# 3. Start the application
npm run start
```
*(Or for rapid development with live reload: `npm run dev`)*

---

## 🎬 60-Second Hackathon Demo Script

1. **Introduction (10s):**
   - *"Meet Rameshbhai, a farmer who cannot read long bureaucratic forms. Today, we show you Sarkari Sahayak."*
   - Open **`http://localhost:3000`** in mobile view (or DevTools mobile responsive mode at 390px).

2. **Hinglish Voice Query (20s):**
   - Hold the big saffron mic button at the bottom:
   - Speak: **"PM Kisan ke liye documents kya lagte hain?"** (or tap the suggestion chip).
   - Watch the mic transition: `recording` (with timer) ➔ `thinking` (dots) ➔ `speaking` (waveform).
   - Show the structured answer: **Eligibility**, **Benefits**, and **Documents Needed** with audio playing aloud.

3. **Regional & Code-Mixed Understanding (15s):**
   - Tap the **मराठी** language chip.
   - Ask or tap: **"Ladki Bahin yojana ke benefits kya hain?"**
   - Point out the visible badge: **"Understands Hindi + English mixed 🎙️"** — Sarvam's code-mixed speech understanding handles vernacular speech seamlessly.

4. **Scheme Exploration & Fallbacks (10s):**
   - Tap on the scheme card or click **"पूरी जानकारी व आवेदन विधि"** to open `/scheme/ladki-bahin` with official portal links and step-by-step application guidance.
   - Show the offline demo toggle (`?demo=1`) showing that the app works even if network drops.

5. **Closing (5s):**
   - *"Any citizen, any literacy level, one single button."*

---

## 🔒 Security

- All Sarvam AI API interactions happen **server-side** via Next.js Route Handlers (`/api/stt`, `/api/chat`, `/api/tts`).
- `SARVAM_API_KEY` is loaded securely from `.env.local` and is never exposed in browser bundles or client network requests.
