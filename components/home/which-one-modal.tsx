"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Coffee, Eye, LifeBuoy } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/components/ui";
import { Mascot } from "@/components/ui/mascot";

/**
 * The first-visit chooser.
 *
 * Three doors, because the three people who arrive here need completely
 * different things: someone curious, someone with a story to tell, and someone
 * who has just lost money. The third route is deliberately styled calm rather
 * than playful, and it leads straight out of the rest of the site's tone.
 *
 * Dismissal is remembered for the browser session only (sessionStorage), so a
 * returning visitor is not nagged, and a fresh session still gets the choice.
 */

const KEY = "kena:chooser-dismissed";

export function WhichOneModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Read after mount: sessionStorage does not exist during SSR, and reading
    // it during render would make the server and client markup disagree.
    try {
      if (sessionStorage.getItem(KEY) === "1") return;
    } catch {
      /* Private mode or storage blocked — showing the chooser is the safe default. */
    }
    const timer = setTimeout(() => setOpen(true), 550);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* Nothing to do; the chooser simply reappears next navigation. */
    }
    setOpen(false);
  };

  const go = (href: string) => {
    dismiss();
    router.push(href);
  };

  const choices = [
    {
      label: "Something feels sus 👀",
      hint: "Show me what scams are going around right now.",
      icon: Eye,
      href: "/tea",
      look: "bg-lime text-ink",
    },
    {
      label: "Spill scam tea ☕",
      hint: "I have a story. Someone else might recognise the pattern.",
      icon: Coffee,
      href: "/share",
      look: "bg-hot text-white",
    },
    {
      label: "I kena already 😭",
      hint: "Money moved, or I shared something I should not have.",
      icon: LifeBuoy,
      // Calm and plain. Nothing about this door should look like a game.
      look: "bg-white text-ink border-purple-300",
      href: "/kena",
    },
  ];

  return (
    <Modal open={open} onClose={dismiss} size="lg" labelledBy="chooser-title">
      {/* The mascot leans in from the side rather than sitting on top, so it
          never pushes the three choice cards below the fold on a phone. */}
      <div className="flex items-start gap-4 pr-10">
        <Mascot
          pose="shocked-alert"
          size="sm"
          animate="float"
          className="hidden shrink-0 sm:block"
        />
        <div className="min-w-0">
          <h2 id="chooser-title" className="font-display text-h1">
            Eh, which one are you?
          </h2>
          <p className="mt-2 text-body text-ink-muted">
            No wrong answer. You can change your mind any time — everything stays reachable from the
            menu.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {choices.map((choice) => (
          <button
            key={choice.href}
            type="button"
            onClick={() => go(choice.href)}
            className={cn(
              "group flex w-full items-center gap-4 rounded-card border-2 border-ink px-5 py-4 text-left shadow-stamp transition hover:-translate-y-0.5 hover:shadow-stamp-lg",
              choice.look
            )}
          >
            <choice.icon className="h-6 w-6 shrink-0" strokeWidth={2.3} aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-h3">{choice.label}</span>
              <span className="mt-0.5 block text-micro opacity-80">{choice.hint}</span>
            </span>
            <span
              className="ml-auto shrink-0 text-h3 transition group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="mt-4 text-micro font-bold text-ink-muted underline-offset-2 hover:text-ink hover:underline"
      >
        Just looking around lah
      </button>
    </Modal>
  );
}
