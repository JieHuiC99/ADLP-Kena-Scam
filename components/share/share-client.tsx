"use client";

import { useState } from "react";
import { Coffee, ShieldCheck, Users } from "lucide-react";
import { Card, PrototypeDataTag, ScriptNote, Sticker, cn } from "@/components/ui";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ReportForm } from "./report-form";
import { Mascot } from "@/components/ui/mascot";
import { StoryCard } from "@/components/story/story-card";
import type { StoryView } from "@/lib/provenance";
import type { CommunityPost, PostComment } from "@/lib/community";
import { CommunityPostCard } from "./community-post-card";

/**
 * "Kena scammed before? Join the gang."
 *
 * Two tabs: the form, and the feed a posted story lands in immediately.
 *
 * Community posts and curated demo stories are shown in the same tab but as
 * visibly different cards, because they have had visibly different amounts of
 * checking. A visitor post is one person's unverified account; a collected story
 * has been redacted, translated, tagged and given a provenance record.
 */
export function ShareClient({
  stories,
  posts,
  comments,
  user,
  initialTab,
}: {
  stories: StoryView[];
  posts: CommunityPost[];
  comments: Record<string, PostComment[]>;
  user: { id: string; name: string } | null;
  initialTab: "share" | "community";
}) {
  const [tab, setTab] = useState<string>(initialTab);

  return (
    <>
      <section className="relative bg-hero-glow">
        <div className="shell py-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sticker tone="hot">Join the gang</Sticker>
            <Sticker tone="lime" rotate="2deg">
              Anonymous by default
            </Sticker>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            Kena scammed before? <span className="text-purple-600">Join the gang.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lede text-ink-muted">
            Share your story. Someone else might recognise the pattern before it&apos;s too late.
            Your tea could save someone from kena.
          </p>
          <ScriptNote className="mt-3">not all tea is harmless. this one is useful.</ScriptNote>
          <Mascot
            pose="share-your-story"
            size="md"
            alt="Kena Scam mascot typing a story on a keyboard"
            className="pointer-events-none absolute right-6 top-10 hidden xl:block"
          />

          <div className="mt-6">
            <PillTabs
              tabs={[
                { id: "share", label: "Share your story", icon: Coffee },
                { id: "community", label: "Community stories", icon: Users },
              ]}
              active={tab}
              onChange={setTab}
              label="Share or browse"
            />
          </div>
        </div>
      </section>

      {tab === "share" ? (
        <section className="shell py-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start">
            <div className="grid min-w-0 content-start gap-4">
              <Card className="bg-panel-tint p-6">
                <div className="flex items-start gap-3">
                  <Mascot pose="presentation" size="sm" className="shrink-0" />
                  <h2 className="font-display text-h2">What happens to your story</h2>
                </div>
                <ol className="mt-3.5 grid gap-3">
                  {[
                    {
                      title: "It posts straight to Community Stories",
                      detail:
                        "No queue, no waiting. Your story is in the feed as soon as you hit submit, anonymously unless you turn that off.",
                    },
                    {
                      title: "So leave the identifying details out",
                      detail:
                        "There is no moderator between your words and the feed. No names, phone numbers, account numbers or addresses — yours or anyone else's — and describe the method rather than accusing a person or business.",
                    },
                    {
                      title: "Tags come from a fixed vocabulary",
                      detail:
                        "Scam types, tactics, platforms, states and languages only. Nothing that could name a person, business or account exists as a tag.",
                    },
                    {
                      title: "A moderator reviews it afterwards",
                      detail:
                        "Community posts are checked after the fact and can be taken down. You can request removal of your own post at any time.",
                    },
                  ].map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pill bg-ink text-micro font-extrabold text-white"
                        aria-hidden="true"
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-body font-bold">{step.title}</span>
                        <span className="mt-0.5 block text-micro text-ink-muted">{step.detail}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>

              <Card className="p-5">
                <p className="flex items-start gap-2.5 text-body text-ink-muted">
                  <ShieldCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-safe"
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />
                  <span>
                    If money has already moved, the{" "}
                    <a href="/kena" className="font-semibold text-purple-700 hover:underline">
                      I kena already
                    </a>{" "}
                    page has the ordered steps to take first. Sharing can wait an hour; calling your
                    bank cannot.
                  </span>
                </p>
              </Card>
            </div>

            <ReportForm mode="story" />
          </div>
        </section>
      ) : (
        <section className="shell py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h2 className="font-display text-h2">Community stories</h2>
              <p className="mt-1.5 max-w-2xl text-body text-ink-muted">
                Stories posted by visitors, newest first, followed by the ones we collected and
                redacted ourselves. The two look different on purpose — a community post has not been
                reviewed or verified by anyone.
              </p>
            </div>
            <p className={cn("flex shrink-0 items-center gap-2 text-micro text-ink-muted")}>
              <PrototypeDataTag />
              {posts.length} posted · {stories.length} collected
            </p>
          </div>

          {posts.length ? (
            <div className="mt-5 grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
              {posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  comments={comments[post.id] ?? []}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <Card className="mt-5 border-dashed p-6">
              <p className="text-body text-ink-muted">
                No community posts yet in this session.{" "}
                <button
                  type="button"
                  onClick={() => setTab("share")}
                  className="font-semibold text-purple-700 hover:underline"
                >
                  Be the first to spill
                </button>{" "}
                — it appears here straight away.
              </p>
            </Card>
          )}

          <h3 className="mt-8 text-eyebrow uppercase text-ink-muted">Collected stories</h3>
          <div className="mt-3 grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
