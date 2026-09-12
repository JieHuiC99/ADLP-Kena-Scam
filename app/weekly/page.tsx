import type { Metadata } from "next";
import Link from "next/link";
import { AudioLines, Link2, Mail, MessageSquareHeart, Sparkles } from "lucide-react";
import { Card, Disclaimer, PrototypeDataTag, ScriptNote, Sticker, buttonClass, cn } from "@/components/ui";
import { StoryCard } from "@/components/story/story-card";
import { SubscribeMock } from "@/components/weekly/subscribe-mock";
import { Mascot } from "@/components/ui/mascot";
import { NotConnected } from "@/components/not-connected";
import { decorate, getDigest, getStories } from "@/lib/repo";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Kena Weekly",
  description:
    "Busy making money, no time to doomscroll? We did the doomscrolling for you. The week's scam patterns in one read.",
};

export default async function WeeklyPage() {
  const [digest, stories] = await Promise.all([getDigest(), getStories()]);
  if (!digest) return <NotConnected what="weekly digest" />;

  const top = await decorate(
    digest.topStoryIds
      .map((id) => stories.find((story) => story.id === id))
      .filter((story): story is NonNullable<typeof story> => Boolean(story))
  );

  const sections = [
    {
      icon: Sparkles,
      eyebrow: "New scam method to watch",
      body: digest.emergingMethod,
      tone: "bg-lime-soft",
    },
    {
      icon: Link2,
      eyebrow: "Most sus link behaviour",
      body: digest.susLinkBehaviour,
      tone: "bg-hot-soft",
    },
    {
      icon: AudioLines,
      eyebrow: "AI scam watch",
      body: digest.aiScamWatch,
      tone: "bg-purple-50",
    },
  ];

  return (
    <>
      {/* ----------------------------------------------------------- masthead */}
      <section className="shell py-10">
        <article className="overflow-hidden rounded-panel border-2 border-ink bg-cream shadow-stamp-lg">
          <header className="border-b-2 border-ink bg-ink px-6 py-7 text-white sm:px-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-eyebrow uppercase text-white/70">
                <Mail className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                Kena Weekly · week of {formatDate(digest.weekStart)}
              </p>
              <Sticker tone="lime" rotate="2deg" className="shadow-none">
                Free forever
              </Sticker>
            </div>
            <div className="mt-4 flex items-center justify-between gap-6">
              <div className="min-w-0">
                <h1 className="max-w-3xl font-display text-display text-white">
                  {digest.headline}
                </h1>
                <p className="mt-3 max-w-2xl text-lede text-white/80">
                  Seven minutes, four platforms, four languages. Everything that mattered this week,
                  with the safe action next to each one.
                </p>
              </div>
              <Mascot
                pose="weekly-report"
                size="md"
                alt="Kena Scam mascot reading the weekly summary"
                className="hidden shrink-0 lg:block"
              />
            </div>
          </header>

          {/* ------------------------------------------------- top stories */}
          <div className="border-b-2 border-ink px-6 py-7 sm:px-10">
            <h2 className="font-display text-h2">Top scam stories this week</h2>
            <p className="mt-1.5 max-w-2xl text-body text-ink-muted">
              The tellings that travelled furthest across platforms and languages.
            </p>
            {top.length ? (
              <div className="mt-4 grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
                {top.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : null}
          </div>

          {/* ---------------------------------------------------- sections */}
          <div className="grid gap-px bg-ink/10 sm:grid-cols-3">
            {sections.map((section) => (
              <section key={section.eyebrow} className={cn("px-6 py-7 sm:px-7", section.tone)}>
                <p className="flex items-center gap-2 text-eyebrow uppercase text-ink-muted">
                  <section.icon className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                  {section.eyebrow}
                </p>
                <p className="mt-3 text-body leading-relaxed text-ink">{section.body}</p>
              </section>
            ))}
          </div>

          {/* -------------------------------------------------- family chat */}
          <div className="border-t-2 border-ink bg-white px-6 py-7 sm:px-10">
            <p className="flex items-center gap-2 text-eyebrow uppercase text-ink-muted">
              <MessageSquareHeart className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
              One thing to tell the family group chat
            </p>
            <blockquote className="mt-3 border-l-4 border-hot pl-4 text-lede font-semibold text-ink">
              {digest.familyGroupTip}
            </blockquote>
            <ScriptNote className="mt-3">copy, paste, send. that is the whole job.</ScriptNote>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t-2 border-ink px-6 py-6 sm:px-10">
            <Link href="/tea" className={buttonClass("dark", "lg")}>
              Read full weekly tea
            </Link>
            <Link href="/trends" className={buttonClass("ghost", "lg")}>
              See every trend
            </Link>
          </div>
        </article>
      </section>

      {/* ---------------------------------------------------------- subscribe */}
      <section className="shell pb-14">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[1.15fr_1fr]">
          <SubscribeMock />

          <Card className="p-6">
            <h2 className="font-display text-h2">What goes into an edition</h2>
            <ul className="mt-3 grid gap-2.5 text-body text-ink-muted">
              <li>Only stories that have already passed moderation and been approved.</li>
              <li>Patterns and red flags — never an accusation about a person or business.</li>
              <li>One concrete safe action per section, written to be forwarded.</li>
              <li>The original language of every story, kept and linked.</li>
            </ul>
            <Disclaimer
              className="mt-4"
              text="Kena Weekly is generated server-side from approved story records only — never from anything unapproved, and never from platform data."
            />
            <p className="mt-3 flex flex-wrap items-center gap-2 text-micro text-ink-muted">
              <PrototypeDataTag />
              Built from approved stories only.
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
