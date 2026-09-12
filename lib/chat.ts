import { getStories, getTrends } from "./repo";
import { parseQuery } from "./search/query";
import type { ChatCitation, Story, Trend } from "./data/types";

/**
 * Grounding for "Ask Kena Scam".
 *
 * The assistant is a Malaysia scam TREND EXPLORER, not a scam detector. It
 * answers only from approved story and trend records plus clearly-labelled
 * safety guidance, and it cites what it used.
 *
 * Retrieval happens here, before any model is involved, for two reasons. It
 * means the citations are real records rather than something a model claimed
 * existed; and it means the no-key fallback answers from exactly the same
 * evidence, so turning the model off changes the prose and nothing else.
 */

export type Grounding = {
  stories: Story[];
  trends: Trend[];
  citations: ChatCitation[];
  /** True when the question is about what to do after being scammed. */
  isRecovery: boolean;
};

const RECOVERY_HINTS = [
  "kena already", "i kena", "just transferred", "lost money", "sent money", "scammed me",
  "got scammed", "what should i do", "what do i do", "help me", "otp", "shared my password",
  "recover", "报警", "被骗", "kena tipu", "sudah kena",
];

export function looksLikeRecovery(question: string): boolean {
  const q = question.toLowerCase();
  return RECOVERY_HINTS.some((hint) => q.includes(hint));
}

/** Scores a story against the question, using tags first and then wording. */
function scoreStory(story: Story, tags: string[], words: string[]): number {
  let score = tags.filter((tag) => story.tags.includes(tag)).length * 5;
  const haystack = `${story.title} ${story.summary} ${story.redFlags.join(" ")} ${story.safeAction}`
    .toLowerCase();
  for (const word of words) if (word.length > 3 && haystack.includes(word)) score += 1;
  return score;
}

function scoreTrend(trend: Trend, tags: string[], words: string[]): number {
  let score = tags.filter((tag) => trend.tags.includes(tag)).length * 5;
  const haystack = `${trend.title} ${trend.tagline} ${trend.summary} ${trend.whySpreading}`
    .toLowerCase();
  for (const word of words) if (word.length > 3 && haystack.includes(word)) score += 1;
  return score;
}

