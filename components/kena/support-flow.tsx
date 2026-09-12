"use client";

import { useState } from "react";
import {
  BadgeAlert,
  CircleHelp,
  Landmark,
  Lock,
  PhoneCall,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, cn } from "@/components/ui";

/**
 * The "I kena already" situation picker.
 *
 * Tone is the whole design here. Someone arriving on this page may have lost
 * money in the last ten minutes, so there are no jokes, no stickers, no
 * animations and no simulations — the awareness game is hard-suppressed on this
 * route. Steps are numbered, ordered by what actually matters first, and
 * written so they can be followed while panicking.
 *
 * Official contacts are deliberately not printed. A wrong hotline number on a
 * page people reach in an emergency would do real harm, so the page says clearly
 * where to get the current details instead.
 */

type Situation = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  lede: string;
  steps: Array<{ title: string; detail: string }>;
  note?: string;
};

const SITUATIONS: Situation[] = [
  {
    id: "transferred",
    label: "I just transferred money",
    icon: Landmark,
    lede: "The first hour matters most. Work down this list in order — do not stop to work out how it happened.",
    steps: [
      {
        title: "Call your bank now and ask them to freeze the transfer",
        detail:
          "Use the number printed on the back of your own card, not one from any message. Say the words \"I am reporting a scam transfer\" — that routes you to the right team faster.",
      },
      {
        title: "Report it to the national scam response line",
        detail:
          "Malaysia has a dedicated scam response hotline and an online police reporting portal. Look the current numbers up on an official government site, or ask your bank to give them to you while you are on the call — we deliberately do not print a number here in case it goes out of date.",
      },
      {
        title: "Write down everything while it is fresh",
        detail:
          "Time of transfer, amount, the account name it went to, and screenshots of the whole conversation. Do not delete the chat, however much you want to.",
      },
      {
        title: "Make a police report",
        detail:
          "A report is usually required before a bank can escalate a recall, and it is what makes any later recovery possible. Take your transaction records with you.",
      },
      {
        title: "Tell one person you trust",
        detail:
          "Not because they can fix it — because carrying this alone is what scammers count on, and it is what makes people send a second payment.",
      },
    ],
    note: "Banks can sometimes hold funds that have not yet been withdrawn. Speed genuinely helps, which is why the call comes before everything else.",
  },
  {
    id: "otp",
    label: "I shared my OTP or password",
    icon: Lock,
    lede: "Assume the account is already accessible to someone else and act on that basis.",
    steps: [
      {
        title: "Change the password from a different device if you can",
        detail:
          "If the same password is used anywhere else, change it there too. Start with email and banking, because those are used to reset everything else.",
      },
      {
        title: "Turn on two-step verification",
        detail:
          "This is the single change that stops the same thing happening again. Use an authenticator app rather than SMS where the service offers it.",
      },
      {
        title: "Call your bank and tell them an OTP was shared",
        detail:
          "Use the number on your own card. They can lock transactions and reissue credentials before anything moves.",
      },
      {
        title: "Check for changes you did not make",
        detail:
          "New devices signed in, forwarding rules added to your email, a changed recovery phone number, new payees. Remove anything you do not recognise.",
      },
      {
        title: "Warn your contacts",
        detail:
          "If a messaging account was involved, people in your contact list will be messaged next, from your name. A quick heads-up prevents the second victim.",
      },
    ],
    note: "Sharing a code does not make you careless. The whole method is built to create a moment where it feels like the reasonable thing to do.",
  },
  {
    id: "impersonation",
    label: "Someone is impersonating my family or bank",
    icon: Users,
    lede: "You have not lost anything yet. The goal now is to verify independently and cut the channel.",
    steps: [
      {
        title: "Contact the real person on a number you already had",
        detail:
          "Not the number that contacted you. A saved contact, or one you looked up yourself from an official site.",
      },
      {
        title: "Do not reply to the new number or account",
        detail:
          "Replying confirms the line is live and reaches a real person. Screenshot it, then block and report it on the platform.",
      },
      {
        title: "Warn whoever else might be contacted",
        detail:
          "If your name or a relative's name is being used, the people most likely to be targeted next are in the family group chat.",
      },
      {
        title: "Agree a family check question",
        detail:
          "Something only the two of you could answer, agreed now while nothing is happening. It is the cheapest defence against a convincing voice.",
      },
    ],
    note: "A familiar voice, photo or display name is not proof of identity. Verification means a channel you chose, not one you were given.",
  },
  {
    id: "unsure",
    label: "I'm not sure yet",
    icon: CircleHelp,
    lede: "That is a perfectly good place to start. Nothing here commits you to anything.",
    steps: [
      {
        title: "Stop replying for now",
        detail:
          "You do not owe anyone an immediate answer. Almost every scam depends on you continuing to respond in the next few minutes.",
      },
      {
        title: "Check the pattern against stories on this site",
        detail:
          "If what happened to you matches a trend here, the red flags and the safe action are already written out. That is faster than working it out alone.",
      },
      {
        title: "Verify through a channel you sourced yourself",
        detail:
          "Call the company on a number from your own card, statement, or a site you navigated to directly. Never through a link or number you were sent.",
      },
      {
        title: "If money has moved, treat it as the first situation above",
        detail:
          "Call your bank first. It costs you a phone call, and it is the only step where being early changes the outcome.",
      },
    ],
  },
];

