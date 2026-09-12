import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonCompletion, aiAvailable } from "@/lib/ai";
import { TAG_IDS, sanitiseTags } from "@/lib/data/taxonomy";
import { suggestTags } from "@/lib/search/query";

/**
 * "Auto-tag my tea ✨".
 *
 * The model may only choose from the controlled taxonomy, and every id it
 * returns is validated against that taxonomy again here before responding. That
 * is what makes a defamatory tag structurally impossible rather than merely
 * discouraged: there is no tag in the vocabulary that names a person, business,
 * bank account or phone number, so there is none to return.
 *
 * Suggesting is never submitting. The response is a proposal the user edits.
 */

const Body = z.object({ text: z.string().min(20).max(4000) });

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ tags: [], engine: "local" }, { status: 400 });
  }

  const text = parsed.data.text;
  const local = suggestTags(text);

  if (!aiAvailable) {
    return NextResponse.json({ tags: local, engine: "local" });
  }

  const result = await jsonCompletion<{ tags: string[] }>({
    schemaName: "kena_story_tags",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        tags: { type: "array", items: { type: "string", enum: TAG_IDS } },
      },
      required: ["tags"],
    },
    system: [
      "You label a Malaysian scam story with tags for a moderation queue.",
      "Return 3 to 6 tag ids, ONLY from the provided enum.",
      "Include the scam type, the manipulation tactics used, and the platform, state and language if the text makes them clear.",
      "Never describe, name or imply a specific person, business, bank, phone number or account.",
      "These are suggestions a human will confirm, so prefer precision over coverage.",
    ].join(" "),
    user: text.slice(0, 3000),
    maxTokens: 150,
  });

  const tags = sanitiseTags(result?.tags ?? [], 6);
  if (tags.length < 3) {
    // Too thin to be useful; the local tagger is more consistent than a guess.
    const merged = Array.from(new Set([...tags, ...local])).slice(0, 6);
    return NextResponse.json({ tags: merged, engine: "local" });
  }

  return NextResponse.json({ tags, engine: "openai" });
}
