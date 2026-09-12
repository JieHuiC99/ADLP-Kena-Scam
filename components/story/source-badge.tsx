import { BadgeCheck, FileText, Radar, ShieldOff, Sparkles } from "lucide-react";
import { cn } from "@/components/ui";
import type { PublicAttribution } from "@/lib/provenance";

/**
 * The compact provenance badge on a story card.
 *
 * It renders whatever publicAttributionFor() returned and nothing else — no
 * component decides for itself whether a creator may be named.
 */

const ICON: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  "Creator submitted": BadgeCheck,
  "Creator consented": BadgeCheck,
  "Official advisory": FileText,
  "Public lead": Radar,
  "Curated demo": Sparkles,
  "Attribution withdrawn": ShieldOff,
};

const TONE: Record<PublicAttribution["badgeTone"], string> = {
  mint: "bg-safe-soft text-safe-deep",
  lavender: "bg-purple-100 text-purple-900",
  blue: "bg-info-soft text-info",
  amber: "bg-caution-soft text-caution-deep",
  ink: "bg-ink/5 text-ink-muted",
};

export function SourceBadge({
  attribution,
  className,
}: {
  attribution: PublicAttribution;
  className?: string;
}) {
  const Icon = ICON[attribution.badge] ?? Sparkles;
  return (
    <span
      title={attribution.permissionLine}
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 truncate rounded-pill px-2.5 py-1 text-[11px] font-extrabold",
        TONE[attribution.badgeTone],
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
      <span className="truncate">{attribution.badge}</span>
    </span>
  );
}
