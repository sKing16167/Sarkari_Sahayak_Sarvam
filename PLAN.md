# PLAN.md — Sarkari Sahayak (सरकारी सहायक)
Voice-first government scheme assistant for low-literacy Indian users.

---

## 0. Rules for the agent (read first)
1. Speed over polish. Get the voice loop working end to end BEFORE styling anything.
2. Never expose the Sarvam key in the browser. All Sarvam calls go through server-side API routes.
3. Do NOT guess Sarvam request shapes. Before writing API code, fetch the current docs (https://docs.sarvam.ai) and confirm endpoints, header name, model names, and response format. Keep model names in `.env`.
4. Answers about schemes must be **grounded only in `data/schemes.json`**. If the info is not there, the bot says it doesn't know and suggests the official helpline/portal. No invented amounts or eligibility.
5. Every feature needs a fallback so the demo never dies (see section 8).
6. Do not stop to ask questions. Make a sensible choice, note it in `NOTES.md`, continue.

## 1. Product
**Problem:** Millions of eligible citizens miss schemes because portals are text-heavy, English/form-based, and confusing.
**Solution:** Hold a button, speak in your own mix of language + English ("Ladki Bahin yojana ke benefits kya hain?"), get a simple answer as text AND spoken audio.
**USP:** Code-mixed voice understanding (Hinglish / Marathi-English etc.) via Sarvam Saaras/Saarika STT → grounded LLM → Bulbul TTS.

## 2. Stack (keep it boring)
- Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- Next.js route handlers as the backend (`/api/stt`, `/api/chat`, `/api/tts`)
- No database. Schemes live in `data/schemes.json`.
- `.env.local`: `SARVAM_API_KEY`, `SARVAM_STT_MODEL`, `SARVAM_LLM_MODEL`, `SARVAM_TTS_MODEL`, `SARVAM_TTS_SPEAKER`
- Deploy target: local `npm run dev` or `npm run start` for demo

## 3. Timeline (40 min)
| Min | Task | Done when |
|---|---|---|
| 0–5 | Design: use **Stitch MCP** to generate the mobile screens (home, chat, scheme detail). Export tokens/layout. Scaffold Next.js + Tailwind. | App runs, Stitch design reviewed |
| 5–10 | `data/schemes.json` + Home screen (language picker, trending feed, big mic) | Home renders with 4–6 scheme cards |
| 10–22 | Voice loop: mic record → `/api/stt` → `/api/chat` → `/api/tts` → autoplay | Speak a question, hear an answer |
| 22–30 | Result UI: Eligibility / Benefits / Documents cards + play/pause audio + scheme detail page | Structured answer renders |
| 30–36 | Polish: animations, large touch targets, loading states, error toasts, fallbacks | No dead ends |
| 36–40 | README, demo script, final test on phone viewport | Demo rehearsed once |

## 4. Data model — `data/schemes.json`
Seed schemes (all verified against official government sources):
1. **PM-Kisan Samman Nidhi** — ₹6,000/year in 3 instalments
2. **Ladki Bahin Yojana (Maharashtra)** — ₹1,500/month for women
3. **Ayushman Bharat PM-JAY** — ₹5 Lakh/family/year cashless cover
4. **PM Ujjwala Yojana** — Free LPG connection + stove + 1st refill
5. **PM Awas Yojana** — ₹1.2L to ₹1.3L pucca house assistance
6. **Sukanya Samriddhi Yojana** — 8.2% girl child savings scheme

## 5. Backend routes
- `POST /api/stt`: Multi-part audio blob → Sarvam Saaras STT (`saaras:v3`) with code-mixed support
- `POST /api/chat`: Grounded RAG with `sarvam-105b-conversations`
- `POST /api/tts`: Sarvam Bulbul TTS (`bulbul:v3`, speaker `ritu`)

## 6. Frontend
- Mobile viewport: 390px responsive layout, touch targets ≥ 56px, high contrast
- Pulsing mic states: idle → recording → thinking → speaking
- Structured cards: Eligibility, Benefits, Documents Needed
- Scheme detail view: `/scheme/[id]`

## 7. Design system
Built via Stitch MCP: Warm saffron action (#F57C00), deep civic green (#1B5E20), off-white paper background (#FAF8F5).

## 8. Fallbacks
- Mic denied → inline text input box
- LLM invalid JSON → static verified scheme card from `schemes.json`
- TTS failure → clean text mode with "Audio unavailable" badge
- Offline / Rate-limits → Demo mode (`?demo=1`) with pre-cached questions

## 9. Acceptance checklist
- [x] Hold mic → speak "Ladki Bahin yojana ke benefits kya hain?" → transcript appears
- [x] Answer card shows Eligibility / Benefits / Documents
- [x] Audio of the answer plays in the user's language
- [x] Works at 390px viewport width; no horizontal scroll
- [x] 4+ scheme cards on home; scheme detail page works
- [x] API key never appears in client bundle or network tab
- [x] Demo mode works with Wi-Fi off
- [x] README has run instructions and 60-second demo script

## 10. Demo script (60 seconds)
1. "Meet Rameshbhai, a farmer who can't read forms." Open the app at http://localhost:3000.
2. Hold mic: "PM Kisan ke liye documents kya lagte hain?" → show answer + audio.
3. Switch to Marathi chip, ask about Ladki Bahin in mixed Marathi-English.
4. Point at the "Hindi + English mixed" badge: Sarvam's code-mixed STT is the core.
5. Close: "Any citizen, any literacy level, one button."
