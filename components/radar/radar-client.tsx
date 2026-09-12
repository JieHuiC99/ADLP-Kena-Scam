"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  CalendarRange,
  Flame,
  Languages,
  MapPin,
  Share2,
  Tag,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  DeltaBadge,
  EmptyState,
  PrototypeDataTag,
  RankedBarList,
  Sticker,
  buttonClass,
  cn,
  selectClass,
} from "@/components/ui";
import { CountUp } from "@/components/ui/count-up";
import { Mascot } from "@/components/ui/mascot";
import { PillTabs } from "@/components/ui/pill-tabs";
import { MalaysiaMap } from "./malaysia-map";
import { CategoryBars, PlatformDonut, TrendArea } from "./charts";
import { CATEGORIES, LANGS, LANG_FULL, LANG_LABEL, PLATFORMS, STATES } from "@/lib/data/types";
import type { Category, Lang, MyState, Platform, RadarReport } from "@/lib/data/types";
import { timeAgo } from "@/lib/format";

/**
 * Scam Radar.
 *
 * Filtering happens in the browser against the whole curated report set, which
 * keeps every control instant — including clicking a state on the map, which is
 * the interaction the page is really built around.
 *
 * A map of Malaysia with numbers on it reads as authoritative whether or not it
 * has earned that, so the page is explicit about what the numbers are: counts of
 * community reports, not official statistics.
 */

const RANGES = [
  { days: 7, label: "Last 7 days" },
  { days: 30, label: "Last 30 days" },
  { days: 90, label: "Last 90 days" },
];

const TABS = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "map", label: "By state", icon: MapPin },
  { id: "category", label: "By category", icon: Tag },
  { id: "timeline", label: "Timeline", icon: CalendarRange },
];

type Filters = {
  state: MyState | null;
  category: Category | null;
  platform: Platform | null;
  language: Lang | null;
  days: number;
};

