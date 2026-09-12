import OpenAI from "openai";

/**
 * The AI layer, server-side only.
 *
 * Two design rules hold across every route that uses this:
 *
 * 1. The key is read from process.env here and nowhere else. This module must
 *    never be imported into a client component, and no route returns the key,
 *    the model name aside.
 *
 * 2. A model is never load-bearing. Search, tagging, chat, the digest and
 *    text-to-speech all have complete local fallbacks, so the site behaves
 *    identically in kind with no key — only the polish differs. That is what
 *    makes it safe to ship a demo that depends on a prepaid balance.
 *
 * Cost control is layered deliberately: a small model by default, a hard output
 * cap, a short timeout so a hanging request cannot block a page, and a
 * process-wide daily ceiling. Set a spend limit in the provider dashboard too —
 * code-side limits cannot protect a key used elsewhere.
 */

/**
 * A key that is present but malformed is worse than no key: it looks configured
 * and then fails on every request. Checking the shape up front means we fall
 * back cleanly instead of erroring per call.
 */
const RAW_KEY = process.env.OPENAI_API_KEY?.trim();
const KEY = RAW_KEY && /^sk-/.test(RAW_KEY) ? RAW_KEY : undefined;

if (RAW_KEY && !KEY) {
  console.warn(
    "[ai] OPENAI_API_KEY is set but does not look like a secret key (expected a value starting 'sk-'). Running on local fallbacks."
  );
}

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const TTS_MODEL = process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts";
/**
 * Built-in OpenAI voices. Never cloned, never a custom voice, never modelled on
 * a specific person.
 *
 * The coach and the scam voice are deliberately different, so the supportive
 * voice and the manipulative one are never confusable. 'ash' and 'ballad' also
 * respond to accent direction noticeably better than 'alloy', which sits close
 * to neutral American whatever it is told.
 */
export const TTS_VOICE_COACH = process.env.OPENAI_TTS_VOICE_COACH || "ballad";
export const TTS_VOICE_TRAP = process.env.OPENAI_TTS_VOICE_TRAP || "ash";

export const ttsVoice = (role: "trap" | "coach") =>
  role === "coach" ? TTS_VOICE_COACH : TTS_VOICE_TRAP;

const DAILY_CALL_CAP = Number(process.env.OPENAI_DAILY_CALL_CAP || 500);
const TIMEOUT_MS = 12_000;

export const aiAvailable = Boolean(KEY);

const client = KEY ? new OpenAI({ apiKey: KEY, timeout: TIMEOUT_MS, maxRetries: 1 }) : null;

let callsToday = 0;
let callWindow = new Date().toISOString().slice(0, 10);

function underCap(): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== callWindow) {
    callWindow = today;
    callsToday = 0;
  }
  if (callsToday >= DAILY_CALL_CAP) {
    console.warn("[ai] daily call cap reached; using local fallback");
    return false;
  }
  callsToday += 1;
  return true;
}

export function openai(): OpenAI | null {
  if (!client || !underCap()) return null;
  return client;
}

/**
 * A JSON completion with a strict schema.
 *
 * Returns null on any failure — no key, over cap, timeout, refusal, malformed
 * output. Callers treat null as "use the local path", which is why nothing on
 * the site breaks when the model is unavailable.
 */
export async function jsonCompletion<T>(args: {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  maxTokens?: number;
  temperature?: number;
}): Promise<T | null> {
  const api = openai();
  if (!api) return null;

  try {
    const response = await api.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
      max_completion_tokens: args.maxTokens ?? 600,
      temperature: args.temperature ?? 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: args.schemaName,
          strict: true,
          schema: args.schema,
        },
      },
    });
    const raw = response.choices[0]?.message?.content?.trim();
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn("[ai] completion unavailable:", error instanceof Error ? error.message : error);
    return null;
  }
}
