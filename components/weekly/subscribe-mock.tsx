"use client";

import { useState } from "react";
import { Check, Mail, MessageCircle } from "lucide-react";
import { Card, Field, buttonClass, cn, inputClass } from "@/components/ui";

/**
 * The subscribe form.
 *
 * The form validates and shows a success state without sending anything yet.
 * Collecting real contact details for a list that does not exist would be the one
 * genuinely dishonest thing on the page, so it says so rather than quietly
 * discarding what people type.
 */
export function SubscribeMock() {
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (channel === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("That does not look like an email address.");
      return;
    }
    if (channel === "whatsapp" && trimmed.replace(/\D/g, "").length < 9) {
      setError("Please enter a full phone number.");
      return;
    }
    setError(null);
    setDone(true);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-panel-tint px-6 py-6">
        <h2 className="font-display text-h2">Get the tea before you kena</h2>
        <p className="mt-2 max-w-md text-body text-ink-muted">
          One edition a week. The scams actually moving, the red flags, and one line you can forward
          to the family group chat.
        </p>
      </div>

      <div className="p-6">
        {done ? (
          <div className="grid gap-3">
            <p className="flex items-start gap-2.5 rounded-card bg-safe-soft px-4 py-3.5 text-body font-semibold text-safe-deep">
              <Check className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2.6} aria-hidden="true" />
              <span>
                That would have signed you up in production — and nothing was sent or stored here.
              </span>
            </p>
            <p className="text-micro text-ink-muted">
              Your {channel === "email" ? "address" : "number"} was checked in the browser and
              then discarded — the mailing list is not live yet.
            </p>
            <button
              type="button"
              onClick={() => {
                setDone(false);
                setValue("");
              }}
              className={cn(buttonClass("ghost", "sm"), "justify-self-start")}
            >
              Try it again
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3.5">
            <div className="flex gap-2" role="group" aria-label="Delivery channel">
              {(
                [
                  { id: "email", label: "Email", icon: Mail },
                  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setChannel(option.id);
                    setError(null);
                  }}
                  aria-pressed={channel === option.id}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-pill border px-3.5 py-2 text-micro font-bold transition",
                    channel === option.id
                      ? "border-ink bg-ink text-white"
                      : "border-line bg-white text-ink-muted hover:border-purple-300 hover:text-purple-700"
                  )}
                >
                  <option.icon className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden="true" />
                  {option.label}
                </button>
              ))}
            </div>

            <Field
              label={channel === "email" ? "Email address" : "WhatsApp number"}
              htmlFor="subscribe-value"
              error={error ?? undefined}
              hint="Nothing is sent, stored or shared yet."
            >
              <input
                id="subscribe-value"
                type={channel === "email" ? "email" : "tel"}
                inputMode={channel === "email" ? "email" : "tel"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={channel === "email" ? "you@example.com" : "01X XXX XXXX"}
                className={inputClass}
                required
              />
            </Field>

            <button type="submit" className={cn(buttonClass("hot", "md"), "justify-self-start")}>
              Send me the weekly tea
            </button>
          </form>
        )}
      </div>
    </Card>
  );
}
