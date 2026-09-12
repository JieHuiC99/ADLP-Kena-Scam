import { REFERENCE_DATE } from "./config";

/**
 * Relative time, measured against the fixed reference date the demo set was
 * generated from rather than the wall clock.
 *
 * Using Date.now() here would render one string on the server and a different
 * one in the browser a moment later, which React reports as a hydration
 * mismatch. Anchoring to REFERENCE_DATE keeps "3d ago" stable and correct
 * relative to the seeded dates it is describing.
 */
export function timeAgo(iso: string, now: Date = REFERENCE_DATE): string {
  const diff = now.getTime() - Date.parse(iso);
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return `${Math.round(days / 30)}mo ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  return String(value);
}
