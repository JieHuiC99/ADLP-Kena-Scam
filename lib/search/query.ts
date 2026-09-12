import { ALL_TAGS, TAG_CATEGORY, TAG_LANG, TAG_PLATFORM, TAG_STATE } from "../data/taxonomy";
import type { Category, Lang, MyState, Platform } from "../data/types";

/**
 * Natural-language query → controlled tags.
 *
 * "fake job in Johor"        → #FakeJob + #Johor
 * "parcel scam WhatsApp"     → #ParcelScam + #WhatsApp
 * "AI voice scam"            → #AIVoice
 *
 * Purely local: it matches the query against the synonym table in the taxonomy
 * and returns tag ids. /api/search can do the same job with a model when a key
 * is configured, but it is held to the identical contract — structured filters
 * drawn from the taxonomy, never prose and never a factual claim — and falls
 * back to this function whenever the model is unavailable or returns anything
 * unrecognised.
 */

export type ParsedQuery = {
  tags: string[];
  /** Words that did not resolve to a tag, kept as the free-text search. */
  rest: string;
};

/** Longest synonyms first, so "ai voice" wins over "voice" inside one pass. */
const MATCHERS = ALL_TAGS.flatMap((tag) =>
  [tag.label.toLowerCase(), tag.id.toLowerCase(), ...tag.synonyms].map((phrase) => ({
    tagId: tag.id,
    phrase: phrase.toLowerCase(),
  }))
).sort((a, b) => b.phrase.length - a.phrase.length);

/** Noise words that should never survive into the free-text remainder. */
const STOPWORDS = new Set([
  "scam", "scams", "in", "on", "the", "a", "an", "of", "for", "about", "me", "show",
  "find", "search", "story", "stories", "tea", "any", "what", "whats", "and", "with",
  "kena", "penipuan", "tipu", "诈骗", "骗局", "மோசடி",
]);

export function parseQuery(raw: string): ParsedQuery {
  const query = ` ${raw.toLowerCase().trim()} `;
  if (!query.trim()) return { tags: [], rest: "" };

  let remaining = query;
  const tags: string[] = [];

  for (const { tagId, phrase } of MATCHERS) {
    if (tags.includes(tagId)) continue;
    if (phrase.length < 2) continue;
    // Word-boundary match for latin phrases; plain inclusion for scripts
    // without spaces, where \b does not apply.
    const isLatin = /^[a-z0-9\s/-]+$/.test(phrase);
    const found = isLatin
      ? new RegExp(`(^|[^a-z0-9])${escapeRegExp(phrase)}([^a-z0-9]|$)`).test(remaining)
      : remaining.includes(phrase);
    if (!found) continue;
    tags.push(tagId);
    remaining = remaining.replace(new RegExp(escapeRegExp(phrase), "g"), " ");
  }

  const rest = remaining
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter((word) => word.length > 1 && !STOPWORDS.has(word))
    .join(" ")
    .trim();

  return { tags, rest };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Splits resolved tags into the concrete feed filters they imply.
 *
 * A platform, state or language tag is the same statement as the corresponding
 * dropdown, so selecting it in the search box should move the dropdown too —
 * otherwise the UI shows two different answers to one question.
 */
export function tagsToFilters(tags: string[]): {
  tags: string[];
  platform: Platform | null;
  state: MyState | null;
  language: Lang | null;
  category: Category | null;
} {
  let platform: Platform | null = null;
  let state: MyState | null = null;
  let language: Lang | null = null;
  let category: Category | null = null;

  for (const tag of tags) {
    if (!platform && TAG_PLATFORM[tag]) platform = TAG_PLATFORM[tag];
    else if (!state && TAG_STATE[tag]) state = TAG_STATE[tag];
    else if (!language && TAG_LANG[tag]) language = TAG_LANG[tag];
    else if (!category && TAG_CATEGORY[tag]) category = TAG_CATEGORY[tag];
  }

  // Tactic tags have no dropdown, so they stay as chips.
  const chipTags = tags.filter(
    (tag) => !TAG_PLATFORM[tag] && !TAG_STATE[tag] && !TAG_LANG[tag] && !TAG_CATEGORY[tag]
  );

  return { tags: chipTags, platform, state, language, category };
}

/**
 * The local "Auto-tag my tea" tagger.
 *
 * Scores every taxonomy entry against the draft text and returns the best 3–6.
 * Because candidates can only ever come from the taxonomy, it is structurally
 * incapable of producing a tag that names a person, business, account or phone
 * number — there is no such tag to return.
 */
export function suggestTags(text: string, min = 3, max = 6): string[] {
  const body = ` ${text.toLowerCase()} `;
  if (body.trim().length < 3) return [];

  const scores = new Map<string, number>();
  for (const tag of ALL_TAGS) {
    let score = 0;
    for (const phrase of [tag.label.toLowerCase(), ...tag.synonyms]) {
      if (phrase.length < 3) continue;
      if (body.includes(phrase)) score += phrase.length > 6 ? 3 : 2;
    }
    // A tactic is a weaker signal than a scam type, so type tags surface first
    // when both match — the type is what a reader filters by.
    if (score > 0) {
      const weight = tag.facet === "scam_type" ? 1.4 : tag.facet === "tactic" ? 1.1 : 1;
      scores.set(tag.id, score * weight);
    }
  }

  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  return ranked.slice(0, Math.max(min, Math.min(max, ranked.length)));
}
