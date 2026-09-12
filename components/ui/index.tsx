import type { ReactNode } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ArrowUpRight, Info, TrendingDown, TrendingUp } from "lucide-react";

export const cn = (...inputs: Array<string | undefined | null | false>) => twMerge(clsx(inputs));

/* ------------------------------------------------------------------ tints */

export type Tint = "lavender" | "blue" | "mint" | "blush" | "amber" | "ink" | "hot" | "lime";

export const TINT: Record<Tint, { chip: string; icon: string; panel: string; bar: string }> = {
  lavender: { chip: "bg-purple-100", icon: "text-purple-600", panel: "bg-purple-50", bar: "bg-purple-500" },
  blue: { chip: "bg-info-soft", icon: "text-info", panel: "bg-info-soft", bar: "bg-info" },
  mint: { chip: "bg-safe-soft", icon: "text-safe", panel: "bg-safe-soft", bar: "bg-safe" },
  blush: { chip: "bg-risk-soft", icon: "text-risk", panel: "bg-risk-soft", bar: "bg-risk" },
  amber: { chip: "bg-caution-soft", icon: "text-caution-deep", panel: "bg-caution-soft", bar: "bg-caution" },
  ink: { chip: "bg-ink/5", icon: "text-ink", panel: "bg-ink/5", bar: "bg-ink" },
  hot: { chip: "bg-hot-soft", icon: "text-hot-deep", panel: "bg-hot-soft", bar: "bg-hot" },
  lime: { chip: "bg-lime-soft", icon: "text-lime-deep", panel: "bg-lime-soft", bar: "bg-lime" },
};

/* ------------------------------------------------------------- primitives */

export function EyebrowPill({
  children,
  tone = "lavender",
  className,
}: {
  children: ReactNode;
  tone?: Tint;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 truncate whitespace-nowrap rounded-pill px-3 py-1.5 text-eyebrow uppercase",
        TINT[tone].panel,
        tone === "lavender" ? "text-purple-900" : TINT[tone].icon,
        className
      )}
    >
      {children}
    </span>
  );
}

