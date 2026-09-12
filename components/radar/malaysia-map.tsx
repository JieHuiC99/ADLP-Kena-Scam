"use client";

import { useState } from "react";
import { cn } from "@/components/ui";
import type { MyState } from "@/lib/data/types";

/**
 * Choropleth of Malaysian states.
 *
 * Schematic geometry — recognisable as Peninsular Malaysia plus Sabah and
 * Sarawak, with every state its own hit target. It is a data display, not a
 * survey map, so exact coastlines are not the point.
 *
 * Improvements over a plain hover map, all of which matter for a page whose
 * whole job is drilling into one state: each state is a real focusable button,
 * so the map works from the keyboard; selecting one filters the page rather
 * than only showing a tooltip; and intensity is bucketed against the maximum in
 * the current filter window rather than an absolute scale, so the picture stays
 * readable whether the range is 7 days or 90.
 *
 * It never shows an address or any personal location — only a state total.
 */

const STATES: Array<{ id: MyState; d: string; labelAt: [number, number] }> = [
  { id: "Perlis", d: "M50,16 L64,13 L68,23 L54,27 Z", labelAt: [58, 20] },
  { id: "Kedah", d: "M54,27 L68,23 L84,33 L86,52 L64,58 L48,44 Z", labelAt: [67, 40] },
  { id: "Penang", d: "M32,48 L46,42 L52,56 L38,62 Z", labelAt: [42, 52] },
  { id: "Perak", d: "M48,44 L64,58 L86,52 L94,74 L86,108 L60,104 L44,74 Z", labelAt: [70, 78] },
  { id: "Kelantan", d: "M84,33 L112,28 L126,54 L110,74 L94,74 L86,52 Z", labelAt: [104, 52] },
  { id: "Terengganu", d: "M112,28 L138,44 L136,80 L116,92 L110,74 L126,54 Z", labelAt: [124, 62] },
  { id: "Pahang", d: "M94,74 L110,74 L116,92 L136,80 L142,120 L104,130 L86,108 Z", labelAt: [114, 104] },
  { id: "Selangor", d: "M60,104 L86,108 L92,130 L70,138 L54,120 Z", labelAt: [70, 118] },
  { id: "Kuala Lumpur", d: "M76,114 L90,112 L92,124 L78,126 Z", labelAt: [84, 119] },
  { id: "Negeri Sembilan", d: "M70,138 L92,130 L104,130 L108,152 L84,158 Z", labelAt: [90, 144] },
  { id: "Melaka", d: "M84,158 L108,152 L112,168 L94,174 Z", labelAt: [98, 163] },
  { id: "Johor", d: "M94,174 L112,168 L142,120 L156,154 L136,188 L104,186 Z", labelAt: [124, 162] },
  {
    id: "Sarawak",
    d: "M196,162 L214,126 L252,100 L292,92 L312,112 L300,134 L268,152 L232,172 Z",
    labelAt: [254, 132],
  },
  {
    id: "Sabah",
    d: "M292,92 L300,60 L326,40 L354,46 L362,74 L344,96 L322,108 L312,112 Z",
    labelAt: [328, 72],
  },
];

const LEGEND = [
  { label: "Quiet", color: "#F4F5F9" },
  { label: "Low", color: "#FDE4E8" },
  { label: "Medium", color: "#F08494" },
  { label: "High", color: "#DC3B4B" },
  { label: "Very high", color: "#B3384D" },
];

export function MalaysiaMap({
  data,
  selected,
  onSelect,
}: {
  data: Array<{ state: MyState; value: number }>;
  selected?: MyState | null;
  onSelect?: (state: MyState | null) => void;
}) {
  const [hover, setHover] = useState<MyState | null>(null);

  const byState = new Map(data.map((row) => [row.state, row.value]));
  const max = Math.max(1, ...data.map((row) => row.value));
  const valueFor = (state: MyState) => byState.get(state) ?? 0;

  const fillFor = (state: MyState) => {
    const value = valueFor(state);
    if (!value) return "#F4F5F9";
    const ratio = value / max;
    if (ratio > 0.8) return "#B3384D";
    if (ratio > 0.55) return "#DC3B4B";
    if (ratio > 0.3) return "#F08494";
    if (ratio > 0.12) return "#F9BDC6";
    return "#FDE4E8";
  };

  const active = hover ?? selected ?? null;
  const activeGeometry = active ? STATES.find((state) => state.id === active) : null;

  return (
    <div className="relative">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-x-4 gap-y-1 px-5 text-micro text-ink-muted">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-pill border border-line"
              style={{ background: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      <div className="scroll-x px-5 pb-5">
        <svg
          viewBox="0 0 380 200"
          className="h-auto w-full min-w-[440px]"
          role="group"
          aria-label="Curated demo reports by Malaysian state. Select a state to filter the page."
        >
          {STATES.map((state) => {
            const value = valueFor(state.id);
            const isSelected = selected === state.id;
            return (
              <path
                key={state.id}
                d={state.d}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                aria-label={`${state.id}: ${value} report${value === 1 ? "" : "s"}`}
                fill={fillFor(state.id)}
                stroke={isSelected ? "#0F1729" : "#fff"}
                strokeWidth={isSelected ? 2.6 : 1.4}
                className="cursor-pointer outline-none transition-[filter] hover:brightness-95 focus-visible:brightness-90"
                onMouseEnter={() => setHover(state.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(state.id)}
                onBlur={() => setHover(null)}
                onClick={() => onSelect?.(isSelected ? null : state.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect?.(isSelected ? null : state.id);
                  }
                }}
              >
                <title>{`${state.id}: ${value.toLocaleString()} reports`}</title>
              </path>
            );
          })}
        </svg>
      </div>

      {activeGeometry ? (
        <div
          className="pointer-events-none absolute z-20 w-[196px] rounded-chip bg-ink px-3.5 py-2.5 text-white shadow-float"
          style={{
            left: `clamp(0px, calc(${(activeGeometry.labelAt[0] / 380) * 100}% - 98px), calc(100% - 196px))`,
            top: `calc(${(activeGeometry.labelAt[1] / 200) * 100}% + 16px)`,
          }}
        >
          <p className="text-body font-bold">{activeGeometry.id}</p>
          <p
            className={cn(
              "text-micro font-bold",
              valueFor(activeGeometry.id) ? "text-risk-mid" : "text-white/60"
            )}
          >
            {valueFor(activeGeometry.id).toLocaleString()} demo reports
          </p>
          <p className="mt-0.5 text-micro text-white/70">
            {selected === activeGeometry.id ? "Selected — click to clear" : "Click to filter"}
          </p>
        </div>
      ) : null}
    </div>
  );
}
