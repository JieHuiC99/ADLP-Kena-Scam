import { cache } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { CATEGORY_TAG, LANG_TAG, stateTagId } from "./data/taxonomy";
import { publicAttributionFor, type StoryView } from "./provenance";
import type {
  Category,
  Difficulty,
  Lang,
  LossRange,
  MyState,
  Platform,
  RadarReport,
  Severity,
  SimulationChoice,
  SimulationScenario,
  Story,
  StorySource,
  Trend,
  TranscriptFlag,
  WeeklyDigest,
} from "./data/types";

/**
 * The single data access point.
 *
 * Every page, chart, filter and API route reads through this module, which is
 * what guarantees the feed, the radar, the pulse dashboard and the chatbot are
 * all describing the same records rather than drifting apart.
 *
 * Reads are wrapped in React's `cache`, so one render pass fetches each table
 * at most once however many components ask for it. The whole dataset is small
 * and entirely public demo content, so fetching it whole and filtering in
 * memory is both simpler and faster than a query per filter combination.
 *
 * If Supabase is unconfigured or unreachable, every accessor returns an empty
 * collection and the pages render an honest "not connected" state. It never
 * invents data to paper over an outage.
 */

export { isSupabaseConfigured };

export { REFERENCE_DATE } from "./config";
import { REFERENCE_DATE } from "./config";

/* ------------------------------------------------------------------- rows */

type StoryRow = {
  id: string;
  slug: string | null;
  title: string;
  summary: string | null;
  original_text: string;
  original_language: Lang;
  translations: Record<string, string> | null;
  title_translations: Record<string, string> | null;
  platform: Platform;
  category: Category;
  state: MyState;
  loss_range: LossRange;
  sus_score: number;
  story_date: string;
  trend_id: string | null;
  ai_suggested_tags: string[] | null;
  user_confirmed_tags: string[] | null;
  tag_status: "confirmed" | "pending_review";
  red_flags: string[] | null;
  safe_action: string | null;
  reactions: number;
  shares: number;
  saves: number;
  source_type: string;
  is_demo: boolean;
  status: string;
};

type TrendRow = {
  id: string;
  slug: string | null;
  title: string;
  tagline: string | null;
  summary: string;
  why_it_spreads: string;
  red_flags: string;
  safe_action: string;
  momentum: number;
  first_seen: string | null;
  platforms: Platform[] | null;
  languages: Lang[] | null;
  tags: string[] | null;
  weekly_status: string;
  is_demo: boolean;
};

type SourceRow = {
  id: string;
  story_id: string;
  platform: Platform;
  source_url: string | null;
  source_type: string;
  creator_display_name: string | null;
  creator_handle: string | null;
  credit_preference: StorySource["creditPreference"];
  consent_status: StorySource["consentStatus"];
  consent_recorded_at: string | null;
  review_status: StorySource["reviewStatus"];
  original_published_at: string | null;
  removal_requested_at: string | null;
  notes: string | null;
};

type RadarRow = {
  id: string;
  story_id: string | null;
  state: MyState;
  category: Category;
  platform: Platform;
  language: Lang;
  reported_at: string;
  severity: Severity;
  is_demo: boolean;
  status: string;
};

type ScenarioRow = {
  id: string;
  title: string;
  difficulty: Difficulty;
  medium: string | null;
  channel_label: string | null;
  prompt: string;
  choices: string[] | null;
  choice_details: SimulationChoice[] | null;
  correct_choice: number;
  red_flags: string[] | null;
  real_world_action: string | null;
  coach_line: string;
  transcript_flags: TranscriptFlag[] | null;
  is_ai_voice_final_boss: boolean;
  is_demo: boolean;
};

type DigestRow = {
  id: string;
  week_start: string;
  headline: string;
  top_stories: string[] | null;
  emerging_method: string;
  most_sus_link_behaviour: string;
  ai_scam_watch: string;
  family_group_tip: string;
  is_demo: boolean;
};

/* ---------------------------------------------------------------- mapping */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** A story's tags always include its own category, platform, state and language. */
function derivedTags(row: StoryRow): string[] {
  const confirmed = row.user_confirmed_tags ?? [];
  const implied = [
    CATEGORY_TAG[row.category],
    row.platform,
    stateTagId(row.state),
    LANG_TAG[row.original_language],
  ];
  return Array.from(new Set([...confirmed, ...implied].filter(Boolean)));
}

function toStory(row: StoryRow): Story {
  const translations = (row.translations ?? {}) as Record<Lang, string>;
  const titles = (row.title_translations ?? {}) as Record<Lang, string>;
  // A missing translation falls back to the original rather than rendering an
  // empty panel — the reader should always see the story.
  const fill = (source: Record<string, string>, fallback: string) =>
    ({
      bm: source.bm || fallback,
      en: source.en || fallback,
      zh: source.zh || fallback,
      ta: source.ta || fallback,
    }) as Record<Lang, string>;

  return {
    id: row.id,
    slug: row.slug || slugify(row.title),
    title: row.title,
    summary: row.summary || row.original_text.slice(0, 160),
    originalText: row.original_text,
    originalLanguage: row.original_language,
    translations: fill(translations, row.original_text),
    titleTranslations: fill(titles, row.title),
    platform: row.platform,
    category: row.category,
    state: row.state,
    lossRange: row.loss_range,
    susScore: row.sus_score,
    date: row.story_date,
    trendId: row.trend_id,
    tags: derivedTags(row),
    aiSuggestedTags: row.ai_suggested_tags ?? [],
    tagStatus: row.tag_status,
    redFlags: row.red_flags ?? [],
    safeAction: row.safe_action ?? "",
    reactions: row.reactions,
    shares: row.shares,
    saves: row.saves,
    sourceType: row.source_type,
    isDemo: row.is_demo,
    status: row.status,
  };
}

