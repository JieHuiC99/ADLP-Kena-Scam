"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, Loader2, Newspaper, Send, Sparkles, X } from "lucide-react";
import { cn } from "@/components/ui";
import { Mascot } from "@/components/ui/mascot";
import type { ChatCitation } from "@/lib/data/types";

/**
 * The floating "Ask Kena Scam" assistant.
 *
 * It is framed throughout as a trend explorer, not a checker — the prompts,
 * the placeholder and the disclosure all say the same thing, because the single
 * most likely misuse of a scam-awareness chatbot is someone pasting a message
 * and asking "is this a scam?".
 *
 * Every answer renders the story and trend cards it was grounded in, as real
 * links. That is what makes it checkable rather than merely confident.
 *
 * It is hidden on /kena: someone in the middle of losing money should get the
 * ordered steps, not a chat window.
 */

type Message = {
  role: "user" | "assistant";
  text: string;
  citations?: ChatCitation[];
  engine?: "openai" | "local";
};

const SUGGESTIONS = [
  "What scams are trending on WhatsApp?",
  "Show me fake-job stories in BM.",
  "Explain the AI voice scam.",
  "What scam should I warn my parents about?",
];

const GREETING: Message = {
  role: "assistant",
  text:
    "Hi! I am a Malaysia scam trend explorer. Ask me what is going around, how a pattern works, or what to warn your family about — I answer from the stories collected here and show you which ones I used.\n\nI cannot check whether a specific message, link, account or person is a scam. Nobody should tell you that from a chat window.",
};

export function AskKena() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Never on the urgent support page.
  const suppressed = pathname === "/kena";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (suppressed) return null;

  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || busy) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setInput("");
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = (await response.json()) as {
        answer?: string;
        citations?: ChatCitation[];
        engine?: "openai" | "local";
      };
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text:
            data.answer ??
            "Something went wrong on my side. Try asking again, or browse the feed directly.",
          citations: data.citations ?? [],
          engine: data.engine,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not reach the story database just then. Try again in a moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {/* --------------------------------------------------------- launcher */}
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label="Ask Kena Scam"
          // Icon-only on phones: a full-width pill down here covers the content
          // it is floating over.
          className="fixed bottom-5 right-5 z-[90] inline-flex items-center gap-2 rounded-pill border-2 border-ink bg-lime py-2 pl-2 pr-2 font-bold text-ink shadow-stamp transition hover:-translate-y-0.5 hover:shadow-stamp-lg sm:pr-4"
        >
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-pill bg-white/70">
            <Mascot pose="shocked-alert" size="xs" className="w-9" />
          </span>
          <span className="hidden sm:inline">Ask Kena Scam</span>
        </button>
      ) : null}

      {/* ------------------------------------------------------------ panel */}
      {open ? (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Ask Kena Scam"
          className="fixed inset-x-3 bottom-3 z-[95] flex max-h-[82dvh] flex-col overflow-hidden rounded-panel border-2 border-ink bg-cream shadow-float sm:inset-x-auto sm:right-5 sm:w-[400px]"
        >
          <header className="flex items-start justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <Mascot pose="shocked-alert" size="sm" className="w-12 shrink-0" />
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-h3 text-white">
                  <Sparkles className="h-4 w-4 text-lime" strokeWidth={2.5} aria-hidden="true" />
                  Ask Kena Scam
                </p>
                <p className="mt-0.5 text-micro text-white/70">
                  Malaysia scam trend explorer · not a scam checker
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the assistant"
              className="-mr-1 -mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-pill text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4.5 w-4.5" strokeWidth={2.4} />
            </button>
          </header>

          <div
            ref={logRef}
            className="flex-1 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
            aria-atomic="false"
          >
            <div className="grid gap-3.5">
              {messages.map((message, index) => (
                <div key={index} className={cn(message.role === "user" && "flex justify-end")}>
                  <div
                    className={cn(
                      "max-w-[92%] rounded-card px-3.5 py-2.5 text-body",
                      message.role === "user"
                        ? "bg-purple-600 text-white"
                        : "border border-line bg-white text-ink"
                    )}
                  >
                    <p className="whitespace-pre-line leading-relaxed">{message.text}</p>

                    {message.citations?.length ? (
                      <div className="mt-3 border-t border-line-soft pt-2.5">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-muted">
                          Based on
                        </p>
                        <div className="mt-1.5 grid gap-1.5">
                          {message.citations.map((citation) => (
                            <Link
                              key={`${citation.kind}-${citation.id}`}
                              href={citation.href}
                              onClick={() => setOpen(false)}
                              className="flex items-start gap-2 rounded-chip bg-paper-tint px-2.5 py-2 text-micro font-semibold text-ink transition hover:bg-purple-50"
                            >
                              {citation.kind === "trend" ? (
                                <Layers
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-600"
                                  strokeWidth={2.4}
                                  aria-hidden="true"
                                />
                              ) : (
                                <Newspaper
                                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-hot"
                                  strokeWidth={2.4}
                                  aria-hidden="true"
                                />
                              )}
                              <span className="min-w-0">{citation.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {busy ? (
                <p className="flex items-center gap-2 text-micro text-ink-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Looking through the tea…
                </p>
              ) : null}

              {messages.length === 1 ? (
                <div className="grid gap-1.5">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => ask(suggestion)}
                      className="rounded-pill border border-line bg-white px-3 py-2 text-left text-micro font-semibold text-ink-muted transition hover:border-purple-300 hover:text-purple-700"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void ask(input);
            }}
            className="border-t border-line bg-white px-3 py-3"
          >
            <div className="flex items-center gap-2">
              <label htmlFor="ask-kena-input" className="sr-only">
                Ask about a scam trend
              </label>
              <input
                ref={inputRef}
                id="ask-kena-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="What is trending on WhatsApp?"
                className="min-w-0 flex-1 rounded-pill border border-line bg-cream px-3.5 py-2.5 text-body focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-600/12"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-ink text-white transition hover:bg-ink-soft disabled:opacity-40"
              >
                <Send className="h-4 w-4" strokeWidth={2.4} />
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-muted">
              Answers come only from the stories and trends on this site. It does not verify
              people, businesses, accounts or links, and never says something is definitely a scam.
            </p>
          </form>
        </div>
      ) : null}
    </>
  );
}
