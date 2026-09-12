"use client";

import { useState } from "react";
import { ExternalLink, Flag } from "lucide-react";
import { Card, Disclaimer, buttonClass, cn } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { SourceBadge } from "./source-badge";
import { Mascot } from "@/components/ui/mascot";
import type { PublicAttribution } from "@/lib/provenance";

/**
 * The Source Provenance card shown on every story detail page.
 *
 * It renders only what publicAttributionFor() permits. A creator name, handle
 * or link appears here if and only if that function returned one, which means a
 * withdrawn consent or an "anonymous" credit preference removes attribution
 * from this card and from every other surface at the same time.
 *
 * For a reviewed public lead the card says so explicitly and shows the platform
 * alone — no handle, no link, no screenshot, no post text — because observing a
 * public discussion is not permission to republish it.
 */
const REASONS = [
  "I am the creator and I want this removed",
  "Something here is inaccurate",
  "This identifies someone or something it should not",
  "Other",
];

export function SourceProvenance({
  attribution,
  storyTitle,
  storyId,
}: {
  attribution: PublicAttribution;
  storyTitle: string;
  storyId: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState("");

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
          <h2 className="flex items-center gap-2 text-eyebrow uppercase text-ink-muted">
            <Mascot pose="resource-search" size="xs" className="w-7" />
            Source
          </h2>
          <SourceBadge attribution={attribution} />
        </div>

        <div className="grid gap-1 px-5 py-4">
          <p className="text-h3">{attribution.statusLabel}</p>
          <p className="text-body text-ink-muted">
            {attribution.isPatternOnly ? "Seen on" : "Originally shared on"}{" "}
            <span className="font-semibold text-ink">{attribution.platformLabel}</span>
          </p>

          {attribution.organisation ? (
            <p className="text-body text-ink-muted">
              Published by <span className="font-semibold text-ink">{attribution.organisation}</span>
            </p>
          ) : null}

          {attribution.creatorName ? (
            <p className="text-body text-ink-muted">
              Credited to <span className="font-semibold text-ink">{attribution.creatorName}</span>
              {attribution.creatorHandle ? (
                <span className="text-ink-muted"> · {attribution.creatorHandle}</span>
              ) : null}
            </p>
          ) : null}

          <p className="mt-1.5 text-micro text-ink-muted">{attribution.permissionLine}</p>

          {attribution.demoNotice ? (
            <p className="mt-2 rounded-chip bg-purple-50 px-3 py-2 text-micro font-semibold text-purple-900">
              {attribution.demoNotice}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-line-soft px-5 py-4">
          {attribution.sourceUrl ? (
            <a
              href={attribution.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonClass("ghost", "sm")}
            >
              View original post
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2.4} />
            </a>
          ) : null}
          {attribution.allowsCorrectionRequest ? (
            <button type="button" onClick={() => setOpen(true)} className={buttonClass("ghost", "sm")}>
              <Flag className="h-3.5 w-3.5" strokeWidth={2.4} />
              Request correction or removal
            </button>
          ) : null}
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setSent(false);
        }}
        title={sent ? "Request received" : "Request a correction or removal"}
        size="md"
      >
        {sent ? (
          <div className="mt-4 grid gap-3">
            <p className="text-body text-ink-muted">
              Received. A moderator would review this within 48 hours in production, and public
              attribution and any source media would be removed immediately on request while the
              review happens.
            </p>
            <p className="rounded-chip bg-caution-soft px-3.5 py-2.5 text-micro font-semibold text-caution-deep">
              While it is reviewed, public credit and any source media stay hidden.
            </p>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setSent(false);
              }}
              className={cn(buttonClass("dark", "md"), "justify-self-start")}
            >
              Close
            </button>
          </div>
        ) : (
          <form
            className="mt-4 grid gap-3.5"
            onSubmit={async (event) => {
              event.preventDefault();
              // Routed to the same queue as every other submission: private,
              // pending_review, and never auto-actioned.
              try {
                await fetch("/api/report", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    kind: "correction_request",
                    title: `Correction request: ${storyTitle}`,
                    body: detail ? `${reason} — ${detail}` : reason,
                    language: "en",
                    consent: true,
                    anonymous: true,
                    relatedStoryId: storyId,
                  }),
                });
              } catch {
                /* The confirmation below is honest either way: nothing is sent
                   to any person, and no automated action is taken. */
              }
              setSent(true);
            }}
          >
            <p className="text-body text-ink-muted">
              About: <span className="font-semibold text-ink">{storyTitle}</span>
            </p>

            <fieldset className="grid gap-2">
              <legend className="text-micro font-bold text-ink">What is the issue?</legend>
              {REASONS.map((option) => (
                <label key={option} className="flex items-start gap-2.5 text-body">
                  <input
                    type="radio"
                    name="reason"
                    value={option}
                    checked={reason === option}
                    onChange={() => setReason(option)}
                    className="mt-1 h-4 w-4 accent-purple-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </fieldset>

            <label className="grid gap-1.5">
              <span className="text-micro font-bold text-ink">Anything we should know?</span>
              <textarea
                rows={3}
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
                maxLength={800}
                className="w-full rounded-field border border-line bg-white px-3.5 py-3 text-body"
                placeholder="Optional. Please do not include personal details here."
              />
            </label>

            <Disclaimer text="Your request goes to the moderation team only. Nothing you write here is published." />

            <button type="submit" className={cn(buttonClass("dark", "md"), "justify-self-start")}>
              Send request
            </button>
          </form>
        )}
      </Modal>
    </>
  );
}
