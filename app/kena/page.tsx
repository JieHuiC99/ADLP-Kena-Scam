import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Card, buttonClass, cn } from "@/components/ui";
import { SupportFlow } from "@/components/kena/support-flow";
import { ReportForm } from "@/components/share/report-form";
import { Mascot } from "@/components/ui/mascot";

export const metadata: Metadata = {
  title: "I kena already",
  description:
    "Calm, ordered next steps if money has moved, an OTP was shared, or someone is impersonating your family or bank.",
};

/**
 * The urgent support page.
 *
 * Deliberately the quietest page on the site: no stickers, no animations, no
 * chatbot and no awareness simulation. The layout module reads the pathname and
 * suppresses those, because a scam simulation shown to someone who has just
 * lost money would be indefensible.
 */
export default function KenaPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-10">
          <p className="flex items-center gap-2 text-eyebrow uppercase text-purple-900">
            <HeartHandshake className="h-3.5 w-3.5" strokeWidth={2.6} aria-hidden="true" />
            Support
          </p>
          {/* The mascot sits beside the copy rather than above it, so the first
              thing on the page is still the sentence that matters. On a phone it
              drops below the text for the same reason. */}
          <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="max-w-3xl font-display text-h1">
                You&apos;re not stupid. Scams are designed to rush you.
              </h1>
              <p className="mt-3 max-w-2xl text-lede text-ink-muted">
                Take a breath. Let&apos;s do the next safe thing. Pick what happened and work down
                the list in order — you do not need to understand how it happened first.
              </p>
            </div>
            <Mascot
              pose="help-support"
              size="md"
              // Calm and helpful, never the shocked pose here: somebody who has
              // just lost money does not need a cartoon reacting to it.
              alt="Kena Scam mascot wearing a headset, here to help"
              className="shrink-0 self-start sm:self-center"
            />
          </div>
        </div>
      </section>

      <section className="shell py-8">
        <SupportFlow />
      </section>

      <section className="shell pb-14">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-h2">Tell us what happened, privately</h2>
            <p className="mt-2.5 text-body text-ink-muted">
              This is not published. It goes to a moderation queue so the pattern can be understood
              and, once redacted and approved, help warn other people about the same method.
            </p>
            <ul className="mt-4 grid gap-2 text-body text-ink-muted">
              <li>Never auto-published, and never linked back to you.</li>
              <li>No names, numbers or accounts are needed — only the pattern helps.</li>
              <li>
                If you would rather your story be public later, use{" "}
                <Link href="/share" className="font-semibold text-purple-700 hover:underline">
                  Share your story
                </Link>{" "}
                instead.
              </li>
            </ul>
            <Link href="/tea" className={cn(buttonClass("ghost", "md"), "mt-5")}>
              Or read what happened to other people
            </Link>
          </Card>

          <ReportForm mode="report" />
        </div>
      </section>
    </>
  );
}