function toTrend(row: TrendRow): Trend {
  return {
    id: row.id,
    slug: row.slug || slugify(row.title),
    title: row.title,
    tagline: row.tagline || row.summary,
    summary: row.summary,
    whySpreading: row.why_it_spreads,
    // Stored as one semicolon-separated string in the existing schema.
    redFlags: row.red_flags
      .split(";")
      .map((flag) => flag.trim())
      .filter(Boolean)
      .map((flag) => flag.charAt(0).toUpperCase() + flag.slice(1)),
    safeAction: row.safe_action,
    momentum: row.momentum,
    firstSeen: row.first_seen,
    platforms: row.platforms ?? [],
    languages: row.languages ?? [],
    tags: row.tags ?? [],
    weeklyStatus: row.weekly_status,
    isDemo: row.is_demo,
  };
}

function toSource(row: SourceRow): StorySource {
  return {
    id: row.id,
    storyId: row.story_id,
    platform: row.platform,
    sourceUrl: row.source_url,
    sourceType: row.source_type,
    creatorDisplayName: row.creator_display_name,
    creatorHandle: row.creator_handle,
    creditPreference: row.credit_preference,
    consentStatus: row.consent_status,
    consentRecordedAt: row.consent_recorded_at,
    reviewStatus: row.review_status,
    originalPublishedAt: row.original_published_at,
    removalRequestedAt: row.removal_requested_at,
    notes: row.notes,
  };
}

const SEVERITY_SCORE: Record<Severity, number> = { low: 58, medium: 76, high: 92 };

function toScenario(row: ScenarioRow): SimulationScenario {
  const labels = row.choices ?? [];
  const details = row.choice_details ?? [];
  const choices: SimulationChoice[] = labels.length
    ? labels.map((label, index) => {
        const detail = details[index];
        return {
          label: detail?.label ?? label,
          outcome: detail?.outcome ?? (index === row.correct_choice ? "safe" : "kena"),
          feedback: detail?.feedback ?? "",
        };
      })
    : details;

  return {
    id: row.id,
    title: row.title,
    difficulty: row.difficulty,
    medium: row.medium === "voice" ? "voice" : "message",
    channelLabel: row.channel_label ?? "Message",
    body: row.prompt,
    choices,
    redFlags: row.red_flags ?? [],
    realWorldAction: row.real_world_action ?? "",
    coachLine: row.coach_line,
    transcriptFlags: row.transcript_flags ?? [],
    isFinalBoss: row.is_ai_voice_final_boss,
    isDemo: row.is_demo,
  };
}

/* ------------------------------------------------------------------ loads */

async function select<T>(table: string, columns = "*"): Promise<T[]> {
  const client = supabase();
  if (!client) return [];
  const { data, error } = await client.from(table).select(columns).limit(1000);
  if (error) {
    console.warn(`[repo] ${table} unavailable:`, error.message);
    return [];
  }
  return (data ?? []) as T[];
}

export const getStories = cache(async (): Promise<Story[]> => {
  const rows = await select<StoryRow>("stories");
  return rows.map(toStory).sort((a, b) => b.date.localeCompare(a.date));
});

export const getTrends = cache(async (): Promise<Trend[]> => {
  const rows = await select<TrendRow>("trends");
  return rows.map(toTrend).sort((a, b) => b.momentum - a.momentum);
});

export const getSources = cache(async (): Promise<Map<string, StorySource>> => {
  const rows = await select<SourceRow>("story_sources");
  return new Map(rows.map((row) => [row.story_id, toSource(row)]));
});

export const getRadarReports = cache(async (): Promise<RadarReport[]> => {
  const rows = await select<RadarRow>("radar_reports");
  return rows
    .map((row) => ({
      id: row.id,
      storyId: row.story_id,
      state: row.state,
      category: row.category,
      platform: row.platform,
      language: row.language,
      reportedAt: row.reported_at,
      severity: row.severity,
      isDemo: row.is_demo,
      status: row.status,
    }))
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));
});

export const getScenarios = cache(async (): Promise<SimulationScenario[]> => {
  const rows = await select<ScenarioRow>("simulation_scenarios");
  return rows.map(toScenario).sort((a, b) => a.id.localeCompare(b.id));
});

