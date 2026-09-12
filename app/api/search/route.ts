import { NextResponse } from "next/server";
import { z } from "zod";
import { jsonCompletion, aiAvailable } from "@/lib/ai";
import { TAG_IDS, sanitiseTags } from "@/lib/data/taxonomy";
import { parseQuery } from "@/lib/search/query";

/**
 * Natural language → structured filters.
 *
 * The contract is narrow on purpose: this endpoint returns an array of tag ids
 * from the controlled taxonomy and nothing else. No prose, no summary, no
 * factual claim about anything. Every id the model proposes is validated
 * against the taxonomy before it leaves this file, so an invented tag is
 * dropped rather than rendered.
 *
 * With no key it answers from the local synonym mapper, which resolves the same
 * phrasings. The client applies that mapper first anyway, so this route is a
 * refinement rather than a dependency.
 */

const Body = z.object({ query: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ tags: [], engine: "local" }, { status: 400 });
  }

  const query = parsed.data.query;
  const local = parseQuery(query).tags;

  if (!aiAvailable) {
    return NextResponse.json({ tags: local, engine: "local" });
  }

  const result = await jsonCompletion<{ tags: string[] }>({
    schemaName: "kena_search_filters",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        tags: { type: "array", items: { type: "string", enum: TAG_IDS } },
      },
      required: ["tags"],
    },
    system: [
      "You convert a Malaysian scam-awareness search query into filter tags.",
      "Return ONLY tag ids from the provided enum. Never invent a tag.",
      "Never return a tag for a person, business, bank, phone number or account — no such tag exists.",
      "Return between 0 and 4 tags. Prefer the scam type, then the platform, state or language if the query names one.",
      "Return no tags at all rather than a loose guess.",
    ].join(" "),
    user: `Query: "${query}"`,
    maxTokens: 120,
  });

  // Fall back to the local mapper whenever the model adds nothing.
  const tags = sanitiseTags(result?.tags ?? [], 6);
  if (!tags.length) return NextResponse.json({ tags: local, engine: "local" });

  return NextResponse.json({ tags, engine: "openai" });
}
