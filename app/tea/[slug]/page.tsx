import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { Card, EyebrowPill, buttonClass, cn } from "@/components/ui";
import { StoryDetail } from "@/components/story/story-detail";
import { StoryCard } from "@/components/story/story-card";
import { decorate, getStories, getStory, getStorySource, getTrend, relatedStories } from "@/lib/repo";
import { publicAttributionFor } from "@/lib/provenance";
import { LANG_LABEL } from "@/lib/data/types";

export async function generateStaticParams() {
  const stories = await getStories();
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return { title: "Story not found" };
  return { title: story.title, description: story.summary };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) notFound();

  const [source, trend, related] = await Promise.all([
    getStorySource(story.id),
    story.trendId ? getTrend(story.trendId) : Promise.resolve(undefined),
    relatedStories(story, 3).then(decorate),
  ]);
  const attribution = publicAttributionFor(source, story.platform);

  return (
    <div className="shell py-8">
      <StoryDetail story={story} attribution={attribution} />

      {/* ------------------------------------------- one scam, many stories */}
      {trend ? (
        <Card className="mt-8 overflow-hidden bg-panel-tint">
          <div className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <EyebrowPill>One scam, many stories</EyebrowPill>
              <h2 className="mt-3 font-display text-h2">{trend.title}</h2>
              <p className="mt-2 max-w-2xl text-body text-ink-muted">{trend.tagline}</p>
            </div>
            <Link
              href={`/trends/${trend.slug}`}
              className={cn(buttonClass("dark", "md"), "shrink-0 justify-self-start")}
            >
              <Layers className="h-4 w-4" strokeWidth={2.4} />
              See the whole trend
            </Link>
          </div>
        </Card>
      ) : null}

      {/* ----------------------------------------------------- related tea */}
      {related.length ? (
        <section className="mt-8">
          <h2 className="font-display text-h2">Related tea you might have missed</h2>
          <p className="mt-1.5 max-w-2xl text-body text-ink-muted">
            Same pattern, different corner of the internet. You read this one on {story.platform} in{" "}
            {LANG_LABEL[story.originalLanguage]} — here it is again somewhere you were not looking.
          </p>
          <div className="mt-4 grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
            {related.map((item) => (
              <StoryCard key={item.id} story={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
