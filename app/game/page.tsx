import { Suspense } from "react";
import type { Metadata } from "next";
import { AudioLines, ShieldCheck } from "lucide-react";
import { Card, ScriptNote, Sticker } from "@/components/ui";
import { KenaOrNot } from "@/components/game/kena-or-not";
import { Mascot } from "@/components/ui/mascot";
import { SimulationToggle } from "@/components/game/simulation-provider";
import { NotConnected } from "@/components/not-connected";
import { getScenarios } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Kena or Not?",
  description:
    "Think you're too smart to kena? Bet. A safe awareness simulation ending with an AI voice-note final boss. No real scam, no real loss.",
};

export default async function GamePage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const [{ scenario }, scenarios] = await Promise.all([searchParams, getScenarios()]);
  if (!scenarios.length) return <NotConnected what="scenarios" />;

  const boss = scenarios.find((item) => item.isFinalBoss);

  return (
    <>
      <section className="relative bg-hero-glow">
        <div className="shell py-10">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sticker tone="hot">Kena or Not?</Sticker>
            <Sticker tone="lime" rotate="2deg">
              No real scam, no real loss
            </Sticker>
          </div>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            Think you&apos;re too smart to kena? <span className="text-purple-600">Bet.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-lede text-ink-muted">
            A safe educational simulation built from the same patterns people described in the Scam
            Tea feed. Every message here is invented. Nothing asks for a password, a payment detail,
            an OTP or anything personal, and no button leaves this site.
          </p>
          <ScriptNote className="mt-3">everybody thinks they cannot kena. that is the point.</ScriptNote>
          <Mascot
            pose="interactive-scam-simulation"
            size="md"
            alt="Kena Scam mascot studying a suspicious message on a laptop"
            className="pointer-events-none absolute right-6 top-10 hidden xl:block"
          />
        </div>
      </section>

      <section className="shell pb-6">
        <Suspense
          fallback={<div className="py-10 text-body text-ink-muted">Loading scenarios…</div>}
        >
          <KenaOrNot scenarios={scenarios} startScenarioId={scenario} />
        </Suspense>
      </section>

      {/* ------------------------------------------------------- boss teaser */}
      {boss ? (
        <section className="shell pb-6">
          <Card className="overflow-hidden border-2 border-ink shadow-stamp">
            <div className="grid gap-5 bg-ink p-6 text-white sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-eyebrow uppercase text-white/60">
                  <AudioLines className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
                  AI voice final boss
                </p>
                <h2 className="mt-3 font-display text-h1 text-white">{boss.title}</h2>
                <p className="mt-2.5 max-w-2xl text-body text-white/75">
                  A familiar-sounding person says they changed number, they are in trouble, and the
                  money has to move now. The voice is synthetic and fictional — it does not imitate
                  any real person, bank, officer or celebrity, and no voice was cloned to make it.
                </p>
                <p className="mt-3 text-micro text-white/60">
                  Audio plays only when you press play, the transcript is always visible, and after
                  you answer the urgency, fear, authority and isolation cues are highlighted inside
                  the words that carried them.
                </p>
              </div>
              <div className="shrink-0">
                <a
                  href={`/game?scenario=${boss.id}`}
                  className="inline-flex items-center gap-2 rounded-pill border-2 border-ink bg-lime px-6 py-3.5 text-[15px] font-bold text-ink shadow-stamp transition hover:-translate-y-0.5"
                >
                  Face the final boss
                </a>
              </div>
            </div>
          </Card>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ safety */}
      <section className="shell pb-14">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-display text-h2">
              <ShieldCheck className="h-5 w-5 text-safe" strokeWidth={2.3} aria-hidden="true" />
              How this stays safe
            </h2>
            <ul className="mt-3 grid gap-2.5 text-body text-ink-muted">
              <li>Every link and button in a scenario stays inside Kena Scam.</li>
              <li>No password, payment detail, OTP or personal data is ever collected.</li>
              <li>No scenario names or imitates a real person, business, bank or agency.</li>
              <li>Audio is a built-in synthetic voice — never a cloned or impersonated one.</li>
              <li>
                Surprise scenarios never appear on the I kena already page, inside a form, or if
                your device asks for reduced motion.
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="font-display text-h2">Your settings</h2>
            <p className="mt-2 text-body text-ink-muted">
              Simulations should be a fun interruption, never an unwelcome one.
            </p>
            <div className="mt-4">
              <SimulationToggle />
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
