import { NextResponse } from "next/server";
import { z } from "zod";
import { MODEL, openai } from "@/lib/ai";
import { getStory } from "@/lib/repo";
import { LANG_FULL } from "@/lib/data/types";
import type { Lang } from "@/lib/data/types";

/**
 * "Translate lah".
 *
 * Seeded translations are served first — every curated story already carries
 * all four languages, so in practice this route never needs a model at all.
 * It exists for the case a story is missing one, and it takes a story id rather
 * than free text so it cannot be used as a general translation endpoint.
 *
 * The original is never replaced: the UI keeps it one tap away, and the
 * translation is always labelled as possibly AI-assisted.
 */

const Body = z.object({
  storyId: z.string().min(1).max(64),
  target: z.enum(["bm", "en", "zh", "ta"]),
});

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid request" }, { status: 400 });
  }

  const { storyId, target } = parsed.data;
  const story = await getStory(storyId);
  if (!story) return NextResponse.json({ error: "unknown story" }, { status: 404 });

  const seeded = story.translations[target as Lang];
  if (seeded && seeded !== story.originalText) {
    return NextResponse.json({ text: seeded, engine: "seed", aiAssisted: false });
  }

  const api = openai();
  // No key: the original text is still a complete, honest answer.
  if (!api) {
    return NextResponse.json({
      text: story.originalText,
      engine: "seed",
      aiAssisted: false,
      note: `No ${LANG_FULL[target]} translation is stored for this story.`,
    });
  }

  try {
    const response = await api.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_completion_tokens: 600,
      messages: [
        {
          role: "system",
          content: [
            `Translate a Malaysian scam-awareness story into ${LANG_FULL[target]}.`,
            "Translate naturally rather than literally; keep it readable for an ordinary reader.",
            "Preserve every bracketed redaction placeholder exactly as written.",
            "Do not add, remove, soften or embellish anything. Do not add commentary.",
            "Return only the translated text.",
          ].join(" "),
        },
        { role: "user", content: story.originalText.slice(0, 3000) },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();
    if (!text) {
      return NextResponse.json({ text: story.originalText, engine: "seed", aiAssisted: false });
    }
    return NextResponse.json({ text, engine: "openai", aiAssisted: true });
  } catch {
    return NextResponse.json({ text: story.originalText, engine: "seed", aiAssisted: false });
  }
}
