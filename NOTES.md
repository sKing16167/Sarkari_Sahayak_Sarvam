# Sarkari Sahayak (सरकारी सहायक) — Engineering & Decision Notes

## Architectural & Technical Decisions

1. **Sarvam AI Models & Endpoints Verified via Live API Tests:**
   - **Speech-to-Text (STT):**
     - Endpoint: `https://api.sarvam.ai/speech-to-text`
     - Model: `saaras:v3` (tested and confirmed working with `language_code: "unknown"` for auto-detection and code-mixed speech).
   - **Text-to-Speech (TTS):**
     - Endpoint: `https://api.sarvam.ai/text-to-speech`
     - Model: `bulbul:v3` (`bulbul:v2` is deprecated per API response).
     - Speaker: `ritu` (female, friendly tone suited for civic guidance). Supports `hi-IN`, `mr-IN`, and `en-IN`.
   - **Language Model / Chat:**
     - Endpoint: `https://api.sarvam.ai/v1/chat/completions`
     - Model: `sarvam-105b-conversations`
     - System prompt strictly grounds answers in `data/schemes.json` to prevent hallucinating amounts or criteria.

2. **Security & Credential Isolation:**
   - `SARVAM_API_KEY` is strictly held on the server in `.env.local` and `.env`.
   - Client applications communicate solely through Next.js Route Handlers (`/api/stt`, `/api/chat`, `/api/tts`).
   - The key is never serialized or sent down to client bundles or network traffic.

3. **Audio Pipeline & Browser Compatibility:**
   - Raw browser recording (`MediaRecorder`) captures `audio/webm` or native codecs.
   - Client-side Web Audio API (`AudioContext`) converts audio to a 16kHz single-channel mono PCM WAV before sending to `/api/stt` to guarantee maximum transcription fidelity across iOS, Android, and Desktop.
   - Hold-to-speak utilizes `onPointerDown`, `onPointerUp`, and `onPointerLeave` with a 600ms minimum threshold to prevent accidental taps.

4. **Reliability & Fallbacks:**
   - **Microphone Denied:** Automatically pops open the inline text input box and provides a friendly notice.
   - **LLM Invalid JSON:** Retries once with structured prompt; if still failing, falls back to static verified card from `data/schemes.json`.
   - **TTS Failure:** Softly falls back to text-only mode with "Audio unavailable" indicator without interrupting the user.
   - **Offline / Rate-Limit Demo Mode:** Toggleable via `?demo=1` or on-screen toggle, serving pre-cached responses from `data/demo-cache.json`.

5. **Official Scheme Data Verification (lastVerified: 2026-11-03):**
   - **PM-Kisan Samman Nidhi:** ₹6,000/yr in three ₹2,000 installments via DBT (pmkisan.gov.in).
   - **Mukhyamantri Majhi Ladki Bahin Yojana:** ₹1,500/month (₹18,000/yr) for eligible Maharashtra women aged 21-65 with family income < ₹2.5L (ladkibahin.maharashtra.gov.in).
   - **Ayushman Bharat PM-JAY:** ₹5 Lakhs cashless health coverage per family per year, with senior citizen expansion (beneficiary.nha.gov.in).
   - **PM Ujjwala Yojana:** Free LPG deposit, 1st refill + stove free, ₹300 subsidy per cylinder (pmuy.gov.in).
   - **PM Awas Yojana:** ₹1.2L plain / ₹1.3L hilly assistance for pucca house (pmayg.nic.in).
   - **Sukanya Samriddhi Yojana:** 8.2% annual interest rate, ₹250 min deposit, 21-yr maturity (indiapost.gov.in).
