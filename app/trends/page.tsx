import type { Metadata } from "next";
import { PrototypeDataTag, Sticker } from "@/components/ui";
import { TrendCard } from "@/components/trends/trend-card";
import { Mascot } from "@/components/ui/mascot";
import { getTrends, trendReach } from "@/lib/repo";
import { NotConnected } from "@/components/not-connected";

export const metadata: Metadata = {
  title: "One Scam, Many Stories",
  description:
    "The same scam, retold by a Facebook uncle, a TikTok aunty, a Reddit poster and a WhatsApp group — in four languages. Kena Scam groups them into one trend.",
};

export default async function TrendsPage() {
  const trends = await getTrends();
  const enriched = await Promise.all(
    trends.map(async (trend) => ({ trend, reach: await trendReach(trend.id) }))
  );
  const [featured, ...rest] = enriched;
  if (!featured) return <NotConnected />;

  return (
    <>
      <section className="bg-hero-glow">
        <div className="shell py-10">
          <div className="flex flex-wrap items-center gap-3">
            <Sticker tone="hot">One scam</Sticker>
            <Sticker tone="lime" rotate="2deg">
              Many stories
            </Sticker>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            Your friend saw the Facebook uncle&apos;s story. Your sister saw the TikTok aunty&apos;s.
            <span className="text-purple-600"> Neither knew it was the same scam.</span>
          </h1>
          <div className="mt-3.5 flex items-end justify-between gap-6">
            <p className="max-w-2xl text-lede text-ink-muted">
              A trend is one scam pattern with every telling of it attached — across platforms,
              languages, generations and states. {trends.length} trends, drawn from the whole story
              set.
            </p>
            <Mascot
              pose="centralised-story-collector"
              size="md"
              alt="Kena Scam mascot gathering stories from several platforms into one place"
              className="hidden shrink-0 lg:block"
            />
          </div>
        </div>
      </section>

      <section className="shell pb-6">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
          <TrendCard
            featured
            trend={featured.trend}
            platforms={featured.reach.platforms}
            languages={featured.reach.languages}
            storyCount={featured.reach.stories.length}
            className="lg:col-span-2"
          />
          {rest.map(({ trend, reach }) => (
            <TrendCard
              key={trend.id}
              trend={trend}
              platforms={reach.platforms}
              languages={reach.languages}
              storyCount={reach.stories.length}
            />
          ))}
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-2 text-micro text-ink-muted">
          <PrototypeDataTag />
          Trends are clustered by hand across the collected story set — moderated community
          stories, creator-consented accounts and published advisories.
        </p>
      </section>
    </>
  );
}
