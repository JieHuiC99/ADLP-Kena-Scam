"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, X } from "lucide-react";
import { buttonClass, cn } from "@/components/ui";

/**
 * The surprise-simulation interrupter.
 *
 * A "Kena or Not" card can appear while someone is browsing the non-urgent
 * parts of the site — that unexpectedness is the point, because real scams
 * arrive while you are doing something else.
 *
 * The constraints around it matter more than the feature:
 *
 * - Never on /kena, /share or /moderation. Somebody who has just lost money, is
 *   part-way through writing their story, or is moderating must never be
 *   ambushed by a fake scam.
 * - Never while a form is focused, so it cannot interrupt typing.
 * - Never under prefers-reduced-motion.
 * - "Not now lah" dismisses it for the session; "Stop these" disables it
 *   permanently in this browser, and the game page links to the same control.
 * - It only ever invites. The card itself is not a scam simulation — the
 *   scenario lives on /game, behind a click.
 */

const SESSION_KEY = "kena:sim-snoozed";
const PERSIST_KEY = "kena:sim-disabled";

/** Routes where an interruption would be inappropriate, not just annoying. */
const SUPPRESSED = ["/kena", "/share", "/moderation", "/game"];

type SimulationContext = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const Ctx = createContext<SimulationContext>({ enabled: true, setEnabled: () => {} });

export const useSimulations = () => useContext(Ctx);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [enabled, setEnabledState] = useState(true);
  const [visible, setVisible] = useState(false);

  const setEnabled = useCallback((value: boolean) => {
    setEnabledState(value);
    try {
      if (value) localStorage.removeItem(PERSIST_KEY);
      else localStorage.setItem(PERSIST_KEY, "1");
    } catch {
      /* Storage blocked; the choice still applies for this page view. */
    }
    if (!value) setVisible(false);
  }, []);

  // Read the stored preference after mount — reading during render would make
  // the server and client markup disagree.
  useEffect(() => {
    try {
      if (localStorage.getItem(PERSIST_KEY) === "1") setEnabledState(false);
    } catch {
      /* Ignore. */
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (SUPPRESSED.some((route) => pathname === route || pathname.startsWith(`${route}/`))) return;

    let snoozed = false;
    try {
      snoozed = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* Ignore. */
    }
    if (snoozed) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Long enough that it lands mid-browse rather than on arrival.
    const timer = setTimeout(() => {
      const active = document.activeElement;
      const typing =
        active instanceof HTMLInputElement ||
        active instanceof HTMLTextAreaElement ||
        active instanceof HTMLSelectElement ||
        (active as HTMLElement | null)?.isContentEditable;
      if (!typing) setVisible(true);
    }, 38_000);

    return () => clearTimeout(timer);
  }, [enabled, pathname]);

  const snooze = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* Ignore. */
    }
    setVisible(false);
  };

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled]);

  return (
    <Ctx.Provider value={value}>
      {children}

      {visible ? (
        <aside
          aria-label="Awareness simulation invitation"
          className="fixed bottom-5 left-5 right-5 z-[80] mx-auto max-w-sm animate-fade-up rounded-panel border-2 border-ink bg-lime p-5 shadow-stamp-lg sm:left-5 sm:right-auto"
        >
          <button
            type="button"
            onClick={snooze}
            aria-label="Dismiss"
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-pill text-ink/60 transition hover:bg-ink/10 hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2.6} />
          </button>

          <p className="flex items-center gap-2 text-eyebrow uppercase text-ink/60">
            <Gamepad2 className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
            Awareness simulation
          </p>
          <p className="mt-2 font-display text-h2 text-ink">Eh, quick one — kena or not?</p>
          <p className="mt-1.5 text-body text-ink/75">
            One fake scam message, four seconds of your time. No real scam, no real loss.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/game"
              onClick={snooze}
              className={cn(buttonClass("dark", "sm"), "border-2 border-ink")}
            >
              Test me lah
            </Link>
            <button type="button" onClick={snooze} className={buttonClass("ghost", "sm")}>
              Not now lah
            </button>
            <button
              type="button"
              onClick={() => setEnabled(false)}
              className="text-micro font-bold text-ink/60 underline-offset-2 hover:text-ink hover:underline"
            >
              Stop these
            </button>
          </div>
        </aside>
      ) : null}
    </Ctx.Provider>
  );
}

/** The opt-out control, surfaced on the game page so it is findable again. */
export function SimulationToggle() {
  const { enabled, setEnabled } = useSimulations();
  return (
    <label className="flex items-start gap-3 rounded-card border border-line bg-white p-4">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => setEnabled(event.target.checked)}
        className="mt-0.5 h-4 w-4 accent-purple-600"
      />
      <span className="min-w-0">
        <span className="block text-body font-bold">
          Let surprise scenarios appear while I browse
        </span>
        <span className="mt-0.5 block text-micro text-ink-muted">
          Never on the I kena already page, never while you are filling in a form, and never if your
          device asks for reduced motion. Your choice is remembered in this browser.
        </span>
      </span>
    </label>
  );
}