export function IconChip({
  icon: Icon,
  tone = "lavender",
  size = "md",
  className,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: Tint;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = size === "sm" ? "h-8 w-8" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const glyph = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-chip",
        box,
        TINT[tone].chip,
        className
      )}
    >
      <Icon className={cn(glyph, TINT[tone].icon)} strokeWidth={2.2} />
    </span>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
} & React.HTMLAttributes<HTMLElement>) {
  return (
    // min-w-0: as a flex or grid item a Card defaults to min-width:auto, so a
    // long redacted quote or handle inside it widens the whole page instead of
    // wrapping. Cards are the repeated unit in every grid here, so this is the
    // right place to stop horizontal overflow once rather than per grid.
    <Tag
      className={cn("min-w-0 rounded-card border border-line bg-white shadow-card", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({
  icon,
  tone = "lavender",
  title,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tone?: Tint;
  title: string;
  action?: { label: string; href?: string };
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3 px-5 pb-3 pt-4", className)}>
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <IconChip icon={icon} tone={tone} size="sm" /> : null}
        <h3 className="truncate text-h3">{title}</h3>
      </div>
      {action?.href ? (
        <Link
          href={action.href}
          className="shrink-0 text-micro font-bold text-purple-600 hover:text-purple-700"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

export function StatTile({
  value,
  label,
  sub,
  prototype,
}: {
  value: ReactNode;
  label: string;
  sub?: string;
  prototype?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-[30px] font-extrabold leading-none tracking-[-0.03em] sm:text-[34px]">
          {value}
        </span>
        {prototype ? <PrototypeDataTag /> : null}
      </div>
      <div className="mt-1.5 text-body font-semibold text-ink-muted">{label}</div>
      {sub ? <div className="mt-0.5 text-micro text-ink-muted">{sub}</div> : null}
    </div>
  );
}

export function DeltaBadge({ value, invert = true }: { value: number; invert?: boolean }) {
  const rising = value >= 0;
  // For scam reports a rise is bad news, so this is inverted by default
  // relative to an ordinary business metric.
  const bad = invert ? rising : !rising;
  const Icon = rising ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-micro font-bold", bad ? "text-risk" : "text-safe")}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.6} />
      {rising ? "+" : ""}
      {Math.round(value)}%
    </span>
  );
}

export function Button({
  children,
  variant = "dark",
  size = "md",
  className,
  ...rest
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(buttonClass(variant, size), className)} {...rest}>
      {children}
    </button>
  );
}

export type ButtonVariant = "dark" | "purple" | "ghost" | "danger" | "hot" | "lime";

export function buttonClass(
  variant: ButtonVariant = "dark",
  size: "sm" | "md" | "lg" = "md"
) {
  const base =
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-pill font-bold transition disabled:cursor-not-allowed disabled:opacity-45";
  const sizing =
    size === "sm"
      ? "px-3.5 py-2 text-micro"
      : size === "lg"
        ? "px-6 py-3.5 text-[15px]"
        : "px-4 py-2.5 text-body";
  const look = {
    dark: "bg-ink text-white hover:bg-ink-soft shadow-card",
    purple: "bg-purple-600 text-white hover:bg-purple-700 shadow-card",
    ghost: "border border-line bg-white text-ink hover:border-purple-300 hover:text-purple-700",
    danger: "bg-risk text-white hover:bg-risk-deep shadow-card",
    // Accents carry ink text, never white — that is what keeps them at AA.
    hot: "bg-hot text-white hover:bg-hot-deep shadow-card",
    lime: "bg-lime text-ink hover:brightness-95 shadow-card",
  }[variant];
  return cn(base, sizing, look);
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
  required,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-micro font-bold text-ink">
        {label}
        {required ? <span className="ml-1 text-hot">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-micro font-semibold text-risk">{error}</p>
      ) : hint ? (
        <p className="text-micro text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-field border border-line bg-white px-3.5 py-3 text-body text-ink placeholder:text-ink-muted/70 transition focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-600/12";

export const selectClass = cn(inputClass, "appearance-none pr-9 font-semibold");

/**
 * Marks a figure as coming from the community story set rather than an official
 * statistic. A quiet provenance note, not a disclaimer banner.
 */
export function PrototypeDataTag({ className }: { className?: string }) {
  return (
    <span
      title="Aggregated from community stories, not official statistics"
      className={cn(
        "inline-flex items-center rounded-pill bg-ink/5 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.07em] text-ink-muted",
        className
      )}
    >
      Community data
    </span>
  );
}

/** Required on every AI-assisted output and generated summary. */
export function Disclaimer({ text, className }: { text?: string; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2 text-micro leading-relaxed text-ink-muted", className)}>
      <Info className="mt-[1px] h-3.5 w-3.5 shrink-0" strokeWidth={2.2} />
      <span>
        {text ??
          "Kena Scam explains patterns and red flags. It does not verify any person, business, account or link, and it never says something is definitely a scam."}
      </span>
    </p>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <IconChip icon={Icon} tone="lavender" size="lg" />
      <h3 className="text-h3">{title}</h3>
      <p className="max-w-sm text-body text-ink-muted">{body}</p>
      {action}
    </div>
  );
}

/** Handwritten marginalia. Decorative, so it is hidden from assistive tech. */
export function ScriptNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      aria-hidden="true"
      className={cn("select-none font-script text-[19px] leading-[1.35] text-ink-muted/80", className)}
    >
      {children}
    </p>
  );
}

/** The rotated editorial sticker. Decorative by default. */
export function Sticker({
  children,
  tone = "lime",
  className,
  rotate = "-2deg",
}: {
  children: ReactNode;
  tone?: "lime" | "hot" | "tangerine" | "ink" | "white";
  className?: string;
  rotate?: string;
}) {
  const look = {
    lime: "bg-lime text-ink",
    hot: "bg-hot text-white",
    tangerine: "bg-tangerine text-ink",
    ink: "bg-ink text-white",
    white: "bg-white text-ink",
  }[tone];
  return (
    <span
      style={{ transform: `rotate(${rotate})` }}
      className={cn(
        "inline-block rounded-chip border-2 border-ink px-3 py-1.5 text-eyebrow uppercase shadow-stamp",
        look,
        className
      )}
    >
      {children}
    </span>
  );
}

export function LinkArrow({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-micro font-bold text-purple-600 hover:text-purple-700"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.6} />
    </Link>
  );
}

export function RankedBarList({
  items,
  tone = "lavender",
}: {
  items: Array<{
    label: string;
    value: number;
    delta?: number;
    href?: string;
    icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }>;
  tone?: Tint;
}) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ol className="grid gap-1">
      {items.map((item, index) => {
        const inner = (
          <>
            <span className="w-3 shrink-0 text-micro font-bold text-ink-muted">{index + 1}</span>
            {item.icon ? <IconChip icon={item.icon} tone={tone} size="sm" /> : null}
            <span className="min-w-0 flex-1 truncate text-body font-semibold">{item.label}</span>
            <span className="hidden h-1.5 w-16 shrink-0 overflow-hidden rounded-pill bg-line-soft sm:block">
              <span
                className={cn("block h-full rounded-pill", TINT[tone].bar)}
                style={{ width: `${Math.max(8, (item.value / max) * 100)}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-body font-bold tabular-nums">
              {item.value.toLocaleString()}
            </span>
            {item.delta !== undefined ? (
              <span className="w-14 shrink-0 text-right">
                <DeltaBadge value={item.delta} />
              </span>
            ) : null}
          </>
        );
        return (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-chip px-5 py-2.5 hover:bg-paper-tint"
              >
                {inner}
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-chip px-5 py-2.5 hover:bg-paper-tint">
                {inner}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** How strongly a story matches known scam behaviour. Never a verdict. */
export function SusMeter({ score, compact = false }: { score: number; compact?: boolean }) {
  const band = score >= 85 ? "Very sus" : score >= 70 ? "Quite sus" : "Bit sus";
  const tone = score >= 85 ? "bg-hot" : score >= 70 ? "bg-tangerine" : "bg-caution";
  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-micro font-bold text-ink-muted"
        title={`Sus level ${score} of 100 — how strongly this matches known scam patterns`}
      >
        <span className="h-1.5 w-10 overflow-hidden rounded-pill bg-line-soft" aria-hidden="true">
          <span className={cn("block h-full rounded-pill", tone)} style={{ width: `${score}%` }} />
        </span>
        {band}
      </span>
    );
  }
  return (
    <div className="min-w-0">
      <div className="flex items-center justify-between gap-2 text-micro font-bold">
        <span className="text-ink-muted">Sus level</span>
        <span className="text-ink">
          {band} · {score}/100
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-pill bg-line-soft"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Sus level"
      >
        <span className={cn("block h-full rounded-pill transition-[width] duration-700", tone)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}