export function SupportFlow() {
  const [active, setActive] = useState<string>(SITUATIONS[0].id);
  const situation = SITUATIONS.find((item) => item.id === active) ?? SITUATIONS[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
      <nav aria-label="What happened" className="grid min-w-0 gap-2">
        {SITUATIONS.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              aria-pressed={selected}
              className={cn(
                "flex items-start gap-3 rounded-card border px-4 py-3.5 text-left transition",
                selected
                  ? "border-purple-600 bg-white shadow-card"
                  : "border-line bg-white/70 hover:border-purple-300"
              )}
            >
              <item.icon
                className={cn("mt-0.5 h-5 w-5 shrink-0", selected ? "text-purple-600" : "text-ink-muted")}
                strokeWidth={2.2}
                aria-hidden="true"
              />
              <span className={cn("text-body font-bold", selected ? "text-ink" : "text-ink-muted")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <Card className="min-w-0 p-6 sm:p-8">
        <h2 className="font-display text-h2">{situation.label}</h2>
        <p className="mt-2 max-w-2xl text-lede text-ink-muted">{situation.lede}</p>

        <ol className="mt-6 grid gap-5">
          {situation.steps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-purple-600 text-body font-extrabold text-white"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-h3">{step.title}</h3>
                <p className="mt-1 text-body text-ink-muted">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>

        {situation.note ? (
          <p className="mt-6 flex items-start gap-2.5 rounded-card bg-safe-soft px-4 py-3.5 text-body text-safe-deep">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            <span>{situation.note}</span>
          </p>
        ) : null}

        <div className="mt-6 rounded-card border border-line bg-paper-tint p-4">
          <p className="flex items-center gap-2 text-micro font-bold text-ink">
            <PhoneCall className="h-3.5 w-3.5 text-purple-600" strokeWidth={2.4} aria-hidden="true" />
            Official help and reporting
          </p>
          <ul className="mt-2 grid gap-1.5 text-micro text-ink-muted">
            <li>
              <span className="font-semibold text-ink">National scam response hotline</span> —
              [official number: look up on an official government site]
            </li>
            <li>
              <span className="font-semibold text-ink">Online police report portal</span> —
              [official URL placeholder]
            </li>
            <li>
              <span className="font-semibold text-ink">Your bank&apos;s fraud line</span> — the
              number printed on the back of your own card
            </li>
          </ul>
          <p className="mt-2.5 flex items-start gap-2 text-micro text-ink-muted">
            <BadgeAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={2.4} aria-hidden="true" />
            <span>
              We do not print hotline numbers here, because a wrong number on this page would do
              real harm. Your bank can give you the current official contacts while you are on the
              call with them, and they are listed on official government sites.
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
}
