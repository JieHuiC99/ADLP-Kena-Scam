import { MessageSquareQuote, UserRound } from "lucide-react";
import { Card, cn } from "@/components/ui";
import { CategoryChip, InfoChip, TagChip } from "@/components/ui/chips";
import type { Category, Lang } from "@/lib/data/types";
import { LANG_LABEL, LANGS, OTHER } from "@/lib/data/types";
import type { CommunityPost, PostComment } from "@/lib/community";
import { CommentThread } from "./comment-thread";
import { timeAgo } from "@/lib/format";

/**
 * A story posted by a visitor, shown in Community Stories.
 *
 * It is deliberately a different card from StoryCard. A collected story has been
 * redacted, translated, tagged and given a provenance record; a community post
 * has none of that, and dressing one up as the other would tell the reader
 * something untrue about how much checking it has had.
 *
 * So: same shape and rhythm as the rest of the feed, but plainly badged as a
 * community post, with no sus score, no source badge and no translation toggle
 * it has not earned.
 */
export function CommunityPostCard({
  post,
  comments,
  user,
  className,
}: {
  post: CommunityPost;
  comments: PostComment[];
  user: { id: string; name: string } | null;
  className?: string;
}) {
  const platform = post.platform === OTHER ? null : post.platform;
  const language =
    post.language !== OTHER && LANGS.includes(post.language as Lang)
      ? LANG_LABEL[post.language as Lang]
      : "Other";

  return (
    <Card
      as="article"
      className={cn(
        "flex flex-col border-purple-300 transition duration-200 hover:-translate-y-1 hover:shadow-lift",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 px-5 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-purple-100 px-2.5 py-1 text-[11px] font-extrabold text-purple-900">
          <MessageSquareQuote className="h-3 w-3" strokeWidth={2.8} aria-hidden="true" />
          Community post
        </span>
        {platform ? <InfoChip>{platform}</InfoChip> : null}
        {post.platform === OTHER ? <InfoChip>Other platform</InfoChip> : null}
        <InfoChip>{language}</InfoChip>
        {post.category ? <CategoryChip category={post.category as Category} /> : null}
      </div>

      <div className="px-5 pt-3">
        <h3 className="text-h3 leading-snug">{post.title}</h3>
        <p className="mt-2 whitespace-pre-line text-body text-ink-muted wrap-anywhere">
          {post.body}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-5 text-micro text-ink-muted">
        <span className="inline-flex items-center gap-1">
          <UserRound className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
          {post.anonymous ? "Posted anonymously" : (post.authorName ?? "A community member")}
        </span>
        {post.state ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.state}</span>
          </>
        ) : null}
        {post.lossRange ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{post.lossRange}</span>
          </>
        ) : null}
        <span aria-hidden="true">·</span>
        <time dateTime={post.createdAt}>{timeAgo(post.createdAt, new Date())}</time>
      </div>

      {post.images.length ? (
        <div
          className={cn(
            "mt-4 grid gap-1.5 px-5",
            post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          )}
        >
          {post.images.map((src, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={index}
              src={src}
              alt={`Image attached to the post "${post.title}"`}
              loading="lazy"
              className={cn(
                "w-full rounded-chip border border-line bg-cream-deep object-cover",
                post.images.length === 1 ? "max-h-72" : "aspect-square"
              )}
            />
          ))}
        </div>
      ) : null}

      {post.tags.length ? (
        <div className="mt-3.5 flex flex-wrap gap-1.5 px-5">
          {post.tags.slice(0, 4).map((tag) => (
            <TagChip key={tag} id={tag} href={`/tea?tags=${encodeURIComponent(tag)}`} />
          ))}
        </div>
      ) : null}

      <p className="mt-auto px-5 py-3 text-micro text-ink-muted">
        Posted by a visitor and not reviewed. Kena Scam has not verified any of it — treat it as one
        person&apos;s account of a pattern.
      </p>

      <CommentThread postId={post.id} initial={comments} user={user} />
    </Card>
  );
}
