"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Layers, Loader2, Search, Sparkles, X } from "lucide-react";
import {
  Card,
  EmptyState,
  PrototypeDataTag,
  Sticker,
  buttonClass,
  cn,
  selectClass,
} from "@/components/ui";
import { PillTabs } from "@/components/ui/pill-tabs";
import { TagChip } from "@/components/ui/chips";
import { Mascot } from "@/components/ui/mascot";
import { StoryCard } from "@/components/story/story-card";
import { parseQuery, tagsToFilters } from "@/lib/search/query";
import { sanitiseTags, tagLabel, tagsByFacet } from "@/lib/data/taxonomy";
import { CATEGORIES, LANGS, LANG_FULL, PLATFORMS, STATES } from "@/lib/data/types";
import type { Category, Lang, MyState, Platform, Trend } from "@/lib/data/types";
import type { StoryView } from "@/lib/provenance";

/**
 * The Scam Tea feed.
 *
 * Filtering is client-side against the seeded set, and every choice is mirrored
 * into the URL — so a filtered view is shareable, the browser Back button
 * undoes one filter at a time, and a tag chip clicked on a story card lands
 * here already narrowed.
 *
 * Search resolves natural phrasing onto controlled tags. "fake job in Johor"
 * becomes #FakeJob + #Johor rather than a string match, which is what lets the
 * result set stay honest across four languages: the Chinese and Tamil tellings
 * of the same scam carry the same tags as the English one.
 */

type SortKey = "trending" | "newest" | "shared";

const SORTS = [
  { id: "trending", label: "Trending now" },
  { id: "newest", label: "Newest tea" },
  { id: "shared", label: "Most shared" },
];

const TACTIC_TAGS = tagsByFacet("tactic");