export async function ground(question: string): Promise<Grounding> {
  const [allStories, allTrends] = await Promise.all([getStories(), getTrends()]);
  const parsed = parseQuery(question);
  const words = question.toLowerCase().split(/\s+/).map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""));

  const stories = allStories
    .map((story) => ({ story, score: scoreStory(story, parsed.tags, words) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((row) => row.story);

  const trends = allTrends
    .map((trend) => ({ trend, score: scoreTrend(trend, parsed.tags, words) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((row) => row.trend);

  const citations: ChatCitation[] = [
    ...trends.map((trend) => ({
      kind: "trend" as const,
      id: trend.id,
      title: trend.title,
      href: `/trends/${trend.slug}`,
    })),
    ...stories.map((story) => ({
      kind: "story" as const,
      id: story.id,
      title: story.title,
      href: `/tea/${story.slug}`,
    })),
  ];

  return { stories, trends, citations, isRecovery: looksLikeRecovery(question) };
}

/** The evidence pack handed to the model. Nothing outside it may be used. */
export function groundingToContext(grounding: Grounding): string {
  const lines: string[] = [];

  for (const trend of grounding.trends) {
    lines.push(
      [
        `TREND ${trend.id} — ${trend.title}`,
        `Tagline: ${trend.tagline}`,
        `Summary: ${trend.summary}`,
        `Why it spreads: ${trend.whySpreading}`,
        `Red flags: ${trend.redFlags.join("; ")}`,
        `Safe action: ${trend.safeAction}`,
        `Seen on: ${trend.platforms.join(", ")}`,
      ].join("\n")
    );
  }

  for (const story of grounding.stories) {
    lines.push(
      [
        `STORY ${story.id} — ${story.title}`,
        `Platform: ${story.platform} · Language: ${story.originalLanguage} · State: ${story.state}`,
        `Category: ${story.category} · Approximate loss: ${story.lossRange}`,
        `Summary: ${story.summary}`,
        `Red flags: ${story.redFlags.join("; ")}`,
        `Safe action: ${story.safeAction}`,
      ].join("\n")
    );
  }

  return lines.join("\n\n---\n\n");
}

/**
 * The no-key answer.
 *
 * Composed from the same retrieved records the model would have received, so
 * it is grounded in exactly the same way — it simply reads as assembled rather
 * than written. It never asserts that anything is definitely a scam.
 */
export function localAnswer(question: string, grounding: Grounding): string {
  if (grounding.isRecovery) {
    return [
      "If money has already moved, the order matters: call your bank on the number printed on your own card and ask them to freeze the transfer, then report it through the official national scam response line and make a police report. Write down the time, amount and account name while it is fresh, and do not delete the conversation.",
      "If you shared an OTP or password instead, change that password from another device, turn on two-step verification, and tell your bank that a code was shared.",
      "The I kena already page has the full ordered steps, and it is written to be followed while panicking. You are not stupid — these are built to rush you.",
    ].join("\n\n");
  }

  if (!grounding.trends.length && !grounding.stories.length) {
    return [
      "I could not match that to anything in the Kena Scam story set, so I would rather say so than guess.",
      "Try naming a scam type, a platform, a state or a language — for example \"what is trending on WhatsApp\", \"fake job stories in BM\", or \"explain the AI voice scam\". I can only answer from the stories and trends collected here.",
    ].join("\n\n");
  }

  const parts: string[] = [];

  if (grounding.trends.length) {
    const trend = grounding.trends[0];
    parts.push(
      `Closest pattern in our set is ${trend.title} — ${trend.tagline.toLowerCase()} ${trend.summary}`
    );
    parts.push(`Why it spreads: ${trend.whySpreading}`);
    parts.push(`Red flags people described:\n• ${trend.redFlags.join("\n• ")}`);
    parts.push(`Safer next step: ${trend.safeAction}`);
  } else {
    const story = grounding.stories[0];
    parts.push(`The closest story in our set is "${story.title}" (${story.platform}, ${story.state}). ${story.summary}`);
    parts.push(`Red flags in it:\n• ${story.redFlags.join("\n• ")}`);
    parts.push(`Safer next step: ${story.safeAction}`);
  }

  const platforms = Array.from(new Set(grounding.stories.map((story) => story.platform)));
  if (platforms.length > 1) {
    parts.push(
      `Worth knowing: the same pattern shows up on ${platforms.join(", ")} in our collected stories — which is usually how people miss it.`
    );
  }

  parts.push(
    "I explain patterns and red flags only. I cannot verify any specific person, business, account or link, and I will never tell you something is definitely a scam."
  );

  return parts.join("\n\n");
}

export const CHAT_SYSTEM_PROMPT = [
  "You are Ask Kena Scam, a Malaysia scam TREND EXPLORER for a scam-awareness prototype.",
  "",
  "You explain how scam patterns work, what red flags people reported, and what a safe next step is.",
  "",
  "HARD RULES:",
  "- Answer ONLY from the approved records in the CONTEXT block and general, clearly-labelled safety guidance. If the context does not cover the question, say so plainly and suggest what to ask instead.",
  "- You are NOT a scam detector. Never say something is definitely a scam, or definitely safe.",
  "- NEVER verify or make a claim about a specific person, business, bank, phone number, account number, URL or app. If asked, explain that Kena Scam does not verify these, and describe the pattern instead.",
  "- Never accuse anyone. Talk about methods, not people.",
  "- Never invent a story, statistic, platform partnership or data source. These are curated demo records.",
  "- If the user indicates they have already lost money or shared credentials, lead with calm practical steps and point to the I kena already page. No jokes in that case.",
  "",
  "STYLE: Malaysian-English, warm and direct. Short paragraphs. Light Manglish is fine for general questions, never when someone has been hurt. 120 words or fewer unless listing red flags.",
].join("\n");
