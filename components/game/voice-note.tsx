"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Pause, Play, Volume2 } from "lucide-react";
import { cn } from "@/components/ui";
import type { TranscriptCue, TranscriptFlag } from "@/lib/data/types";

/**
 * The voice-note player for the AI Final Boss.
 *
 * Built as a chat-app bubble because that is where these actually arrive, and
 * recognising the shape is part of the lesson. Accessibility and safety pushed
 * the same decisions here:
 *
 * - Audio NEVER autoplays. It plays only after the play button is pressed.
 * - The transcript is visible by default, not hidden behind a toggle, so the
 *   scenario is fully usable with no audio at all — which is also exactly what
 *   happens when no OpenAI key is configured.
 * - The waveform is decorative and hidden from assistive technology.
 * - The clip is labelled as AI-generated fiction, above the player, always.
 *
 * After the player answers, the pressure cues in the transcript are highlighted
 * in place. Seeing "don't tell anyone yet" marked as isolation inside the
 * sentence it appeared in teaches more than the same point made abstractly.
 */

const CUE_STYLE: Record<TranscriptCue, { chip: string; mark: string; label: string }> = {
  urgency: {
    chip: "bg-hot-soft text-hot-deep",
    mark: "bg-hot-soft text-hot-deep decoration-hot",
    label: "Urgency",
  },
  fear: {
    chip: "bg-risk-soft text-risk-deep",
    mark: "bg-risk-soft text-risk-deep decoration-risk",
    label: "Fear",
  },
  authority: {
    chip: "bg-info-soft text-info",
    mark: "bg-info-soft text-info decoration-info",
    label: "Authority",
  },
  fomo: {
    chip: "bg-caution-soft text-caution-deep",
    mark: "bg-caution-soft text-caution-deep decoration-caution",
    label: "FOMO",
  },
  isolation: {
    chip: "bg-purple-100 text-purple-900",
    mark: "bg-purple-100 text-purple-900 decoration-purple-600",
    label: "Isolation",
  },
};

const BARS = [
  8, 14, 22, 30, 18, 26, 34, 20, 12, 28, 36, 24, 16, 30, 22, 12, 20, 32, 26, 14, 10, 24, 34, 18, 26,
  14, 8, 20, 30, 16,
];

