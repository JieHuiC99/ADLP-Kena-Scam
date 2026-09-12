import Link from "next/link";
import { Bookmark, Heart, MapPin, Share2 } from "lucide-react";
import { Card, SusMeter, cn } from "@/components/ui";
import { CategoryChip, LangChip, PlatformChip, TagChip } from "@/components/ui/chips";
import { SourceBadge } from "./source-badge";
import type { StoryView } from "@/lib/provenance";
import { compact, timeAgo } from "@/lib/format";

/**
 * One story in the feed.
 *
 * The card deliberately leads with WHERE and IN WHAT LANGUAGE the story was
 * told, because that is the thing Kena Scam is trying to make visible: the same
 * scam is being described on four platforms in four languages and nobody sees
 * the connection. The source badge comes from publicAttributionFor(), so a
 * withdrawn or uncredited story shows nothing here either.
 */
export function StoryCard({ story, className }: { story: StoryView; className?: string }) {
  const attribution = story.attribution;
  // Tactic and type tags only — platform, state and language already have their
  // own chips above, and repeating them wastes the row.
  const visibleTags = story.tags.slice(0, 3);

  return (
    <Card
      as="article"
      className={cn(
        "group flex flex-col overflow-hidden transition duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lift",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 px-5 pt-5">
        <PlatformChip platform={story.platform} />
        <LangChip lang={story.originalLanguage} />
        <CategoryChip category={story.category} />
      </div>

      <div className="px-5 pt-3">
        <h3 className="text-h3 leading-snug">
          <Link href={`/tea/${story.slug}`} className="hover:text-purple-700">
            {story.title}
          </Link>
        </h3>
        <p className="mt-2 text-body text-ink-muted">{story.summary}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 text-micro text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" strokeWidth={2.4} />
          {story.state}
        </span>
        <span aria-hidden="true">·</span>
        <span>{story.lossRange}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={story.date}>{timeAgo(story.date)}</time>
      </div>

      <div className="mt-3.5 px-5">
        <SusMeter score={story.susScore} compact />
      </div>

      <div className="mt-3.5 flex flex-wrap gap-1.5 px-5">
        {visibleTags.map((tag) => (
          <TagChip key={tag} id={tag} href={`/tea?tags=${encodeURIComponent(tag)}`} />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 px-5 pb-4 pt-4">
        <SourceBadge attribution={attribution} />
        <div className="flex shrink-0 items-center gap-2.5 text-micro font-semibold text-ink-muted">
          <span className="inline-flex items-center gap-1" title={`${story.reactions} reactions`}>
            <Heart className="h-3.5 w-3.5" strokeWidth={2.4} />
            {compact(story.reactions)}
          </span>
          <span className="inline-flex items-center gap-1" title={`${story.shares} shares`}>
            <Share2 className="h-3.5 w-3.5" strokeWidth={2.4} />
            {compact(story.shares)}
          </span>
          <span className="inline-flex items-center gap-1" title={`${story.saves} saves`}>
            <Bookmark className="h-3.5 w-3.5" strokeWidth={2.4} />
            {compact(story.saves)}
          </span>
        </div>
      </div>

      <div className="border-t border-line-soft px-5 py-3">
        <Link
          href={`/tea/${story.slug}`}
          className="text-micro font-bold text-purple-600 hover:text-purple-700"
        >
          Read the tea →
        </Link>
      </div>
    </Card>
  );
}
