# Kena Scam

A Malaysia-focused, multilingual scam-**awareness** platform. It is not a scam detector and never tells you that something is definitely a scam.

> Scams do not stay inside one platform, language, or generation. Neither should scam awareness.

Scam stories are scattered across Facebook, TikTok, Reddit, WhatsApp, Telegram and Instagram, and split again by language. A Facebook uncle, a TikTok aunty, a Reddit poster and a WhatsApp group can all be describing the same scam without any of them knowing. Kena Scam puts those tellings side by side — **one scam, many stories**.

**This is a hackathon prototype.** Every story is fictional and redacted. Nothing was collected from a social platform, there are no partnerships or API integrations, and no figure on the site is a live or verified statistic.

---

## Running it

```bash
npm install
cp .env.example .env.local   # fill in the values below
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`next/core-web-vitals`) |

## Environment variables

```bash
# --- Supabase (required for content) ---
# Public reads are limited by RLS to approved demo rows. Submissions and the
# moderation queue have no public read access at all.
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=""

# --- OpenAI (entirely optional) ---
OPENAI_API_KEY=""                  # server-side only, never exposed to the browser
OPENAI_MODEL="gpt-4o-mini"
OPENAI_TTS_MODEL="gpt-4o-mini-tts"
OPENAI_TTS_VOICE="alloy"           # a built-in voice — never cloned or custom
OPENAI_DAILY_CALL_CAP="500"
```

Without `OPENAI_API_KEY` the site is **fully functional**: search, tagging, the assistant, the weekly digest and the Final Boss all fall back to local implementations grounded in the same records. Only the prose and the audio differ.

Without Supabase, every page renders an honest "not connected" state rather than inventing data.

---

## Pages

| Route | What it is |
| --- | --- |
| `/` | Hero, the "Eh, which one are you?" first-visit chooser, an animated four-platform → one-scam visual, featured trend, feature grid |
| `/tea` | The Scam Tea feed. Universal search, multi-tag filtering, platform/language/category/state filters, three sort orders — all mirrored into the URL |
| `/tea/[slug]` | Story detail: original text, **Translate lah** (BM / English / 中文 / தமிழ்), red flags, safe action, Source Provenance card, related tea |
| `/trends`, `/trends/[slug]` | **One Scam, Many Stories** — clusters with a connection-web diagram, why it spreads, common red flags, and every telling |
| `/radar` | **Scam Radar** — clickable state heat map, most-sus state, rising categories, platform mix, timeline, five filters |
| `/pulse` | **Malaysia Scam Pulse** — animated counters and charts, all computed from the same rows that power the feed |
| `/weekly` | **Kena Weekly** — editorial digest, subscribe mockup |
| `/game` | **Kena or Not?** — awareness simulation, three difficulties, ending in the AI voice Final Boss |
| `/kena` | **I kena already** — calm ordered recovery steps and a private report form |
| `/share` | **Join the gang** — share a story (with tag input + auto-tag), plus a Community Stories tab of approved demo stories only |
| `/moderation` | Private prototype moderation queue and the six-step permission workflow. `noindex` |
| `/about`, `/privacy`, `/contact` | Transparency, the prototype notice, and where stories come from |

## API routes

All server-side; all read `OPENAI_API_KEY` from the environment only; all degrade to a local fallback rather than erroring.

| Route | Contract |
| --- | --- |
| `POST /api/chat` | Ask Kena Scam. Retrieval happens **before** the model, so citations are real records rather than model claims |
| `POST /api/search` | Natural language → **tag ids only**. Never prose, never a factual claim |
| `POST /api/tag` | Auto-tag my tea. 3–6 ids, re-validated against the taxonomy before responding |
| `POST /api/report` | Submissions. `status` and `is_public` are written as literals, so a crafted payload cannot publish itself |
| `POST /api/voice` | TTS. The text comes from the **approved scenario record**, never from the request |
| `POST /api/translate` | Seeded translations first; takes a story id, not free text |
| `GET /api/digest` | Weekly digest generated only from approved story records |

---

## Key design decisions

**One vocabulary.** `lib/data/taxonomy.ts` mirrors the `taxonomy_tags` table: scam types, tactics, platforms, states and languages. There is no facet for a person, business, bank account or phone number — which is why the AI tagger *structurally cannot* return a defamatory tag, rather than being asked not to.

**One chokepoint for attribution.** Nothing reads `creator_handle` off a source row. Every surface calls `publicAttributionFor()` in `lib/provenance.ts`, so suppressing a credit in one place suppresses it everywhere. Row-level security is the outer layer of the same rule: only `review_status = 'approved'` provenance is readable, so a withdrawal removes the record from the public API before any application code runs.

**Public is not permission.** A pattern noticed in public discussion is never republished, credited, linked or screenshotted — only the pattern, in our own words. The four display states are visible in the demo data, including one deliberately withdrawn record.

**Nothing auto-publishes.** Submissions land `pending_review` / `is_public: false`, and the database `CHECK` constraints make any other value impossible to store.

**The urgent page is quiet.** `/kena` has no stickers, no animation, no chatbot and no simulation — the interrupter hard-suppresses itself there, on forms, and under `prefers-reduced-motion`.

**The demo set is anchored to a fixed date** (`lib/config.ts`), so relative timestamps render identically on server and client instead of hydration-mismatching.

## Data

`lib/repo.ts` is the single access point; every page, chart and API route reads through it, which is what keeps the feed, the radar, the dashboard and the chatbot describing the same records. `supabase/schema.sql` documents the tables and the RLS policies.

Seeded content: 24 stories (6 platforms × 4 languages × 9 categories × 14 states, each with all four translations), 8 trends, 140 radar reports, 40 taxonomy tags, 24 provenance records covering all five consent states, 10 simulation scenarios, 1 weekly digest.

## Design system

The token system — `ink` / `purple` / `line` / `paper`, the radii, shadows and type scale — is carried over from the Team12 (TrustX) codebase, extended with Kena accents (cream ground, hot pink, lime, tangerine, navy) for stickers, chips, the game and editorial moments. Accents are used as backgrounds behind dark text, never as small text on cream, which is what holds contrast at AA.

## What this deliberately does not do

- No scraping, no platform API access, no access to anyone's messages.
- No verification of a person, business, bank account, phone number, link or app.
- No claim that something is definitely a scam.
- No accusations. Stories are about methods, not people.
- No real hotline numbers printed — a wrong number on an emergency page would do real harm, so `/kena` shows explicit placeholders and tells you to get the current details from your bank.
