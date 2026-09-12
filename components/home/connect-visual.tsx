"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/components/ui";

/**
 * The hero animation: four scattered story cards, in four languages, on four
 * platforms, drawing lines to one another until they resolve into a single
 * trend.
 *
 * It is the product thesis as a three-second loop. Because it is decorative and
 * the same claim is made in the text beside it, the whole thing is hidden from
 * assistive technology; under prefers-reduced-motion it renders in its final
 * connected state rather than animating.
 */

const CARDS = [
  {
    platform: "Facebook",
    lang: "BM",
    quote: "“Ayah saya klik pautan bungkusan…”",
    tone: "bg-purple-100 text-purple-900",
    at: "left-0 top-2",
    dot: "#6D4AFF",
    x: 14,
    y: 18,
  },
  {
    platform: "TikTok",
    lang: "中文",
    quote: "“我妈差点输入网银密码”",
    tone: "bg-ink text-white",
    at: "right-0 top-0",
    dot: "#0F1729",
    x: 86,
    y: 12,
  },
  {
    platform: "WhatsApp",
    lang: "English",
    quote: "“Pay RM2.50 to release your parcel”",
    tone: "bg-safe-soft text-safe-deep",
    at: "left-2 bottom-1",
    dot: "#167C64",
    x: 20,
    y: 84,
  },
  {
    platform: "Reddit",
    lang: "தமிழ்",
    quote: "“பார்சல் சுங்கத்தில் சிக்கியது”",
    tone: "bg-tangerine-soft text-tangerine-deep",
    at: "right-2 bottom-3",
    dot: "#FF7A2F",
    x: 82,
    y: 88,
  },
];

export function ConnectVisual() {
  const [connected, setConnected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setConnected(true);
      return;
    }
    const timer = setTimeout(() => setConnected(true), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative mx-auto aspect-[4/3] w-full max-w-[520px] select-none"
    >
      {/* The wiring, drawn underneath the cards. */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {CARDS.map((card) => (
          <line
            key={card.platform}
            x1={card.x}
            y1={card.y}
            x2={50}
            y2={50}
            stroke="#C9BDFF"
            strokeWidth={0.5}
            strokeDasharray="2 2"
            className={cn(
              "transition-opacity duration-700",
              connected ? "opacity-100" : "opacity-0"
            )}
          />
        ))}
      </svg>

      {/* The centre: one scam. */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span
          className={cn(
            "absolute inset-0 rounded-pill bg-purple-400/40",
            connected && "animate-pulse-ring"
          )}
        />
        <span
          className={cn(
            "relative flex h-[92px] w-[92px] flex-col items-center justify-center rounded-pill border-2 border-ink bg-lime text-center shadow-stamp transition-all duration-700",
            connected ? "scale-100 opacity-100" : "scale-75 opacity-0"
          )}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-[0.06em]">One</span>
          <span className="font-display text-[17px] font-extrabold leading-none">SCAM</span>
        </span>
      </div>

      {CARDS.map((card, index) => (
        <div
          key={card.platform}
          style={{ animationDelay: `${index * 140}ms` }}
          className={cn(
            "absolute w-[47%] max-w-[210px] animate-fade-up rounded-card border-2 border-ink bg-white p-3 shadow-stamp transition-transform duration-700",
            card.at,
            connected ? "translate-x-0 translate-y-0" : "translate-y-2"
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            <span
              className={cn(
                "rounded-pill px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide",
                card.tone
              )}
            >
              {card.platform}
            </span>
            <span className="rounded-pill bg-line-soft px-2 py-0.5 text-[9px] font-extrabold text-ink-muted">
              {card.lang}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] font-semibold leading-snug text-ink">{card.quote}</p>
        </div>
      ))}
    </div>
  );
}
