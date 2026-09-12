import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Flame, Languages, MapPin, Share2, ShieldCheck } from "lucide-react";
import { Card, DeltaBadge, EyebrowPill, PrototypeDataTag, Sticker, buttonClass, cn } from "@/components/ui";
import { LangChip, PlatformChip, TagChip } from "@/components/ui/chips";
import { TrendWeb } from "@/components/trends/trend-web";
import { StoryCard } from "@/components/story/story-card";
import { decorate, getTrend, getTrends, trendReach } from "@/lib/repo";
import { LANG_FULL } from "@/lib/data/types";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const trends = await getTrends();
  return trends.map((trend) => ({ slug: trend.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trend = await getTrend(slug);
  if (!trend) return { title: "Trend not found" };
  return { title: trend.title, description: trend.summary };
}

export default async function TrendPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trend = await getTrend(slug);
  if (!trend) notFound();

  const reach = await trendReach(trend.id);
  const { platforms, languages, states } = reach;
  const stories = await decorate(reach.stories);

  return (
    <>
      <section className="bg-hero-glow">
        <div className="shell py-10">
          <Link href="/trends" className="text-micro font-bold text-purple-600 hover:text-purple-700">
            ← All trends
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <EyebrowPill>One scam, many stories</EyebrowPill>
            {trend.momentum >= 30 ? (
              <Sticker tone="hot" rotate="-3deg">
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                  Heating up
                </span>
              </Sticker>
            ) : null}
          </div>

          <h1 className="mt-4 max-w-3xl font-display text-display">{trend.title}</h1>
          <p className="mt-3 max-w-2xl text-lede font-semibold text-ink">{trend.tagline}</p>
          <p className="mt-2.5 max-w-3xl text-lede text-ink-muted">{trend.summary}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatBlock label="Tellings collected" value={String(stories.length)} icon={Share2} />
            <StatBlock label="Platforms affected" value={String(platforms.length)} icon={Share2} />
            <StatBlock label="Languages represented" value={String(languages.length)} icon={Languages} />
            <StatBlock label="States mentioned" value={String(states.length)} icon={MapPin} />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- the connection */}
      <section className="shell pb-6">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
            <div className="min-w-0">
              <h2 className="text-h3">How the tellings connect</h2>
              <p className="mt-0.5 text-micro text-ink-muted">
                {stories.length} separate posts. One underlying scam.
              </p>
            </div>
            <DeltaBadge value={trend.momentum} />
          </div>
          <TrendWeb stories={stories} title={trend.title} />
        </Card>
      </section>

      {/* ------------------------------------------------ why / flags / action */}
      <section className="shell pb-6">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-3">
          <Card className="p-5">
            <h2 className="text-h3">Why it is spreading</h2>
            <p className="mt-2.5 text-body text-ink-muted">{trend.whySpreading}</p>
            <p className="mt-3.5 border-t border-line-soft pt-3 text-micro text-ink-muted">
              {trend.firstSeen
                ? `First seen in this demo set on ${formatDate(trend.firstSeen)}.`
                : "Part of the curated demo set."}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="flex items-center gap-2 text-h3">
              <AlertTriangle className="h-4 w-4 text-hot" strokeWidth={2.4} aria-hidden="true" />
              Common red flags
            </h2>
            <ul className="mt-2.5 grid gap-2">
              {trend.redFlags.map((flag) => (
                <li key={flag} className="flex items-start gap-2.5 text-body">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-hot" aria-hidden="true" />
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="overflow-hidden">
            <h2 className="flex items-center gap-2 px-5 pt-5 text-h3">
              <ShieldCheck className="h-4 w-4 text-safe" strokeWidth={2.4} aria-hidden="true" />
              Recommended safe action
            </h2>
            <p className="px-5 pb-5 pt-2.5 text-body text-ink-muted">{trend.safeAction}</p>
            <div className="border-t border-line-soft bg-safe-soft px-5 py-4">
              <p className="text-micro font-semibold text-safe-deep">
                Kena Scam explains patterns. It never tells you that a specific message, person,
                business or link is definitely a scam.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* --------------------------------------------------------- the reach */}
      <section className="shell pb-6">
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h2 className="text-eyebrow uppercase text-ink-muted">Platforms affected</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {platforms.map((platform) => (
                  <PlatformChip key={platform} platform={platform} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-eyebrow uppercase text-ink-muted">Languages represented</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {languages.map((lang) => (
                  <LangChip key={lang} lang={lang} />
                ))}
              </div>
              <p className="mt-2 text-micro text-ink-muted">
                {languages.map((lang) => LANG_FULL[lang]).join(", ")}
              </p>
            </div>
          </div>
          <div className="mt-4 border-t border-line-soft pt-4">
            <h2 className="text-eyebrow uppercase text-ink-muted">Tags</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {trend.tags.map((tag) => (
                <TagChip key={tag} id={tag} href={`/tea?tags=${encodeURIComponent(tag)}`} />
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* ------------------------------------------------------- the stories */}
      <section className="shell pb-14">
        <h2 className="font-display text-h2">All {stories.length} tellings</h2>
        <p className="mt-1.5 max-w-2xl text-body text-ink-muted">
          Each of these was posted separately, by different people, to different audiences. None of
          them knew about the others.
        </p>

        <div className="mt-4 grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>

        <div className="mt-8 rounded-panel bg-panel-tint px-6 py-8 sm:px-9">
          <h2 className="font-display text-h2">Seen this one yourself?</h2>
          <p className="mt-2 max-w-xl text-body text-ink-muted">
            Your telling might be the one that makes it click for someone else. Nothing is published
            until a moderator has redacted and reviewed it.
          </p>
          <Link href="/share" className={cn(buttonClass("dark", "md"), "mt-4")}>
            Spill scam tea ☕
          </Link>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-2 text-micro text-ink-muted">
          <PrototypeDataTag />
          Redacted before publication, and not collected from any platform.
        </p>
      </section>
    </>
  );
}

function StatBlock({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1.5 text-micro font-semibold text-ink-muted">
        <Icon className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-1.5 text-[30px] font-extrabold leading-none tracking-[-0.03em]">{value}</p>
    </Card>
  );
}
