import { REFERENCE_DATE, getRadarReports, getStories, getTrends } from "./repo";
import { CATEGORY_LONG, LOSS_RANGES, STATES } from "./data/types";
import type {
  Category,
  Lang,
  MyState,
  Platform,
  RadarReport,
  Story,
  Trend,
} from "./data/types";
import { LANG_LABEL } from "./data/types";

/**
 * Every figure on the Pulse dashboard and Scam Radar is computed here, from the
 * same rows that power the feed. Nothing is a hard-coded statistic, so a change
 * in Supabase moves the charts with it — which is the only honest way to show
 * numbers next to the stories they came from.
 *
 * These are curated demo records. Nothing here is a live or verified statistic.
 */

export type Bucket = { label: string; value: number };

function tally<T extends string>(values: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function toBuckets<T extends string>(counts: Map<T, number>, label: (key: T) => string): Bucket[] {
  return Array.from(counts.entries())
    .map(([key, value]) => ({ label: label(key), value }))
    .sort((a, b) => b.value - a.value);
}

function maxEntry<T extends string>(counts: Map<T, number>): [T, number] {
  let best: [T, number] = ["" as T, -1];
  for (const entry of counts.entries()) if (entry[1] > best[1]) best = entry;
  return best;
}

/* ------------------------------------------------------------------ pulse */

export type PulseOverview = {
  connected: boolean;
  totalStories: number;
  totalTrends: number;
  totalReports: number;
  topPlatform: { label: string; value: number; share: number };
  topCategory: { label: string; value: number; share: number };
  languagesCovered: number;
  statesCovered: number;
  byState: Bucket[];
  byCategory: Bucket[];
  byPlatform: Bucket[];
  byLanguage: Bucket[];
  byLoss: Bucket[];
  rising: Array<{ title: string; slug: string; momentum: number; stories: number }>;
  aiWatch: {
    stories: number;
    share: number;
    momentum: number;
    sampleSlug: string | null;
    trendSlug: string | null;
  };
};

export async function getPulse(): Promise<PulseOverview> {
  const [stories, trends, reports] = await Promise.all([
    getStories(),
    getTrends(),
    getRadarReports(),
  ]);

  if (!stories.length) {
    return {
      connected: false,
      totalStories: 0,
      totalTrends: trends.length,
      totalReports: reports.length,
      topPlatform: { label: "—", value: 0, share: 0 },
      topCategory: { label: "—", value: 0, share: 0 },
      languagesCovered: 0,
      statesCovered: 0,
      byState: [],
      byCategory: [],
      byPlatform: [],
      byLanguage: [],
      byLoss: [],
      rising: [],
      aiWatch: { stories: 0, share: 0, momentum: 0, sampleSlug: null, trendSlug: null },
    };
  }

  const platformCounts = tally(stories.map((story) => story.platform));
  const categoryCounts = tally(stories.map((story) => story.category));
  const topPlatform = maxEntry(platformCounts);
  const topCategory = maxEntry(categoryCounts);

  const aiStories = stories.filter((story) => story.category === "AI Voice");
  const aiTrend = trends.find((trend) => trend.tags.includes("AIVoice"));

  return {
    connected: true,
    totalStories: stories.length,
    totalTrends: trends.length,
    totalReports: reports.length,
    topPlatform: {
      label: topPlatform[0],
      value: topPlatform[1],
      share: Math.round((topPlatform[1] / stories.length) * 100),
    },
    topCategory: {
      label: topCategory[0],
      value: topCategory[1],
      share: Math.round((topCategory[1] / stories.length) * 100),
    },
    languagesCovered: new Set(stories.map((story) => story.originalLanguage)).size,
    statesCovered: new Set(stories.map((story) => story.state)).size,
    byState: toBuckets(tally(stories.map((story) => story.state)), (state) => state),
    byCategory: toBuckets(tally(stories.map((story) => story.category)), (category) => category),
    byPlatform: toBuckets(tally(stories.map((story) => story.platform)), (platform) => platform),
    byLanguage: toBuckets(
      tally(stories.map((story) => story.originalLanguage)),
      (lang) => LANG_LABEL[lang]
    ),
    byLoss: lossBuckets(stories),
    rising: trends.slice(0, 4).map((trend) => ({
      title: trend.title,
      slug: trend.slug,
      momentum: trend.momentum,
      stories: stories.filter((story) => story.trendId === trend.id).length,
    })),
    aiWatch: {
      stories: aiStories.length,
      share: Math.round((aiStories.length / stories.length) * 100),
      momentum: aiTrend?.momentum ?? 0,
      sampleSlug: aiStories[0]?.slug ?? null,
      trendSlug: aiTrend?.slug ?? null,
    },
  };
}

/** Loss ranges keep their natural order rather than sorting by size. */
function lossBuckets(stories: Story[]): Bucket[] {
  const counts = tally(stories.map((story) => story.lossRange));
  return LOSS_RANGES.filter((range) => counts.has(range)).map((range) => ({
    label: range,
    value: counts.get(range) ?? 0,
  }));
}

/* ------------------------------------------------------------------ radar */

export type RadarFilters = {
  state?: MyState | null;
  category?: Category | null;
  platform?: Platform | null;
  language?: Lang | null;
  days?: number;
};

export type RadarOverview = {
  connected: boolean;
  rangeDays: number;
  total: number;
  previousTotal: number;
  deltaPct: number;
  hottestState: { label: string; value: number; share: number } | null;
  byState: Bucket[];
  byCategory: Bucket[];
  byPlatform: Bucket[];
  byLanguage: Bucket[];
  timeline: Array<{ day: string; value: number }>;
  recent: RadarReport[];
  rising: Array<{ label: string; recent: number; previous: number; deltaPct: number }>;
  heating: boolean;
};

function matches(report: RadarReport, filters: RadarFilters): boolean {
  if (filters.state && report.state !== filters.state) return false;
  if (filters.category && report.category !== filters.category) return false;
  if (filters.platform && report.platform !== filters.platform) return false;
  if (filters.language && report.language !== filters.language) return false;
  return true;
}

export async function getRadarOverview(filters: RadarFilters = {}): Promise<RadarOverview> {
  const all = await getRadarReports();
  const days = filters.days ?? 7;
  const end = REFERENCE_DATE.getTime();
  const windowStart = end - days * 86_400_000;
  const priorStart = windowStart - days * 86_400_000;

  const current = all.filter(
    (report) => matches(report, filters) && Date.parse(report.reportedAt) >= windowStart
  );
  // The equivalent window immediately before, for the comparison figures.
  const previous = all.filter((report) => {
    if (!matches(report, filters)) return false;
    const time = Date.parse(report.reportedAt);
    return time >= priorStart && time < windowStart;
  });

  const byState = toBuckets(tally(current.map((report) => report.state)), (state) => state);
  const currentCats = tally(current.map((report) => report.category));
  const previousCats = tally(previous.map((report) => report.category));

  const rising = Array.from(currentCats.entries())
    .map(([category, recent]) => {
      const prior = previousCats.get(category) ?? 0;
      return {
        label: CATEGORY_LONG[category],
        recent,
        previous: prior,
        deltaPct: prior === 0 ? (recent > 0 ? 100 : 0) : Math.round((recent / prior - 1) * 100),
      };
    })
    .sort((a, b) => b.deltaPct - a.deltaPct || b.recent - a.recent)
    .slice(0, 5);

  const deltaPct =
    previous.length === 0
      ? current.length > 0
        ? 100
        : 0
      : Math.round((current.length / previous.length - 1) * 100);

  return {
    connected: all.length > 0,
    rangeDays: days,
    total: current.length,
    previousTotal: previous.length,
    deltaPct,
    hottestState: byState[0]
      ? {
          label: byState[0].label,
          value: byState[0].value,
          share: Math.round((byState[0].value / Math.max(1, current.length)) * 100),
        }
      : null,
    byState,
    byCategory: toBuckets(currentCats, (category) => category),
    byPlatform: toBuckets(tally(current.map((report) => report.platform)), (platform) => platform),
    byLanguage: toBuckets(
      tally(current.map((report) => report.language)),
      (lang) => LANG_LABEL[lang]
    ),
    timeline: buildTimeline(current, days),
    recent: current.slice(0, 8),
    rising,
    heating: deltaPct >= 15,
  };
}

function buildTimeline(reports: RadarReport[], days: number): Array<{ day: string; value: number }> {
  const buckets = new Map<string, number>();
  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(REFERENCE_DATE.getTime() - i * 86_400_000).toISOString().slice(0, 10);
    buckets.set(day, 0);
  }
  for (const report of reports) {
    const day = report.reportedAt.slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([day, value]) => ({ day, value }));
}

/** Every state, including those with no reports, so the heat map is complete. */
export function stateIntensity(byState: Bucket[]): Array<{ state: MyState; value: number }> {
  const lookup = new Map(byState.map((bucket) => [bucket.label, bucket.value]));
  return STATES.map((state) => ({ state, value: lookup.get(state) ?? 0 }));
}

export type { Trend };
