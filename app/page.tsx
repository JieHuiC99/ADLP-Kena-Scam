import Link from "next/link";
import {
  ArrowRight,
  Coffee,
  Eye,
  Gamepad2,
  Languages,
  LifeBuoy,
  Mail,
  Radar,
  Sparkles,
} from "lucide-react";
import {
  Card,
  EyebrowPill,
  PrototypeDataTag,
  ScriptNote,
  Sticker,
  buttonClass,
  cn,
} from "@/components/ui";
import { CountUp } from "@/components/ui/count-up";
import { Mascot } from "@/components/ui/mascot";
import type { MascotPose } from "@/components/ui/mascot";
import { WhichOneModal } from "@/components/home/which-one-modal";
import { ConnectVisual } from "@/components/home/connect-visual";
import { StoryCard } from "@/components/story/story-card";
import { TrendCard } from "@/components/trends/trend-card";
import { decorate, getDigest, getStoryViews, getTrends, sortStories, trendReach } from "@/lib/repo";
import { getPulse } from "@/lib/pulse";

export default async function HomePage() {
  const [trends, pulse, digest, stories] = await Promise.all([
    getTrends(),
    getPulse(),
    getDigest(),
    getStoryViews(),
  ]);
  const featured = trends[0];
  const featuredReach = featured ? await trendReach(featured.id) : null;
  const latest = sortStories(stories, "trending").slice(0, 3);

  return (
    <>
      <WhichOneModal />

      {/* ------------------------------------------------------------- hero */}
      <section className="bg-hero-glow">
        <div className="shell grid gap-10 py-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:py-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <Mascot
                pose="friendly-intro"
                size="sm"
                animate="float"
                className="hidden sm:block"
              />
              <Sticker tone="lime">Malaysia</Sticker>
              <Sticker tone="hot" rotate="2deg">
                4 languages
              </Sticker>
              <Sticker tone="white" rotate="-1deg">
                6 platforms
              </Sticker>
            </div>

            <h1 className="mt-5 font-display text-mega">
              Scam stories are everywhere.
              <span className="block text-purple-600">So why are they so hard to find?</span>
            </h1>

            <p className="mt-5 max-w-xl text-lede text-ink-muted">
              Your friend saw the Facebook uncle&apos;s story. Your sister saw the TikTok
              aunty&apos;s story. Neither knew it was the same scam.
            </p>
            <p className="mt-2.5 max-w-xl text-lede font-semibold text-ink">
              Kena Scam brings the tea together.
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href="/tea" className={buttonClass("dark", "lg")}>
                <Eye className="h-4 w-4" strokeWidth={2.4} />
                Something feels sus 👀
              </Link>
              <Link href="/share" className={buttonClass("hot", "lg")}>
                <Coffee className="h-4 w-4" strokeWidth={2.4} />
                Spill scam tea ☕
              </Link>
              <Link
                href="/kena"
                className={cn(buttonClass("ghost", "lg"), "border-purple-300 text-purple-700")}
              >
                <LifeBuoy className="h-4 w-4" strokeWidth={2.4} />
                I kena already
              </Link>
            </div>

            <p className="mt-6 max-w-xl text-body font-semibold text-ink">
              &ldquo;Scams do not stay inside one platform, language, or generation. Neither should
              scam awareness.&rdquo;
            </p>
          </div>

          <div className="min-w-0">
            <ConnectVisual />
            <ScriptNote className="mt-3 text-center">
              same scam, four retellings, zero connections made
            </ScriptNote>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ counts */}
      <section className="shell pb-8">
        <Card className="grid grid-cols-2 gap-5 p-5 sm:p-7 lg:grid-cols-4">
          {[
            { value: pulse.totalStories, label: "Curated demo stories" },
            { value: pulse.totalTrends, label: "Scam trends clustered" },
            { value: pulse.languagesCovered, label: "Languages represented" },
            { value: pulse.statesCovered, label: "Malaysian states" },
          ].map((stat) => (
            <div key={stat.label} className="min-w-0">
              <p className="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] sm:text-[42px]">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-1.5 text-body font-semibold text-ink-muted">{stat.label}</p>
            </div>
          ))}
        </Card>
        <p className="mt-3 flex flex-wrap items-center gap-2 text-micro text-ink-muted">
          <PrototypeDataTag />
          Counted from the stories in the feed. Nothing here is collected from a social platform.
        </p>
      </section>

      {/* ---------------------------------------------- one scam many stories */}
      <section className="shell pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <EyebrowPill>The whole point</EyebrowPill>
            <h2 className="mt-3 font-display text-h1">One scam, many stories</h2>
            <p className="mt-2 max-w-2xl text-lede text-ink-muted">
              We group every telling of the same scam into one trend, so you can see it jump between
              platforms, languages and generations.
            </p>
          </div>
          <Link href="/trends" className={cn(buttonClass("ghost", "md"), "shrink-0")}>
            All {trends.length} trends
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>

        {featured && featuredReach ? (
          <div className="mt-5">
            <TrendCard
              featured
              trend={featured}
              platforms={featuredReach.platforms}
              languages={featuredReach.languages}
              storyCount={featuredReach.stories.length}
            />
          </div>
        ) : null}
      </section>

      {/* ------------------------------------------------------ latest stories */}
      <section className="shell pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-h1">Fresh tea ☕</h2>
            <p className="mt-2 max-w-2xl text-body text-ink-muted">
              What is moving right now across the curated demo set.
            </p>
          </div>
          <Link href="/tea" className={cn(buttonClass("ghost", "md"), "shrink-0")}>
            Open the feed
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
          {latest.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* --------------------------------------------------------- feature grid */}
      <section className="shell pb-10">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-3">
          <FeatureCard
            href="/radar"
            icon={Radar}
            mascot="live-data-analysis"
            eyebrow="Scam Radar"
            title="What's popping off around Malaysia?"
            body="A state-by-state view of the curated demo reports, with the categories and platforms that are heating up."
            tone="bg-hot-tint"
          />
          <FeatureCard
            href="/pulse"
            icon={Sparkles}
            mascot="data-review"
            eyebrow="Malaysia Scam Pulse"
            title="The numbers behind the stories"
            body="Every chart is computed from the same records that power the feed, so the figures and the stories can never drift apart."
            tone="bg-panel-tint"
          />
          <FeatureCard
            href="/game"
            icon={Gamepad2}
            mascot="interactive-scam-simulation"
            eyebrow="Kena or Not?"
            title="Think you're too smart to kena? Bet."
            body="A safe awareness simulation, ending with an AI voice-note final boss. No real scam, no real loss."
            tone="bg-lime-soft"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- weekly */}
      <section className="shell pb-10">
        <Card className="overflow-hidden">
          <div className="grid gap-6 p-6 sm:p-9 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-center">
            <div className="min-w-0">
              <EyebrowPill tone="hot">
                <Mail className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
                Kena Weekly · edition {digest ? digest.weekStart : "—"}
              </EyebrowPill>
              <h2 className="mt-3.5 font-display text-h1">{digest?.headline}</h2>
              <p className="mt-3 max-w-xl text-body text-ink-muted">{digest?.emergingMethod}</p>
              <Link href="/weekly" className={cn(buttonClass("dark", "lg"), "mt-5")}>
                Read full weekly tea
                <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
              </Link>
            </div>

            <div className="min-w-0 rounded-card border-2 border-ink bg-cream-deep p-5 shadow-stamp">
              <p className="text-eyebrow uppercase text-ink-muted">This edition</p>
              <ul className="mt-2.5 grid gap-2.5 text-body">
                <li className="font-semibold">New scam method to watch</li>
                <li className="font-semibold">Most sus link behaviour</li>
                <li className="font-semibold">AI scam watch</li>
              </ul>
              <p className="mt-3.5 border-t border-ink/15 pt-3 text-micro text-ink-muted">
                One thing to tell the family group chat, every week.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* --------------------------------------------------------- join the gang */}
      <section className="shell pb-14">
        <div className="rounded-panel border-2 border-ink bg-hot px-6 py-9 text-white shadow-stamp-lg sm:px-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="text-eyebrow uppercase text-white/80">Join the gang</p>
              <h2 className="mt-3 font-display text-h1 text-white">
                Kena scammed before? Join the gang.
              </h2>
              <p className="mt-3 max-w-2xl text-lede text-white/90">
                Share your story. Someone else might recognise the pattern before it&apos;s too late.
                Your tea could save someone from kena.
              </p>
              <p className="mt-3 max-w-2xl text-micro text-white/80">
                Anonymous by default. Nothing is auto-published — personal details, phone numbers,
                account numbers and accusations are redacted before anything becomes public.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-4">
              <Mascot pose="save-a-life" size="md" className="hidden lg:block" />
              <div className="flex flex-wrap gap-2.5">
              <Link
                href="/share"
                className={cn(buttonClass("lime", "lg"), "border-2 border-ink shadow-stamp")}
              >
                <Coffee className="h-4 w-4" strokeWidth={2.4} />
                Share your story
              </Link>
              <Link
                href="/tea"
                className="inline-flex items-center gap-2 rounded-pill border-2 border-white px-6 py-3.5 text-[15px] font-bold text-white transition hover:bg-white/10"
              >
                <Languages className="h-4 w-4" strokeWidth={2.4} />
                Read others first
              </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  body,
  tone,
  mascot,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  body: string;
  tone: string;
  mascot: MascotPose;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 flex-col rounded-card border border-line p-5 shadow-card transition duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lift",
        tone
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-ink bg-white shadow-stamp">
          <Icon className="h-5 w-5 text-ink" strokeWidth={2.3} />
        </span>
        <Mascot pose={mascot} size="sm" className="shrink-0 transition group-hover:-translate-y-1" />
      </span>
      <span className="mt-4 text-eyebrow uppercase text-ink-muted">{eyebrow}</span>
      <span className="mt-1.5 font-display text-h2">{title}</span>
      <span className="mt-2 text-body text-ink-muted">{body}</span>
      <span className="mt-4 inline-flex items-center gap-1.5 text-micro font-bold text-purple-700">
        Have a look
        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.6} />
      </span>
    </Link>
  );
}
