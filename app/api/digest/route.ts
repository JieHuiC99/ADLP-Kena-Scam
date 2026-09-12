import { NextResponse } from "next/server";
import { jsonCompletion, aiAvailable } from "@/lib/ai";
import { getDigest, getStories, getTrends } from "@/lib/repo";

/**
 * Kena Weekly generation.
 *
 * The model is given ONLY approved story and trend records — nothing
 * unmoderated, nothing from a platform, nothing a visitor submitted. If it is
 * unavailable, the seeded digest is returned, which is what the page shows by
 * default anyway.
 *
 * This is a GET because it is idempotent and takes no input: there is nothing
 * to pass, precisely because the source records are fixed.
 */

type Generated = {
  headline: string;
  emergingMethod: string;
  susLinkBehaviour: string;
  aiScamWatch: string;
  familyGroupTip: string;
};

export async function GET() {
  const [digest, stories, trends] = await Promise.all([getDigest(), getStories(), getTrends()]);
  if (!digest) {
    return NextResponse.json({ error: "no digest available" }, { status: 503 });
  }

  if (!aiAvailable) {
    return NextResponse.json({ ...digest, engine: "seed" });
  }

  // Approved records only, and only the fields a digest needs.
  const approved = stories
    .filter((story) => story.status === "approved_demo")
    .slice(0, 12)
    .map((story) =>
      [
        `- ${story.title} (${story.platform}, ${story.category}, ${story.state})`,
        `  red flags: ${story.redFlags.join("; ")}`,
        `  safe action: ${story.safeAction}`,
      ].join("\n")
    )
    .join("\n");

  const trendLines = trends
    .slice(0, 6)
    .map((trend) => `- ${trend.title} (+${trend.momentum}%): ${trend.tagline}`)
    .join("\n");

  const result = await jsonCompletion<Generated>({
    schemaName: "kena_weekly_digest",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        headline: { type: "string" },
        emergingMethod: { type: "string" },
        susLinkBehaviour: { type: "string" },
        aiScamWatch: { type: "string" },
        familyGroupTip: { type: "string" },
      },
      required: [
        "headline",
        "emergingMethod",
        "susLinkBehaviour",
        "aiScamWatch",
        "familyGroupTip",
      ],
    },
    system: [
      "You write Kena Weekly, a Malaysian scam-awareness digest.",
      "Use ONLY the approved records provided. Never invent a story, statistic, platform partnership or data source.",
      "Never name or accuse a person, business, bank, account or phone number. Describe methods only.",
      "Never claim something is definitely a scam, and never present these as live or verified statistics.",
      "Each section is 2 to 4 sentences, ending with something concrete the reader can do.",
      "familyGroupTip must be one line someone can forward to a family group chat as-is.",
      "Warm, direct Malaysian English. Light Manglish is fine; no jokes about people losing money.",
    ].join(" "),
    user: [
      "TRENDS:",
      trendLines,
      "",
      "APPROVED STORIES:",
      approved,
      "",
      `Keep this headline unless a better one is clearly warranted: "${digest.headline}"`,
    ].join("\n"),
    maxTokens: 900,
    temperature: 0.5,
  });

  if (!result) return NextResponse.json({ ...digest, engine: "seed" });

  return NextResponse.json({
    ...digest,
    headline: result.headline || digest.headline,
    emergingMethod: result.emergingMethod,
    susLinkBehaviour: result.susLinkBehaviour,
    aiScamWatch: result.aiScamWatch,
    familyGroupTip: result.familyGroupTip,
    engine: "openai",
  });
}
