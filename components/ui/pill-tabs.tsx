"use client";

import { cn, TINT } from "./index";

export type PillTab = {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

/**
 * The filled / bordered tab pair used across the site.
 * Scrolls horizontally on narrow screens rather than wrapping or overflowing.
 */
export function PillTabs({
  tabs,
  active,
  onChange,
  size = "md",
  className,
  label,
}: {
  tabs: PillTab[];
  active: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      // min-w-0 is what actually makes overflow-x-auto work here: as a flex or
      // grid item this strip defaults to min-width:auto, so it refuses to
      // shrink below its tabs and pushes the whole page sideways instead.
      className={cn("no-scrollbar flex min-w-0 max-w-full gap-2 overflow-x-auto pb-0.5", className)}
    >
      {tabs.map((tab) => {
        const selected = tab.id === active;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-pill border font-bold transition",
              size === "sm" ? "px-3.5 py-2 text-micro" : "px-4 py-2.5 text-body",
              selected
                ? "border-purple-600 bg-purple-600 text-white shadow-card"
                : "border-line bg-white text-ink hover:border-purple-300 hover:text-purple-700"
            )}
          >
            {Icon ? (
              <Icon
                className={cn(
                  size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
                  selected ? "text-white" : TINT.lavender.icon
                )}
                strokeWidth={2.3}
              />
            ) : null}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
