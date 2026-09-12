"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Award,
  Check,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { Card, ScriptNote, Sticker, buttonClass, cn } from "@/components/ui";
import { VoiceNote } from "./voice-note";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/data/types";
import type { Difficulty, SimulationScenario } from "@/lib/data/types";

/**
 * "Kena or Not?" — the awareness simulation.
 *
 * Safety constraints that shaped this component:
 *
 * - Nothing here collects a password, payment detail, OTP or personal data.
 *   Answering is a button press; there are no input fields at all.
 * - Every control stays inside this site. No scenario renders an external link.
 * - The result screens explain the red flags and the real-world safe action,
 *   because a quiz that only scores you teaches nothing.
 * - It is labelled as a simulation on every screen, including the losing one,
 *   so "BOOM! You kena" can never be mistaken for a real loss.
 */

type Phase = "select" | "playing" | "answered" | "summary";

type Answer = {
  scenario: SimulationScenario;
  choiceIndex: number;
  outcome: "safe" | "kena";
};

const ROUND_LENGTH = 4;

export function KenaOrNot({
  scenarios,
  startScenarioId,
}: {
  scenarios: SimulationScenario[];
  startScenarioId?: string;
}) {
  const [phase, setPhase] = useState<Phase>("select");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [queue, setQueue] = useState<SimulationScenario[]>([]);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [copied, setCopied] = useState(false);
  const [coachPlaying, setCoachPlaying] = useState(false);
  const headingRef = useRef<HTMLDivElement>(null);
  const coachAudio = useRef<HTMLAudioElement | null>(null);

  const current = queue[index];
  const score = answers.filter((answer) => answer.outcome === "safe").length;

  /** Deep-linking straight into the Final Boss from elsewhere on the site. */
  useEffect(() => {
    if (!startScenarioId) return;
    const scenario = scenarios.find((item) => item.id === startScenarioId);
    if (!scenario) return;
    setQueue([scenario]);
    setDifficulty(scenario.difficulty);
    setIndex(0);
    setPhase("playing");
  }, [startScenarioId, scenarios]);

  useEffect(
    () => () => {
      coachAudio.current?.pause();
    },
    []
  );

  const start = (level: Difficulty) => {
    const pool = scenarios.filter((scenario) => scenario.difficulty === level);
    // Shuffle only on click, never during render, so the server and the client
    // never disagree about what the first scenario is.
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const picked = level === "hard" ? orderBossLast(shuffled) : shuffled;
    setDifficulty(level);
    setQueue(picked.slice(0, ROUND_LENGTH));
    setIndex(0);
    setAnswers([]);
    setChosen(null);
    setPhase("playing");
  };

  const answer = (choiceIndex: number) => {
    if (!current || phase === "answered") return;
    const outcome = current.choices[choiceIndex]?.outcome ?? "kena";
    setChosen(choiceIndex);
    setAnswers((list) => [...list, { scenario: current, choiceIndex, outcome }]);
    setPhase("answered");
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const next = () => {
    coachAudio.current?.pause();
    setCoachPlaying(false);
    if (index + 1 >= queue.length) {
      setPhase("summary");
      return;
    }
    setIndex(index + 1);
    setChosen(null);
    setPhase("playing");
  };

  /** Kena Coach speaks the feedback, only when asked. Never autoplay. */
  const playCoach = async () => {
    if (!current) return;
    if (coachPlaying) {
      coachAudio.current?.pause();
      setCoachPlaying(false);
      return;
    }
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: current.id, role: "coach" }),
      });
      if (response.status === 204 || !response.ok) return;
      const audio = new Audio(URL.createObjectURL(await response.blob()));
      coachAudio.current = audio;
      audio.addEventListener("ended", () => setCoachPlaying(false));
      await audio.play();
      setCoachPlaying(true);
    } catch {
      /* Transcript already covers it. */
    }
  };

  const shareText = useMemo(
    () =>
      answers.some((item) => item.scenario.isFinalBoss)
        ? `I survived the Kena Scam AI Voice Final Boss. Can you?`
        : `I survived ${score} of ${answers.length} scam traps on Kena Scam. Can you?`,
    [answers, score]
  );

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: "Kena or Not?", text: shareText, url });
      else {
        await navigator.clipboard.writeText(`${shareText} ${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      /* Share sheet dismissed. */
    }
  };

  /* ------------------------------------------------------------- difficulty */

  if (phase === "select") {
    return (
      <div className="grid gap-5">
        <Card className="p-6 sm:p-8">
          <h2 className="font-display text-h2">Pick your difficulty</h2>
          <p className="mt-2 max-w-2xl text-body text-ink-muted">
            Four scenarios per round. Every one is invented for this simulation — no real scam, no
            real loss, and nothing here ever asks for a password, payment detail, OTP or any
            personal information.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {DIFFICULTIES.map((level) => {
              const count = scenarios.filter((item) => item.difficulty === level).length;
              const hasVoice = scenarios.some(
                (item) => item.difficulty === level && item.medium === "voice"
              );
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => start(level)}
                  disabled={!count}
                  className={cn(
                    "group flex flex-col rounded-card border-2 border-ink p-5 text-left shadow-stamp transition hover:-translate-y-1 hover:shadow-stamp-lg disabled:opacity-40",
                    level === "easy" ? "bg-lime" : level === "medium" ? "bg-tangerine" : "bg-hot"
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-h2",
                      level === "hard" ? "text-white" : "text-ink"
                    )}
                  >
                    {DIFFICULTY_LABEL[level]}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 text-micro font-semibold",
                      level === "hard" ? "text-white/80" : "text-ink/70"
                    )}
                  >
                    {count} scenarios
                    {hasVoice ? " · includes the AI voice note" : ""}
                  </span>
                  <span
                    className={cn(
                      "mt-4 text-micro font-extrabold uppercase tracking-wide",
                      level === "hard" ? "text-white" : "text-ink"
                    )}
                  >
                    Start →
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <ScriptNote className="text-center">
          no real scam, no real loss, no personal details — ever
        </ScriptNote>
      </div>
    );
  }

  /* ----------------------------------------------------------------- round */

  if (phase === "summary") {
    const perfect = score === answers.length && answers.length > 0;
    const beatBoss = answers.some(
      (item) => item.scenario.isFinalBoss && item.outcome === "safe"
    );

    return (
      <div className="grid gap-5">
        <Card className="overflow-hidden border-2 border-ink shadow-stamp-lg">
          <div className={cn("px-6 py-8 text-center", perfect ? "bg-lime" : "bg-cream-deep")}>
            <p className="text-eyebrow uppercase text-ink/60">Round complete</p>
            <h2 className="mt-3 font-display text-mega text-ink">
              {score}/{answers.length}
            </h2>
            <p className="mt-2 text-lede font-semibold text-ink">
              {beatBoss
                ? "Voice Clone Boss Defeated"
                : perfect
                  ? "Scam Sensei"
                  : score > 0
                    ? "Almost Kena, But Now You Know"
                    : "Recovered from the simulation"}
            </p>
            <p className="mx-auto mt-3 max-w-lg text-body text-ink/70">
              {perfect
                ? "You did not let urgency drive a single decision. That is the whole skill."
                : "Every one you missed is now one you will recognise. That is what the simulation is for."}
            </p>
          </div>

          <div className="grid gap-2 p-5 sm:p-6">
            {answers.map((item, position) => (
              <div
                key={`${item.scenario.id}-${position}`}
                className="flex items-start gap-3 rounded-card border border-line p-4"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-pill text-white",
                    item.outcome === "safe" ? "bg-safe" : "bg-hot"
                  )}
                  aria-hidden="true"
                >
                  {item.outcome === "safe" ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : (
                    <X className="h-3.5 w-3.5" strokeWidth={3} />
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-body font-bold">{item.scenario.title}</p>
                  <p className="mt-0.5 text-micro text-ink-muted">
                    {item.scenario.choices[item.choiceIndex]?.feedback}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ------------------------------------------------- shareable card */}
        <Card className="overflow-hidden border-2 border-ink bg-ink text-white shadow-stamp">
          <div className="grid gap-4 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-eyebrow uppercase text-white/60">
                <Trophy className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                Shareable result
              </p>
              <p className="mt-3 font-display text-h1 text-white">{shareText}</p>
              <p className="mt-2 text-micro text-white/60">
                Awareness simulation. No real scam, no real loss.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2.5">
              <button
                type="button"
                onClick={share}
                className={cn(buttonClass("lime", "md"), "border-2 border-ink")}
              >
                {copied ? (
                  <Check className="h-4 w-4" strokeWidth={2.6} />
                ) : (
                  <Share2 className="h-4 w-4" strokeWidth={2.4} />
                )}
                {copied ? "Copied" : "Share result"}
              </button>
              <button
                type="button"
                onClick={() => setPhase("select")}
                className="inline-flex items-center gap-2 rounded-pill border-2 border-white px-4 py-2.5 text-body font-bold text-white transition hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2.4} />
                Play again
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-body text-ink-muted">
            Want the real versions? Every scenario here is based on a pattern in the{" "}
            <Link href="/trends" className="font-semibold text-purple-700 hover:underline">
              One Scam, Many Stories
            </Link>{" "}
            collection, told by people it actually happened to.
          </p>
        </Card>
      </div>
    );
  }

  if (!current) return null;

  const answered = phase === "answered";
  const outcome = chosen !== null ? current.choices[chosen]?.outcome : null;

  return (
    <div ref={headingRef} className="grid gap-5">
      {/* ---------------------------------------------------------- progress */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sticker tone={difficulty === "hard" ? "hot" : "lime"}>
            {DIFFICULTY_LABEL[difficulty]}
          </Sticker>
          {current.isFinalBoss ? (
            <Sticker tone="ink" rotate="2deg">
              <span className="inline-flex items-center gap-1.5">
                <Volume2 className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                AI voice final boss
              </span>
            </Sticker>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-micro font-bold text-ink-muted">
            {index + 1} of {queue.length}
          </span>
          <span className="flex gap-1" aria-hidden="true">
            {queue.map((_, position) => (
              <span
                key={position}
                className={cn(
                  "h-2 w-6 rounded-pill",
                  position < answers.length
                    ? answers[position].outcome === "safe"
                      ? "bg-safe"
                      : "bg-hot"
                    : position === index
                      ? "bg-ink"
                      : "bg-line"
                )}
              />
            ))}
          </span>
          <span className="text-micro font-bold text-ink">
            Score {score}/{answers.length || 0}
          </span>
        </div>
      </div>

      {/* --------------------------------------------------------- scenario */}
      <Card className="p-5 sm:p-7">
        <p className="inline-flex items-center gap-1.5 rounded-pill bg-caution-soft px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-caution-deep">
          Awareness simulation. No real scam, no real loss.
        </p>
        <h2 className="mt-4 font-display text-h2">{current.title}</h2>

        <div className="mt-4">
          {current.medium === "voice" ? (
            <VoiceNote
              scenarioId={current.id}
              channelLabel={current.channelLabel}
              transcript={current.body}
              flags={current.transcriptFlags}
              revealFlags={answered}
            />
          ) : (
            <div className="rounded-card border border-line bg-cream-deep p-4">
              <p className="text-micro font-bold text-ink-muted">{current.channelLabel}</p>
              <p className="mt-2.5 whitespace-pre-line text-[15px] leading-[1.7] text-ink">
                {current.body}
              </p>
            </div>
          )}
        </div>

        {/* --------------------------------------------------------- choices */}
        <div className="mt-5 grid gap-2.5">
          <p className="text-micro font-bold text-ink">What do you do?</p>
          {current.choices.map((choice, position) => {
            const picked = chosen === position;
            const reveal = answered;
            return (
              <button
                key={choice.label}
                type="button"
                onClick={() => answer(position)}
                disabled={answered}
                aria-pressed={picked}
                className={cn(
                  "flex items-start gap-3 rounded-card border-2 px-4 py-3.5 text-left transition",
                  !reveal && "border-line bg-white hover:-translate-y-0.5 hover:border-ink hover:shadow-stamp",
                  reveal && choice.outcome === "safe" && "border-safe bg-safe-soft",
                  reveal && choice.outcome === "kena" && picked && "border-hot bg-hot-soft",
                  reveal && choice.outcome === "kena" && !picked && "border-line bg-white opacity-60"
                )}
              >
                {reveal ? (
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-pill text-white",
                      choice.outcome === "safe" ? "bg-safe" : "bg-hot"
                    )}
                    aria-hidden="true"
                  >
                    {choice.outcome === "safe" ? (
                      <Check className="h-3 w-3" strokeWidth={3} />
                    ) : (
                      <X className="h-3 w-3" strokeWidth={3} />
                    )}
                  </span>
                ) : null}
                <span className="min-w-0">
                  <span className="block text-body font-bold">{choice.label}</span>
                  {reveal ? (
                    <span className="mt-1 block text-micro text-ink-muted">{choice.feedback}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* ----------------------------------------------------------- result */}
      {answered ? (
        <Card
          className={cn(
            "overflow-hidden border-2 shadow-stamp",
            outcome === "safe" ? "border-safe" : "border-hot"
          )}
        >
          <div className={cn("px-5 py-5 sm:px-7", outcome === "safe" ? "bg-safe-soft" : "bg-hot-soft")}>
            <p className="flex items-center gap-2 text-eyebrow uppercase text-ink/60">
              <Award className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
              {outcome === "safe" ? "Scam Sensei points" : "Recovered from the simulation"}
            </p>
            <h3 className="mt-2.5 font-display text-h1">
              {outcome === "safe" ? "Wah, very sus-aware." : "BOOM! You kena… in a simulation only 😭"}
            </h3>
            <p className="mt-2 max-w-2xl text-body text-ink/75">
              {outcome === "safe"
                ? "You spotted it. Here is exactly which signals you were reading."
                : "No money moved and nothing was real — but this is the moment worth understanding."}
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:p-7">
            <div>
              <h4 className="text-h3">
                {outcome === "safe" ? "Red flags you recognised" : "Red flags you missed"}
              </h4>
              <ul className="mt-2.5 grid gap-2">
                {current.redFlags.map((flag) => (
                  <li key={flag} className="flex items-start gap-2.5 text-body">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-hot"
                      aria-hidden="true"
                    />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card bg-safe-soft p-4">
              <p className="flex items-start gap-2.5 text-body font-semibold text-safe-deep">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
                <span>
                  <span className="block text-eyebrow uppercase text-safe-deep/70">
                    What to do in real life
                  </span>
                  <span className="mt-1 block">{current.realWorldAction}</span>
                </span>
              </p>
            </div>

            <div className="rounded-card border border-line bg-paper-tint p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="flex items-center gap-2 text-eyebrow uppercase text-purple-900">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                  Kena Coach says
                </p>
                <button
                  type="button"
                  onClick={playCoach}
                  className={cn(buttonClass("ghost", "sm"), "shrink-0")}
                >
                  <Volume2 className="h-3.5 w-3.5" strokeWidth={2.4} />
                  {coachPlaying ? "Stop" : "Hear it"}
                </button>
              </div>
              <p className="mt-2 text-body text-ink">{current.coachLine}</p>
            </div>

            <button
              type="button"
              onClick={next}
              className={cn(buttonClass("dark", "lg"), "justify-self-start")}
            >
              {index + 1 >= queue.length ? "See my result" : "Next scenario"}
            </button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

/** Keeps the AI voice boss as the closing scenario of a hard round. */
function orderBossLast(scenarios: SimulationScenario[]): SimulationScenario[] {
  const boss = scenarios.filter((scenario) => scenario.isFinalBoss);
  const rest = scenarios.filter((scenario) => !scenario.isFinalBoss);
  return [...rest, ...boss];
}