export const getDigest = cache(async (): Promise<WeeklyDigest | null> => {
  const rows = await select<DigestRow>("weekly_digests");
  const row = rows.sort((a, b) => b.week_start.localeCompare(a.week_start))[0];
  if (!row) return null;
  return {
    id: row.id,
    weekStart: row.week_start,
    headline: row.headline,
    topStoryIds: row.top_stories ?? [],
    emergingMethod: row.emerging_method,
    susLinkBehaviour: row.most_sus_link_behaviour,
    aiScamWatch: row.ai_scam_watch,
    familyGroupTip: row.family_group_tip,
    isDemo: row.is_demo,
  };
});

/* --------------------------------------------------------------- lookups */

export async function getStory(idOrSlug: string): Promise<Story | undefined> {
  const stories = await getStories();
  return stories.find((story) => story.slug === idOrSlug || story.id === idOrSlug);
}

export async function getTrend(idOrSlug: string): Promise<Trend | undefined> {
  const trends = await getTrends();
  return trends.find((trend) => trend.slug === idOrSlug || trend.id === idOrSlug);
}

export async function getScenario(id: string): Promise<SimulationScenario | undefined> {
  const scenarios = await getScenarios();
  return scenarios.find((scenario) => scenario.id === id);
}

export async function storiesForTrend(trendId: string): Promise<Story[]> {
  const stories = await getStories();
  return stories.filter((story) => story.trendId === trendId);
}

/** Platforms, languages and states a trend has actually been seen across. */
export async function trendReach(trendId: string) {
  const stories = await storiesForTrend(trendId);
  return {
    stories,
    platforms: Array.from(new Set(stories.map((story) => story.platform))),
    languages: Array.from(new Set(stories.map((story) => story.originalLanguage))),
    states: Array.from(new Set(stories.map((story) => story.state))),
  };
}

export async function getStorySource(storyId: string): Promise<StorySource | undefined> {
  const sources = await getSources();
  return sources.get(storyId);
}

/* -------------------------------------------------------------- ordering */

export type SortKey = "trending" | "newest" | "shared";

export const SORTS: Array<{ id: SortKey; label: string }> = [
  { id: "trending", label: "Trending now" },
  { id: "newest", label: "Newest tea" },
  { id: "shared", label: "Most shared" },
];

export function trendingScore(story: Story, now = REFERENCE_DATE.getTime()): number {
  // Engagement decayed by age, so a strong old story does not outrank a
  // fast-moving new one forever.
  const ageDays = Math.max(1, (now - Date.parse(story.date)) / 86_400_000);
  return (story.reactions + story.shares * 2 + story.saves) / Math.pow(ageDays, 0.85);
}

export function sortStories<T extends Story>(stories: T[], sort: SortKey): T[] {
  const copy = [...stories];
  if (sort === "newest") return copy.sort((a, b) => b.date.localeCompare(a.date));
  if (sort === "shared") return copy.sort((a, b) => b.shares - a.shares);
  return copy.sort((a, b) => trendingScore(b) - trendingScore(a));
}

/**
 * "Related tea you might have missed."
 *
 * Ranked by shared trend and overlapping tags, then deliberately biased toward
 * a DIFFERENT platform and language from the story being read — because the
 * whole premise of Kena Scam is that the same scam is being retold somewhere
 * you are not looking.
 */
export async function relatedStories(story: Story, limit = 3): Promise<Story[]> {
  const stories = await getStories();
  return stories
    .filter((candidate) => candidate.id !== story.id)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => story.tags.includes(tag)).length;
      let score = sharedTags * 2;
      if (candidate.trendId && candidate.trendId === story.trendId) score += 6;
      if (candidate.platform !== story.platform) score += 3;
      if (candidate.originalLanguage !== story.originalLanguage) score += 3;
      return { candidate, score };
    })
    .filter((row) => row.score > 5)
    .sort((a, b) => b.score - a.score || b.candidate.date.localeCompare(a.candidate.date))
    .slice(0, limit)
    .map((row) => row.candidate);
}

/** Trend clusters the given tags touch — used when a tag chip is clicked. */
export async function trendsForTags(tags: string[]): Promise<Trend[]> {
  if (!tags.length) return [];
  const [stories, trends] = await Promise.all([getStories(), getTrends()]);
  const ids = new Set(
    stories
      .filter((story) => tags.some((tag) => story.tags.includes(tag)))
      .map((story) => story.trendId)
      .filter((id): id is string => Boolean(id))
  );
  trends.forEach((trend) => {
    if (trend.tags.some((tag) => tags.includes(tag))) ids.add(trend.id);
  });
  return trends.filter((trend) => ids.has(trend.id));
}

export { SEVERITY_SCORE };

/* ------------------------------------------------------- story + provenance */

/**
 * A story bundled with the attribution the consent rules permit.
 *
 * Components never compute attribution themselves — they render this. Pairing
 * the two here means every surface that shows a story is showing the same
 * answer to "may we say where this came from", including the client components
 * the feed hands them to.
 */
export async function decorate(stories: Story[]): Promise<StoryView[]> {
  const sources = await getSources();
  return stories.map((story) => ({
    ...story,
    attribution: publicAttributionFor(sources.get(story.id), story.platform),
  }));
}

export async function getStoryViews(): Promise<StoryView[]> {
  return decorate(await getStories());
}

export type { StoryView };