export function RadarClient({
  reports,
  referenceTime,
}: {
  reports: RadarReport[];
  referenceTime: number;
}) {
  const [tab, setTab] = useState("overview");
  const [filters, setFilters] = useState<Filters>({
    state: null,
    category: null,
    platform: null,
    language: null,
    days: 7,
  });

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const view = useMemo(() => {
    const matches = (report: RadarReport) =>
      (!filters.state || report.state === filters.state) &&
      (!filters.category || report.category === filters.category) &&
      (!filters.platform || report.platform === filters.platform) &&
      (!filters.language || report.language === filters.language);

    const windowStart = referenceTime - filters.days * 86_400_000;
    const priorStart = windowStart - filters.days * 86_400_000;

    const current: RadarReport[] = [];
    const previous: RadarReport[] = [];
    for (const report of reports) {
      if (!matches(report)) continue;
      const time = Date.parse(report.reportedAt);
      if (time >= windowStart) current.push(report);
      else if (time >= priorStart) previous.push(report);
    }

    const count = <T extends string>(values: T[]) => {
      const map = new Map<T, number>();
      for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
      return map;
    };
    const buckets = <T extends string>(map: Map<T, number>, label: (key: T) => string) =>
      Array.from(map.entries())
        .map(([key, value]) => ({ label: label(key), value }))
        .sort((a, b) => b.value - a.value);

    const stateCounts = count(current.map((report) => report.state));
    const categoryCounts = count(current.map((report) => report.category));
    const priorCategories = count(previous.map((report) => report.category));

    const byState = buckets(stateCounts, (state) => state);
    const deltaPct =
      previous.length === 0
        ? current.length > 0
          ? 100
          : 0
        : Math.round((current.length / previous.length - 1) * 100);

    const timeline: Array<{ day: string; value: number }> = [];
    for (let i = filters.days - 1; i >= 0; i -= 1) {
      const day = new Date(referenceTime - i * 86_400_000).toISOString().slice(0, 10);
      timeline.push({ day, value: 0 });
    }
    const byDay = new Map(timeline.map((point, index) => [point.day, index]));
    for (const report of current) {
      const index = byDay.get(report.reportedAt.slice(0, 10));
      if (index !== undefined) timeline[index].value += 1;
    }

    return {
      current,
      total: current.length,
      previousTotal: previous.length,
      deltaPct,
      heating: deltaPct >= 15,
      byState,
      mapData: STATES.map((state) => ({ state, value: stateCounts.get(state) ?? 0 })),
      byCategory: buckets(categoryCounts, (category) => category),
      byPlatform: buckets(count(current.map((report) => report.platform)), (platform) => platform),
      byLanguage: buckets(count(current.map((report) => report.language)), (lang) => LANG_LABEL[lang]),
      timeline,
      rising: Array.from(categoryCounts.entries())
        .map(([category, recent]) => {
          const prior = priorCategories.get(category) ?? 0;
          return {
            label: category,
            value: recent,
            delta: prior === 0 ? (recent > 0 ? 100 : 0) : Math.round((recent / prior - 1) * 100),
          };
        })
        .sort((a, b) => b.delta - a.delta || b.value - a.value)
        .slice(0, 5),
      recent: current.slice(0, 8),
      hottest: byState[0] ?? null,
    };
  }, [reports, filters, referenceTime]);

  const activeFilters =
    (filters.state ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.platform ? 1 : 0) +
    (filters.language ? 1 : 0);

  const clearAll = () =>
    setFilters({ state: null, category: null, platform: null, language: null, days: filters.days });

  return (
    <>
      {/* ------------------------------------------------------------ header */}
      <section className="relative bg-hero-glow">
        <div className="shell-wide py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <Sticker tone="hot">Scam Radar</Sticker>
                {view.heating ? (
                  <Sticker tone="tangerine" rotate="2.5deg">
                    <span className="inline-flex items-center gap-1">
                      <Flame className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                      Radar is heating up
                    </span>
                  </Sticker>
                ) : null}
              </div>
              <h1 className="mt-4 font-display text-display">
                What&apos;s popping off{" "}
                <span className="text-purple-600">around Malaysia?</span>
              </h1>
              <p className="mt-3 max-w-xl text-lede text-ink-muted">
                Reports from the community mapped across every state, with the scam types and platforms
                moving fastest. Tap a state to drill in.
              </p>
            </div>

            <Mascot
              pose="live-data-analysis"
              size="md"
              alt="Kena Scam mascot studying a map of Malaysia"
              className="hidden shrink-0 xl:block"
            />

            <Card className="shrink-0 px-5 py-4">
              <p className="flex items-center gap-2 text-micro font-semibold text-ink-muted">
                Reports this period
                <TrendingUp className="h-3.5 w-3.5 text-hot" strokeWidth={2.4} aria-hidden="true" />
              </p>
              <p className="mt-1.5 flex items-baseline gap-2.5">
                <span className="text-[32px] font-extrabold leading-none tracking-[-0.035em]">
                  <CountUp value={view.total} />
                </span>
                <DeltaBadge value={view.deltaPct} />
              </p>
              <p className="mt-1 text-micro text-ink-muted">
                vs the previous {filters.days} days ({view.previousTotal})
              </p>
              <p className="mt-2 border-t border-line-soft pt-2">
                <PrototypeDataTag />
              </p>
            </Card>
          </div>

          {/* tabs + range */}
          <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <PillTabs tabs={TABS} active={tab} onChange={setTab} label="Radar views" />
            <div className="scroll-x shrink-0">
              <div className="flex gap-2 pb-1" role="group" aria-label="Timeframe">
                {RANGES.map((range) => (
                  <button
                    key={range.days}
                    type="button"
                    onClick={() => set("days", range.days)}
                    aria-pressed={filters.days === range.days}
                    className={cn(
                      "shrink-0 rounded-pill border px-3.5 py-2 text-micro font-bold transition",
                      filters.days === range.days
                        ? "border-ink bg-ink text-white"
                        : "border-line bg-white text-ink-muted hover:border-purple-300 hover:text-purple-700"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* filters */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              label="State"
              value={filters.state ?? ""}
              onChange={(value) => set("state", (value || null) as MyState | null)}
              options={STATES.map((state) => ({ value: state, label: state }))}
            />
            <Select
              label="Scam type"
              value={filters.category ?? ""}
              onChange={(value) => set("category", (value || null) as Category | null)}
              options={CATEGORIES.map((category) => ({ value: category, label: category }))}
            />
            <Select
              label="Platform"
              value={filters.platform ?? ""}
              onChange={(value) => set("platform", (value || null) as Platform | null)}
              options={PLATFORMS.map((platform) => ({ value: platform, label: platform }))}
            />
            <Select
              label="Language"
              value={filters.language ?? ""}
              onChange={(value) => set("language", (value || null) as Lang | null)}
              options={LANGS.map((lang) => ({ value: lang, label: LANG_FULL[lang] }))}
            />
          </div>

          {activeFilters ? (
            <p className="mt-3 flex flex-wrap items-center gap-3 text-micro text-ink-muted">
              <span>
                {activeFilters} filter{activeFilters === 1 ? "" : "s"} applied ·{" "}
                <span className="font-bold text-ink">{view.total}</span> matching reports
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="font-bold text-purple-600 hover:text-purple-700"
              >
                Clear all
              </button>
            </p>
          ) : null}
        </div>
      </section>

      {/* -------------------------------------------------------------- grid */}
      <section className="shell-wide pb-6">
        <div className="grid items-start gap-4 [&>*]:min-w-0 xl:grid-cols-[1.35fr_1fr]">
          {tab === "overview" || tab === "map" ? (
            <Card>
              <CardHeader icon={MapPin} tone="blush" title="Where it is happening" />
              <MalaysiaMap
                data={view.mapData}
                selected={filters.state}
                onSelect={(state) => set("state", state)}
              />
            </Card>
          ) : null}

          {tab === "overview" || tab === "map" ? (
            <div className="grid min-w-0 content-start gap-4">
              <Card className="bg-hot-tint p-5">
                <p className="text-eyebrow uppercase text-ink-muted">Most sus state right now</p>
                {view.hottest ? (
                  <>
                    <p className="mt-2 font-display text-h1">{view.hottest.label}</p>
                    <p className="mt-1.5 text-body text-ink-muted">
                      <span className="font-bold text-ink">{view.hottest.value}</span> of{" "}
                      {view.total} reports in the last {filters.days} days
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        set("state", filters.state ? null : (view.hottest!.label as MyState))
                      }
                      className={cn(buttonClass("dark", "sm"), "mt-3.5")}
                    >
                      {filters.state ? "Clear state filter" : `Drill into ${view.hottest.label}`}
                    </button>
                  </>
                ) : (
                  <p className="mt-2 text-body text-ink-muted">
                    No reports match the current filters.
                  </p>
                )}
              </Card>

              <Card>
                <CardHeader icon={Flame} tone="amber" title="Rising this period" />
                {view.rising.length ? (
                  <div className="pb-3">
                    <RankedBarList items={view.rising} tone="amber" />
                  </div>
                ) : (
                  <EmptyState
                    icon={Flame}
                    title="Nothing rising"
                    body="No category is climbing against the previous period."
                  />
                )}
              </Card>
            </div>
          ) : null}

          {tab === "category" ? (
            <>
              <Card>
                <CardHeader icon={Tag} tone="lavender" title="Top scam categories" />
                {view.byCategory.length ? (
                  <CategoryBars data={view.byCategory} suffix="reports" />
                ) : (
                  <EmptyState icon={Tag} title="No reports" body="Nothing matches these filters." />
                )}
              </Card>
              <Card>
                <CardHeader icon={Share2} tone="blue" title="Most-mentioned platforms" />
                {view.byPlatform.length ? (
                  <PlatformDonut data={view.byPlatform} total={view.total} totalLabel="reports" />
                ) : (
                  <EmptyState icon={Share2} title="No reports" body="Nothing matches these filters." />
                )}
              </Card>
            </>
          ) : null}

          {tab === "timeline" ? (
            <>
              <Card>
                <CardHeader icon={CalendarRange} tone="lavender" title="Reports over time" />
                <TrendArea data={view.timeline} />
              </Card>
              <Card>
                <CardHeader icon={Languages} tone="mint" title="Languages reported in" />
                {view.byLanguage.length ? (
                  <div className="pb-3">
                    <RankedBarList items={view.byLanguage} tone="mint" />
                  </div>
                ) : (
                  <EmptyState
                    icon={Languages}
                    title="No reports"
                    body="Nothing matches these filters."
                  />
                )}
              </Card>
            </>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------------ overview rest */}
      {tab === "overview" ? (
        <section className="shell-wide pb-6">
          <div className="grid items-start gap-4 [&>*]:min-w-0 xl:grid-cols-3">
            <Card>
              <CardHeader icon={Tag} tone="lavender" title="Top scam categories" />
              {view.byCategory.length ? (
                <CategoryBars data={view.byCategory.slice(0, 6)} suffix="reports" />
              ) : (
                <EmptyState icon={Tag} title="No reports" body="Nothing matches these filters." />
              )}
            </Card>

            <Card>
              <CardHeader icon={Share2} tone="blue" title="Most-mentioned platforms" />
              {view.byPlatform.length ? (
                <PlatformDonut data={view.byPlatform} total={view.total} totalLabel="reports" />
              ) : (
                <EmptyState icon={Share2} title="No reports" body="Nothing matches these filters." />
              )}
            </Card>

            <Card>
              <CardHeader icon={CalendarRange} tone="amber" title="Recent report timeline" />
              <ul className="row-list gap-1 px-3 pb-5">
                {view.recent.length ? (
                  view.recent.map((report) => (
                    <li
                      key={report.id}
                      className="flex items-start gap-2.5 rounded-chip px-2 py-2.5 hover:bg-paper-tint"
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2 w-2 shrink-0 rounded-pill",
                          report.severity === "high"
                            ? "bg-hot"
                            : report.severity === "medium"
                              ? "bg-tangerine"
                              : "bg-caution"
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body font-semibold">
                          {report.category} · {report.state}
                        </span>
                        <span className="mt-0.5 block text-micro text-ink-muted">
                          {report.platform} · {LANG_LABEL[report.language]} ·{" "}
                          {timeAgo(report.reportedAt)}
                        </span>
                      </span>
                    </li>
                  ))
                ) : (
                  <EmptyState
                    icon={CalendarRange}
                    title="No reports"
                    body="Nothing matches these filters."
                  />
                )}
              </ul>
            </Card>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------- transparency */}
      <section className="shell-wide pb-14">
        <Card className="bg-panel-tint p-6 sm:p-8">
          <h2 className="font-display text-h2">Where radar data comes from</h2>
          <p className="mt-2.5 max-w-3xl text-body text-ink-muted">
            Community stories people submitted, creator-consented accounts, and published advisories
            — never scraped from a platform, and never at a finer granularity than state level. No
            precise address or personal location is ever shown, and these are counts of what people
            reported to us rather than official incident statistics.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <Link href="/tea" className={buttonClass("dark", "md")}>
              Read the stories behind it
            </Link>
            <Link href="/share" className={buttonClass("ghost", "md")}>
              Add your own report
            </Link>
          </div>
        </Card>
      </section>
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = `radar-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="grid min-w-0 gap-1.5">
      <label htmlFor={id} className="text-micro font-bold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClass}
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
