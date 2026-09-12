import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { TTS_MODEL, openai, ttsVoice } from "@/lib/ai";
import { getScenario } from "@/lib/repo";

/**
 * Text-to-speech for the "Kena or Not" voice-note scenarios.
 *
 * Safety constraints, all structural rather than advisory:
 *
 * - The text is never taken from the request. The caller names a scenario and a
 *   role, and the words are read out of the approved scenario record, so this
 *   endpoint cannot be used to synthesise arbitrary speech.
 * - Only a built-in OpenAI voice is used. No custom voice, no cloning, and the
 *   scenario wording never identifies or imitates a real person, bank, officer,
 *   celebrity or family member — it is fictional throughout.
 * - With no key the route returns 204 and the player stays transcript-only,
 *   which is fully functional. Captions are always visible regardless.
 *
 * Clips are cached on disk on first request, because a seeded scenario produces
 * the same audio every time and paying for it repeatedly would be waste.
 */

const Body = z.object({
  scenarioId: z.string().min(1).max(64),
  role: z.enum(["trap", "coach"]),
});

const CACHE_DIR = path.join(process.cwd(), ".cache", "audio");

/**
 * Accent direction, written phonetically rather than as a label.
 *
 * "Use a Malaysian accent" on its own barely moves these voices — the base
 * models are American-trained and the instruction field steers delivery far
 * more strongly than phonology. Naming the specific features (syllable timing,
 * non-rhotic R, level intonation, clipped finals) gets noticeably closer.
 *
 * The other half of the work is done by the SCRIPT: the scenario coach lines
 * are written in Manglish, and word choice carries more of "sounds Malaysian"
 * than pronunciation does.
 */
const NOT_A_CARICATURE =
  "This is a real regional accent spoken by real people, not a comedy impression — never exaggerate it into a caricature, and do not imitate any specific person or performer.";

const ACCENTS: Record<string, string> = {
  my: [
    "Speak in a natural Malaysian English accent, the way someone in Kuala Lumpur actually speaks.",
    "Syllable-timed rhythm: give each syllable roughly equal length, rather than stretching stressed ones the way American English does.",
    "Keep the intonation flat and level. No rising American sentence melody, no upspeak.",
    "Non-rhotic: drop the hard R at the end of words entirely.",
    "Short, pure vowels, and clip the final consonants.",
    "Let particles like lah, one and okay sit lightly and naturally in the sentence.",
    NOT_A_CARICATURE,
  ].join(" "),
  /* Close to Malaysian but distinctly faster, flatter and more clipped, with a
     different particle set. */
  sg: [
    "Speak in a natural Singaporean English accent, the way a Singaporean speaks casually to a friend.",
    "Strongly syllable-timed and quite fast: equal-length syllables, clipped and staccato, no drawling.",
    "Very flat, level intonation with a slight rise-fall on the final particle. No American sentence melody, no upspeak.",
    "Non-rhotic: drop the final R completely.",
    "Glottal-stop the final consonants, especially T and K, so words end abruptly.",
    "Short pure vowels, no diphthong glide.",
    "Let the particles leh, lor, sia, hor and lah land naturally at the end of clauses, lightly, not performed.",
    NOT_A_CARICATURE,
  ].join(" "),
};

/** Switchable without a code change; anything unrecognised falls back to MY. */
const ACCENT = ACCENTS[process.env.KENA_TTS_ACCENT?.trim().toLowerCase() ?? "my"] ?? ACCENTS.my;

const DIRECTION: Record<"trap" | "coach", string> = {
  trap: `${ACCENT} Read this as a hurried voice note from someone who is stressed — natural, slightly rushed, a little breathless. Do not shout, do not sound sinister, and do not perform distress. This is an awareness demonstration, not a horror clip.`,
  coach: `${ACCENT} Warm, quick and a bit playful, like a friend teasing you for almost falling for it. Smiling, relaxed, never smug or lecturing.`,
};

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const { scenarioId, role } = parsed.data;
  const scenario = await getScenario(scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "unknown scenario" }, { status: 404 });
  }

  // Only ever the approved scenario text. Never anything from the request.
  const text = role === "trap" ? scenario.body : scenario.coachLine;
  if (!text) return new NextResponse(null, { status: 204 });

  // The delivery instructions are part of the key. Without them, editing the
  // accent direction silently served the old clip back from disk and looked
  // like the instruction had no effect.
  const key = createHash("sha256")
    .update(`${TTS_MODEL}|${ttsVoice(role)}|${scenarioId}|${role}|${DIRECTION[role]}|${text}`)
    .digest("hex")
    .slice(0, 24);
  const file = path.join(CACHE_DIR, `${key}.mp3`);

  // Serve the cached clip if we already generated this one.
  try {
    const cached = await readFile(file);
    return new NextResponse(new Uint8Array(cached), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Kena-Audio": "cache",
      },
    });
  } catch {
    /* Not generated yet. */
  }

  const api = openai();
  // No key, or over the daily cap: the transcript-only experience is complete.
  if (!api) return new NextResponse(null, { status: 204 });

  try {
    const speech = await api.audio.speech.create({
      model: TTS_MODEL,
      voice: ttsVoice(role),
      input: text,
      instructions: DIRECTION[role],
    });
    const buffer = Buffer.from(await speech.arrayBuffer());

    // Best-effort cache; a read-only filesystem must not break playback.
    try {
      await mkdir(CACHE_DIR, { recursive: true });
      await writeFile(file, buffer);
    } catch {
      /* Ignore: the clip still plays, it is just regenerated next time. */
    }

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Kena-Audio": "generated",
      },
    });
  } catch (error) {
    console.warn("[voice] unavailable:", error instanceof Error ? error.message : error);
    return new NextResponse(null, { status: 204 });
  }
}
