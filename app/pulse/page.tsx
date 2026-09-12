import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines, Flame, Languages, MapPin, Share2, Tag, Wallet } from "lucide-react";
import {
  Card,
  CardHeader,
  DeltaBadge,
  EmptyState,
  PrototypeDataTag,
  RankedBarList,
  ScriptNote,
  Sticker,
  buttonClass,
  cn,
} from "@/components/ui";
import { CountUp } from "@/components/ui/count-up";
import { Mascot } from "@/components/ui/mascot";
import { CategoryBars, PlatformDonut } from "@/components/radar/charts";
import { NotConnected } from "@/components/not-connected";
import { getPulse } from "@/lib/pulse";

export const metadata: Metadata = {
  title: "Malaysia Scam Pulse",
  description:
    "Which platforms, scam types, states and languages the Kena Scam story set covers, computed from the same records that power the feed.",
};

export default async function PulsePage() {
  const pulse = await getPulse();
  if (!pulse.connected) return <NotConnected what="insights" />;

  const headline = [
    { value: pulse.totalStories, label: "Stories collected", sub: "Across six platforms" },
    { value: pulse.totalTrends, label: "Scam trends clustered", sub: "One scam, many stories" },
    {
      value: pulse.topPlatform.value,
      label: `Most mentioned: ${pulse.topPlatform.label}`,
      sub: `${pulse.topPlatform.share}% of all stories`,
    },
    {
      value: pulse.topCategory.value,
      label: `Top category: ${pulse.topCategory.label}`,
      sub: `${pulse.topCategory.share}% of all stories`,
    },
  ];

  return (
    <>
      {/* ------------------------------------------------------------ header */}
      <section className="relative bg-hero-glow">
        <div className="shell-wide py-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sticker tone="lime">Malaysia Scam Pulse</Sticker>
            <Sticker tone="white" rotate="1.5deg">
              Community insights
            </Sticker>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            The numbers behind <span className="text-purple-600">the tea.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lede text-ink-muted">
            Every chart on this page is computed from the same records that power the feed, so the
            figures and the stories can never drift apart. Click anything to go read the stories it
            came from.
          </p>
          <ScriptNote className="mt-4">
            numbers are only useful if you can go and read what they are made of
          </ScriptNote>
          <Mascot
            pose="data-review"
            size="md"
            alt="Kena Scam mascot holding up two charts"
            className="pointer-events-none absolute right-6 top-8 hidden xl:block"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------ counts */}
      <section className="shell-wide pb-6">
        <Card className="grid grid-cols-2 gap-5 p-5 sm:p-7 lg:grid-cols-4">
          {headline.map((stat) => (
            <div key={stat.label} className="min-w-0">
              <p className="font-display text-[32px] font-extrabold leading-none tracking-[-0.03em] sm:text-[40px]">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-1.5 text-body font-semibold text-ink">{stat.label}</p>
              <p className="mt-0.5 text-micro text-ink-muted">{stat.sub}</p>
            </div>
          ))}
        </Card>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-micro text-ink-muted">
          <PrototypeDataTag />
          Aggregated from the stories in the feed.
        </p>
      </section>

      {/* ------------------------------------------------------------ charts */}
      <section className="shell-wide pb-6">
        <div className="grid items-start gap-4 [&>*]:min-w-0 xl:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader
              icon={Tag}
              tone="hot"
              title="Scam categories"
              action={{ label: "Browse the feed", href: "/tea" }}
            />
            <CategoryBars data={pulse.byCategory} />
          </Card>

          <Card>
            <CardHeader icon={Share2} tone="lavender" title="Platform distribution" />
            <PlatformDonut data={pulse.byPlatform} total={pulse.totalStories} />
          </Card>
        </div>
      </section>

      <section className="shell-wide pb-6">
        <div className="grid items-start gap-4 [&>*]:min-w-0 xl:grid-cols-3">
          <Card>
            <CardHeader icon={MapPin} tone="lime" title="Stories by state" />
            {pulse.byState.length ? (
              <div className="pb-3">
                <RankedBarList
                  tone="lime"
                  items={pulse.byState.map((bucket) => ({
                    label: bucket.label,
                    value: bucket.value,
                    href: `/tea?state=${encodeURIComponent(bucket.label)}`,
                  }))}
                />
              </div>
            ) : (
              <EmptyState icon={MapPin} title="No stories" body="Nothing to aggregate yet." />
            )}
          </Card>

          <Card>
            <CardHeader icon={Wallet} tone="amber" title="Approximate loss ranges" />
            <CategoryBars data={pulse.byLoss} />
            <p className="px-5 pb-5 text-micro text-ink-muted">
              Buckets, never exact figures, and redacted before publication.
            </p>
          </Card>

          <Card>
            <CardHeader icon={Languages} tone="mint" title="Original languages" />
            <div className="pb-3">
              <RankedBarList
                tone="mint"
                items={pulse.byLanguage.map((bucket) => ({
                  label: bucket.label,
                  value: bucket.value,
                }))}
              />
            </div>
            <p className="px-5 pb-5 text-micro text-ink-muted">
              {pulse.languagesCovered} languages across {pulse.statesCovered} states. Every story is
              readable in all four.
            </p>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------- rising + AI watch */}
      <section className="shell-wide pb-14">
        <div className="grid items-start gap-4 [&>*]:min-w-0 lg:grid-cols-[1.25fr_1fr]">
          <Card>
            <CardHeader icon={Flame} tone="amber" title="Rising this week" />
            <div className="grid gap-2 px-5 pb-5">
              {pulse.rising.map((trend, index) => (
                <Link
                  key={trend.slug}
                  href={`/trends/${trend.slug}`}
                  className={cn(
                    "block rounded-card p-4 transition hover:brightness-[0.98]",
                    index === 0 ? "bg-hot-tint" : "hover:bg-paper-tint"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-h3">{trend.title}</h3>
                    <DeltaBadge value={trend.momentum} />
                  </div>
                  <p className="mt-1.5 text-micro text-ink-muted">
                    {trend.stories} {trend.stories === 1 ? "telling" : "tellings"} collected across
                    platforms and languages
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden border-2 border-ink shadow-stamp">
            <div className="bg-ink px-5 py-4 text-white">
              <p className="flex items-center gap-2 text-eyebrow uppercase text-white/70">
                <AudioLines className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                AI scam watch
              </p>
              <h2 className="mt-2 font-display text-h2 text-white">
                The voice that sounds like home
              </h2>
            </div>
            <div className="p-5">
              <p className="text-body text-ink-muted">
                AI voice impersonation accounts for{" "}
                <span className="font-bold text-ink">{pulse.aiWatch.share}%</span> of the curated
                story set — {pulse.aiWatch.stories} tellings — and is the fastest-moving trend in the
                demo data at{" "}
                <span className="font-bold text-ink">+{pulse.aiWatch.momentum}%</span>.
              </p>
              <p className="mt-3 text-body text-ink-muted">
                A familiar voice is no longer proof of identity. The only reliable check is calling
                back on a number you already had saved.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {pulse.aiWatch.trendSlug ? (
                  <Link
                    href={`/trends/${pulse.aiWatch.trendSlug}`}
                    className={buttonClass("dark", "sm")}
                  >
                    See the trend
                  </Link>
                ) : null}
                <Link href="/game" className={buttonClass("hot", "sm")}>
                  Try the AI voice final boss
                </Link>
              </div>
            </div>
          </Card>
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-2 text-micro text-ink-muted">
          <PrototypeDataTag />
          Aggregated from community stories. Not a verified count of real incidents, and not
          collected from any social platform.
        </p>
      </section>
    </>
  );
}