export function VoiceNote({
  scenarioId,
  channelLabel,
  transcript,
  flags,
  revealFlags,
}: {
  scenarioId: string;
  channelLabel: string;
  transcript: string;
  flags: TranscriptFlag[];
  /** Only true after the player has answered — never before. */
  revealFlags: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "playing" | "paused" | "unavailable">(
    "idle"
  );
  const [progress, setProgress] = useState(0);
  const urlRef = useRef<string | null>(null);

  useEffect(
    () => () => {
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const toggle = async () => {
    if (state === "playing") {
      audioRef.current?.pause();
      setState("paused");
      return;
    }
    if (audioRef.current && (state === "paused" || state === "idle") && urlRef.current) {
      await audioRef.current.play();
      setState("playing");
      return;
    }

    setState("loading");
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, role: "trap" }),
      });
      // 204 means no key is configured. The transcript below is the experience.
      if (response.status === 204 || !response.ok) {
        setState("unavailable");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      urlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.addEventListener("timeupdate", () => {
        if (audio.duration) setProgress(audio.currentTime / audio.duration);
      });
      audio.addEventListener("ended", () => {
        setState("paused");
        setProgress(1);
      });
      await audio.play();
      setState("playing");
    } catch {
      setState("unavailable");
    }
  };

  /** Splits the transcript so flagged phrases can be marked in place. */
  const segments = useMemo(() => {
    if (!revealFlags || !flags.length) return [{ text: transcript, flag: null as TranscriptFlag | null }];

    const found: Array<{ start: number; end: number; flag: TranscriptFlag }> = [];
    for (const flag of flags) {
      const index = transcript.toLowerCase().indexOf(flag.phrase.toLowerCase());
      if (index >= 0) found.push({ start: index, end: index + flag.phrase.length, flag });
    }
    found.sort((a, b) => a.start - b.start);

    const out: Array<{ text: string; flag: TranscriptFlag | null }> = [];
    let cursor = 0;
    for (const match of found) {
      if (match.start < cursor) continue;
      if (match.start > cursor) out.push({ text: transcript.slice(cursor, match.start), flag: null });
      out.push({ text: transcript.slice(match.start, match.end), flag: match.flag });
      cursor = match.end;
    }
    if (cursor < transcript.length) out.push({ text: transcript.slice(cursor), flag: null });
    return out;
  }, [transcript, flags, revealFlags]);

  return (
    <div className="grid gap-3">
      <p className="inline-flex w-fit items-center gap-1.5 rounded-pill bg-ink px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
        <Volume2 className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
        AI-generated fictional voice · awareness simulation only
      </p>

      {/* ----------------------------------------------------- chat bubble */}
      <div className="rounded-card border border-line bg-[#ECE5DD] p-4">
        <p className="text-micro font-bold text-ink-muted">{channelLabel}</p>

        <div className="mt-2.5 max-w-[92%] rounded-card rounded-tl-sm bg-white p-3 shadow-card">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              disabled={state === "loading"}
              aria-label={state === "playing" ? "Pause the voice note" : "Play the voice note"}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill bg-safe text-white transition hover:bg-safe-deep disabled:opacity-60"
            >
              {state === "loading" ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : state === "playing" ? (
                <Pause className="h-5 w-5 fill-current" strokeWidth={2} />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" strokeWidth={2} />
              )}
            </button>

            {/* Decorative waveform. */}
            <div className="flex h-9 flex-1 items-center gap-[3px]" aria-hidden="true">
              {BARS.map((height, index) => {
                const played = index / BARS.length <= progress;
                return (
                  <span
                    key={index}
                    style={{
                      height: `${height}px`,
                      animationDelay: `${index * 40}ms`,
                    }}
                    className={cn(
                      "w-[3px] shrink-0 rounded-pill transition-colors",
                      played ? "bg-safe" : "bg-ink/20",
                      state === "playing" && "animate-pulse"
                    )}
                  />
                );
              })}
            </div>

            <span className="shrink-0 text-micro font-semibold text-ink-muted">0:14</span>
          </div>

          {state === "unavailable" ? (
            <p className="mt-2.5 border-t border-line-soft pt-2 text-micro text-ink-muted">
              Audio is not configured in this environment. The transcript below is the full
              scenario — nothing is missing.
            </p>
          ) : null}
        </div>
      </div>

      {/* ------------------------------------------------------ transcript */}
      <div className="rounded-card border border-line bg-white p-4">
        <p className="text-eyebrow uppercase text-ink-muted">
          Transcript {revealFlags ? "· pressure cues highlighted" : "· always shown"}
        </p>
        <p className="mt-2.5 text-[15px] leading-[1.75] text-ink">
          {segments.map((segment, index) =>
            segment.flag ? (
              <mark
                key={index}
                title={segment.flag.explain}
                className={cn(
                  "rounded px-1 py-0.5 font-semibold underline decoration-2 underline-offset-2",
                  CUE_STYLE[segment.flag.cue].mark
                )}
              >
                {segment.text}
              </mark>
            ) : (
              <span key={index}>{segment.text}</span>
            )
          )}
        </p>

        {revealFlags ? (
          <ul className="mt-4 grid gap-2 border-t border-line-soft pt-3.5">
            {flags.map((flag) => (
              <li key={flag.phrase} className="flex flex-wrap items-start gap-2 text-body">
                <span
                  className={cn(
                    "shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-extrabold",
                    CUE_STYLE[flag.cue].chip
                  )}
                >
                  {CUE_STYLE[flag.cue].label}
                </span>
                <span className="min-w-0 flex-1 text-ink-muted">
                  <span className="font-semibold text-ink">&ldquo;{flag.phrase}&rdquo;</span> —{" "}
                  {flag.explain}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
