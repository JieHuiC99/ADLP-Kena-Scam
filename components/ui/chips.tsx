import Link from "next/link";
import { cn } from "./index";
import { tagFacet, tagLabel } from "@/lib/data/taxonomy";
import { LANG_LABEL } from "@/lib/data/types";
import type { Category, Lang, Platform, TagFacet } from "@/lib/data/types";

/**
 * The colourful chips that carry a story's metadata.
 *
 * Each platform, language and scam type keeps a persistent colour so the feed
 * can be scanned by shape rather than read word by word — the same WhatsApp
 * green means the same thing on a card, a trend page and the radar. Every chip
 * keeps dark text on a soft ground, which is what holds contrast at AA while
 * still looking like a sticker.
 */

const PLATFORM_STYLE: Record<Platform, string> = {
  WhatsApp: "bg-safe-soft text-safe-deep",
  Telegram: "bg-info-soft text-info",
  Facebook: "bg-purple-100 text-purple-900",
  TikTok: "bg-ink/5 text-ink",
  Instagram: "bg-hot-soft text-hot-deep",
  Reddit: "bg-tangerine-soft text-tangerine-deep",
};

const LANG_STYLE: Record<Lang, string> = {
  bm: "bg-lime-soft text-lime-deep",
  en: "bg-line-soft text-ink-muted",
  zh: "bg-risk-soft text-risk-deep",
  ta: "bg-caution-soft text-caution-deep",
};

const FACET_STYLE: Record<TagFacet, string> = {
  scam_type: "bg-hot-soft text-hot-deep hover:brightness-95",
  tactic: "bg-tangerine-soft text-tangerine-deep hover:brightness-95",
  platform: "bg-purple-100 text-purple-900 hover:bg-purple-200",
  geography: "bg-lime-soft text-lime-deep hover:brightness-95",
  language: "bg-navy-soft text-navy hover:brightness-95",
};

const BASE =
  "inline-flex max-w-full items-center gap-1 truncate whitespace-nowrap rounded-pill px-2.5 py-1 text-[11px] font-extrabold";

export function PlatformChip({ platform, className }: { platform: Platform; className?: string }) {
  return <span className={cn(BASE, PLATFORM_STYLE[platform], className)}>{platform}</span>;
}

export function LangChip({
  lang,
  className,
  withLabel = false,
}: {
  lang: Lang;
  className?: string;
  withLabel?: boolean;
}) {
  return (
    <span className={cn(BASE, LANG_STYLE[lang], className)}>
      {withLabel ? `Original: ${LANG_LABEL[lang]}` : LANG_LABEL[lang]}
    </span>
  );
}

export function CategoryChip({ category, className }: { category: Category; className?: string }) {
  return <span className={cn(BASE, "bg-ink text-white", className)}>{category}</span>;
}

export function InfoChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn(BASE, "bg-line-soft text-ink-muted", className)}>{children}</span>;
}

/**
 * A clickable taxonomy tag. Routes into the feed pre-filtered by that tag,
 * which is how a reader gets from one story to every other telling of it.
 */
export function TagChip({
  id,
  active = false,
  href,
  onClick,
  suffix,
  className,
}: {
  id: string;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  suffix?: React.ReactNode;
  className?: string;
}) {
  const facet = tagFacet(id) ?? "scam_type";
  const look = active ? "bg-ink text-white hover:bg-ink-soft" : FACET_STYLE[facet];
  const content = (
    <>
      <span aria-hidden="true" className="opacity-55">
        #
      </span>
      {tagLabel(id)}
      {suffix}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(BASE, "transition", look, className)}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={cn(BASE, "transition", look, className)}
      >
        {content}
      </button>
    );
  }
  return <span className={cn(BASE, look, className)}>{content}</span>;
}