export function TeaClient({
  stories,
  trends,
  referenceTime,
}: {
  stories: StoryView[];
  trends: Trend[];
  referenceTime: number;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [resolving, setResolving] = useState(false);
  const [aiResolved, setAiResolved] = useState<string[] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const requestId = useRef(0);

  const tags = useMemo(() => sanitiseTags((params.get("tags") ?? "").split(",")), [params]);
  const platform = (params.get("platform") as Platform | null) || null;
  const language = (params.get("lang") as Lang | null) || null;
  const category = (params.get("category") as Category | null) || null;
  const state = (params.get("state") as MyState | null) || null;
  const sort = (params.get("sort") as SortKey | null) ?? "trending";
  const activeQuery = params.get("q") ?? "";

  // Keep the input in step when the URL changes underneath it (Back button, or
  // a tag chip clicked elsewhere on the site).
  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      const qs = next.toString();
      router.replace(qs ? `/tea?${qs}` : "/tea", { scroll: false });
    },
    [params, router]
  );

  const toggleTag = (id: string) => {
    const next = tags.includes(id) ? tags.filter((tag) => tag !== id) : [...tags, id];
    update({ tags: next.join(",") });
  };

  /**
   * Submitting the search resolves the phrase into structured filters. The
   * server route upgrades this with a model when a key is configured; it is
   * held to the same contract either way, and the local mapper below is what
   * runs if anything goes wrong, so the box never simply fails.
   */
  const runSearch = async (raw: string) => {
    const text = raw.trim();
    if (!text) {
      update({ q: null, tags: null, platform: null, lang: null, category: null, state: null });
      setAiResolved(null);
      return;
    }

    const local = tagsToFilters(parseQuery(text).tags);
    applyResolved(text, local.tags, local.platform, local.state, local.language, local.category);

    const id = ++requestId.current;
    setResolving(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as { tags?: string[]; engine?: string };
      if (id !== requestId.current) return;
      const resolved = sanitiseTags(data.tags ?? []);
      if (!resolved.length) return;
      const mapped = tagsToFilters(resolved);
      applyResolved(text, mapped.tags, mapped.platform, mapped.state, mapped.language, mapped.category);
      setAiResolved(data.engine === "openai" ? resolved : null);
    } catch {
      // Local resolution already applied; nothing further to do.
    } finally {
      if (id === requestId.current) setResolving(false);
    }
  };

  const applyResolved = (
    text: string,
    chipTags: string[],
    nextPlatform: Platform | null,
    nextState: MyState | null,
    nextLanguage: Lang | null,
    nextCategory: Category | null
  ) => {
    update({
      q: text,
      tags: chipTags.join(","),
      platform: nextPlatform,
      state: nextState,
      lang: nextLanguage,
      category: nextCategory,
    });
  };

  const clearAll = () => {
    setQuery("");
    setAiResolved(null);
    router.replace("/tea", { scroll: false });
  };

  /* ------------------------------------------------------------- filtering */

  const results = useMemo(() => {
    const q = activeQuery.trim().toLowerCase();
    // Words the query mapper already turned into tags should not also have to
    // appear literally, or "fake job in Johor" would match nothing once it is
    // correctly tagged.
    const residual = q ? parseQuery(activeQuery).rest : "";

    const matched = stories.filter((story) => {
      if (platform && story.platform !== platform) return false;
      if (language && story.originalLanguage !== language) return false;
      if (category && story.category !== category) return false;
      if (state && story.state !== state) return false;
      if (tags.length && !tags.every((tag) => story.tags.includes(tag))) return false;
      if (residual) {
        const haystack = [
          story.title,
          story.summary,
          ...Object.values(story.titleTranslations),
          ...Object.values(story.translations),
        ]
          .join(" ")
          .toLowerCase();
        if (!residual.split(" ").every((word) => haystack.includes(word))) return false;
      }
      return true;
    });

    const sorted = [...matched];
    if (sort === "newest") sorted.sort((a, b) => b.date.localeCompare(a.date));
    else if (sort === "shared") sorted.sort((a, b) => b.shares - a.shares);
    else
      sorted.sort((a, b) => {
        const score = (story: StoryView) => {
          const ageDays = Math.max(1, (referenceTime - Date.parse(story.date)) / 86_400_000);
          return (story.reactions + story.shares * 2 + story.saves) / Math.pow(ageDays, 0.85);
        };
        return score(b) - score(a);
      });
    return sorted;
  }, [stories, activeQuery, tags, platform, language, category, state, sort, referenceTime]);

  /** Trend clusters the current results belong to — the "many stories" link. */
  const relatedTrends = useMemo(() => {
    const ids = new Set(results.map((story) => story.trendId).filter(Boolean));
    return trends.filter((trend) => ids.has(trend.id)).slice(0, 4);
  }, [results, trends]);

  const filterCount =
    tags.length +
    (platform ? 1 : 0) +
    (language ? 1 : 0) +
    (category ? 1 : 0) +
    (state ? 1 : 0) +
    (activeQuery ? 1 : 0);

  return (
    <>
      {/* ------------------------------------------------------------ header */}
      <section className="bg-hero-glow">
        <div className="shell py-9">
          <div className="flex flex-wrap items-center gap-3">
            <Sticker tone="lime">Scam Tea</Sticker>
            <Sticker tone="white" rotate="1.5deg">
              {stories.length} stories collected
            </Sticker>
          </div>
          <div className="mt-4 flex items-start justify-between gap-6">
            <div className="min-w-0">
              <h1 className="font-display text-h1">
                Know what scam you&apos;re looking for?{" "}
                <span className="text-purple-600">Search it lah.</span>
              </h1>
              <p className="mt-2.5 max-w-2xl text-lede text-ink-muted">
                One feed for the Facebook uncle, the TikTok aunty, the Reddit thread and the
                WhatsApp forward. Same scams, four languages, all in one place.
              </p>
            </div>
            <Mascot
              pose="advanced-scam-search"
              size="md"
              alt="Kena Scam mascot searching a scam database"
              className="hidden shrink-0 lg:block"
            />
          </div>

          {/* ------------------------------------------------------- search */}
          <form
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              void runSearch(query);
            }}
            className="mt-6 flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-muted"
                strokeWidth={2.3}
                aria-hidden="true"
              />
              <label htmlFor="tea-search" className="sr-only">
                Search scam tea
              </label>
              <input
                id="tea-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search scam tea… e.g. fake job in Johor"
                className="w-full rounded-pill border-2 border-ink bg-white py-3.5 pl-11 pr-4 text-body font-semibold text-ink shadow-stamp placeholder:font-normal placeholder:text-ink-muted/70 focus:outline-none focus:ring-4 focus:ring-purple-600/20"
              />
              {resolving ? (
                <Loader2
                  className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-purple-600"
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <button type="submit" className={cn(buttonClass("dark", "lg"), "shrink-0")}>
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              aria-expanded={showFilters}
              className={cn(buttonClass("ghost", "lg"), "shrink-0 lg:hidden")}
            >
              <Filter className="h-4 w-4" strokeWidth={2.4} />
              Filters
              {filterCount ? (
                <span className="rounded-pill bg-ink px-1.5 text-[10px] font-extrabold text-white">
                  {filterCount}
                </span>
              ) : null}
            </button>
          </form>

          {/* Resolved chips: what the search actually did. */}
          {tags.length || platform || language || category || state ? (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
              <span className="text-micro font-bold text-ink-muted">Filtering by</span>
              {tags.map((tag) => (
                <TagChip
                  key={tag}
                  id={tag}
                  active
                  onClick={() => toggleTag(tag)}
                  suffix={<X className="ml-0.5 h-3 w-3" strokeWidth={3} />}
                />
              ))}
              {platform ? (
                <ActivePill label={platform} onClear={() => update({ platform: null })} />
              ) : null}
              {state ? <ActivePill label={state} onClear={() => update({ state: null })} /> : null}
              {language ? (
                <ActivePill label={LANG_FULL[language]} onClear={() => update({ lang: null })} />
              ) : null}
              {category ? (
                <ActivePill label={category} onClear={() => update({ category: null })} />
              ) : null}
              {aiResolved?.length ? (
                <span className="inline-flex items-center gap-1 text-micro text-ink-muted">
                  <Sparkles className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
                  AI-assisted match
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Quick tactic chips — the filters with no dropdown of their own. */}
          <div className="scroll-x mt-4">
            <div className="flex gap-1.5 pb-1">
              <span className="shrink-0 self-center pr-1 text-micro font-bold text-ink-muted">
                Tactics:
              </span>
              {TACTIC_TAGS.map((tag) => (
                <TagChip
                  key={tag.id}
                  id={tag.id}
                  active={tags.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                  className="shrink-0"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- body */}
      <section className="shell grid gap-6 pb-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* ------------------------------------------------------- filters */}
        <aside
          className={cn("min-w-0 lg:block", showFilters ? "block" : "hidden")}
          aria-label="Filters"
        >
          <Card className="p-5 lg:sticky lg:top-[84px]">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-h3">Filters</h2>
              {filterCount ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-micro font-bold text-purple-600 hover:text-purple-700"
                >
                  Clear all
                </button>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3.5">
              <SelectFilter
                label="Platform"
                value={platform ?? ""}
                onChange={(value) => update({ platform: value || null })}
                options={PLATFORMS.map((item) => ({ value: item, label: item }))}
              />
              <SelectFilter
                label="Original language"
                value={language ?? ""}
                onChange={(value) => update({ lang: value || null })}
                options={LANGS.map((item) => ({ value: item, label: LANG_FULL[item] }))}
              />
              <SelectFilter
                label="Scam category"
                value={category ?? ""}
                onChange={(value) => update({ category: value || null })}
                options={CATEGORIES.map((item) => ({ value: item, label: item }))}
              />
              <SelectFilter
                label="State"
                value={state ?? ""}
                onChange={(value) => update({ state: value || null })}
                options={STATES.map((item) => ({ value: item, label: item }))}
              />
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-4 text-micro text-ink-muted">
              <PrototypeDataTag />
              Redacted before publication.
            </p>
          </Card>
        </aside>

        {/* --------------------------------------------------------- results */}
        <div className="min-w-0">
          <div className="flex flex-col gap-3 pb-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-body font-semibold text-ink-muted" aria-live="polite">
              <span className="text-ink">{results.length}</span>{" "}
              {results.length === 1 ? "story" : "stories"}
              {filterCount ? " matching" : " in the feed"}
            </p>
            <PillTabs
              tabs={SORTS}
              active={sort}
              onChange={(id) => update({ sort: id === "trending" ? null : id })}
              size="sm"
              label="Sort the feed"
            />
          </div>

          {relatedTrends.length && filterCount ? (
            <Card className="mb-4 bg-panel-tint p-4">
              <p className="flex items-center gap-2 text-micro font-bold text-purple-900">
                <Layers className="h-4 w-4" strokeWidth={2.4} aria-hidden="true" />
                These stories belong to {relatedTrends.length}{" "}
                {relatedTrends.length === 1 ? "trend" : "trends"}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {relatedTrends.map((trend) => (
                  <Link
                    key={trend.id}
                    href={`/trends/${trend.slug}`}
                    className="rounded-pill border border-purple-300 bg-white px-3 py-1.5 text-micro font-bold text-purple-700 transition hover:bg-purple-50"
                  >
                    {trend.title} →
                  </Link>
                ))}
              </div>
            </Card>
          ) : null}

          {results.length ? (
            <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={Search}
                title="No tea matches that yet"
                body={
                  tags.length > 1
                    ? "Multi-tag filtering is strict — every tag has to be on the story. Try removing one."
                    : "Try a broader search, or clear the filters and browse everything."
                }
                action={
                  <button type="button" onClick={clearAll} className={buttonClass("dark", "md")}>
                    Clear all filters
                  </button>
                }
              />
            </Card>
          )}
        </div>
      </section>
    </>
  );
}

function ActivePill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className="inline-flex items-center gap-1 rounded-pill bg-ink px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-ink-soft"
    >
      {label}
      <X className="h-3 w-3" strokeWidth={3} />
      <span className="sr-only">Remove filter {label}</span>
    </button>
  );
}

function SelectFilter({
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
  const id = `filter-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="grid gap-1.5">
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

export { tagLabel };
