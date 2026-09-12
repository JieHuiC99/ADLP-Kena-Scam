import Link from "next/link";
import { ArrowRight, Languages, Share2 } from "lucide-react";
import { Card, DeltaBadge, cn } from "@/components/ui";
import { LangChip, PlatformChip, TagChip } from "@/components/ui/chips";
import type { Lang, Platform, Trend } from "@/lib/data/types";

export function TrendCard({
  trend,
  platforms,
  languages,
  storyCount,
  className,
  featured = false,
}: {
  trend: Trend;
  platforms: Platform[];
  languages: Lang[];
  storyCount: number;
  className?: string;
  featured?: boolean;
}) {
  return (
    <Card
      as="article"
      className={cn(
        "group flex flex-col transition duration-200 hover:-translate-y-1 hover:border-purple-300 hover:shadow-lift",
        featured && "bg-panel-tint",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <p className="text-eyebrow uppercase text-purple-900">
          {storyCount} {storyCount === 1 ? "story" : "stories"} · one pattern
        </p>
        <DeltaBadge value={trend.momentum} />
      </div>

      <h3 className={cn("px-5 pt-2.5 font-display", featured ? "text-h1" : "text-h2")}>
        <Link href={`/trends/${trend.slug}`} className="hover:text-purple-700">
          {trend.title}
        </Link>
      </h3>
      <p className="px-5 pt-2 text-body font-semibold text-ink">{trend.tagline}</p>
      <p className="px-5 pt-2 text-body text-ink-muted">{trend.summary}</p>

      <div className="mt-4 grid gap-2.5 px-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-micro font-bold text-ink-muted">
            <Share2 className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
            Seen on
          </span>
          {platforms.map((platform) => (
            <PlatformChip key={platform} platform={platform} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-micro font-bold text-ink-muted">
            <Languages className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
            Told in
          </span>
          {languages.map((lang) => (
            <LangChip key={lang} lang={lang} />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5 px-5">
        {trend.tags.slice(0, 4).map((tag) => (
          <TagChip key={tag} id={tag} href={`/tea?tags=${encodeURIComponent(tag)}`} />
        ))}
      </div>

      <div className="mt-auto border-t border-line-soft px-5 py-3.5">
        <Link
          href={`/trends/${trend.slug}`}
          className="inline-flex items-center gap-1.5 text-micro font-bold text-purple-600 hover:text-purple-700"
        >
          See all {storyCount} tellings
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" strokeWidth={2.6} />
        </Link>
      </div>
    </Card>
  );
}
