import type { Metadata } from "next";
import { ClipboardList, EyeOff, Lock } from "lucide-react";
import { Card, PrototypeDataTag, Sticker } from "@/components/ui";
import { Mascot } from "@/components/ui/mascot";
import { MODERATION_PIPELINE, listQueue, queueCounts } from "@/lib/data/moderation";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Moderation queue",
  // Internal view: never indexed.
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The private moderation view.
 *
 * This exists to make the permission workflow inspectable rather than merely
 * claimed. Nothing here publishes anything: the prototype's "approve" is a
 * human step that does not exist as a button, because an approve button that
 * actually published would contradict the whole model.
 *
 * In production this is behind auth, and the underlying Supabase tables give
 * the public role no read access at all.
 */
export default function ModerationPage() {
  const queue = listQueue();
  const counts = queueCounts();

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-9">
          <div className="flex flex-wrap items-center gap-2.5">
            <Sticker tone="ink">
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                Internal
              </span>
            </Sticker>
            <PrototypeDataTag />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <Mascot pose="site-update" size="sm" className="shrink-0" />
            <h1 className="font-display text-h1">Moderation queue</h1>
          </div>
          <p className="mt-2.5 max-w-2xl text-lede text-ink-muted">
            Internal review view. Everything below is private: private reports and correction
            requests on this page are visible nowhere else on the site.
          </p>

          <div className="mt-5 flex flex-wrap gap-4">
            {[
              { label: "In queue", value: counts.total },
              { label: "Community stories", value: counts.stories },
              { label: "Private reports", value: counts.reports },
              { label: "Correction requests", value: counts.corrections },
            ].map((stat) => (
              <div key={stat.label} className="min-w-0">
                <p className="text-[26px] font-extrabold leading-none tracking-[-0.03em]">
                  {stat.value}
                </p>
                <p className="mt-1 text-micro font-semibold text-ink-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- the pipeline */}
      <section className="shell py-8">
        <h2 className="font-display text-h2">The permission workflow</h2>
        <p className="mt-1.5 max-w-2xl text-body text-ink-muted">
          Every item moves through all six steps before it could be published. There is no path that
          skips them.
        </p>
        <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {MODERATION_PIPELINE.map((step, index) => (
            <li key={step.step}>
              <Card className="h-full p-5">
                <p className="text-eyebrow uppercase text-purple-900">Step {index + 1}</p>
                <h3 className="mt-2 text-h3">{step.label}</h3>
                <p className="mt-1.5 text-body text-ink-muted">{step.detail}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------------------------------------------------- the queue */}
      <section className="shell pb-14">
        <h2 className="flex items-center gap-2 font-display text-h2">
          <ClipboardList className="h-5 w-5 text-purple-600" strokeWidth={2.3} aria-hidden="true" />
          Pending items
        </h2>
        <div className="mt-4 grid gap-3">
          {queue.map(({ submission, item }) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-h3">{submission.title}</h3>
                  <p className="mt-1 text-micro text-ink-muted">
                    {submission.kind.replace("_", " ")} · submitted{" "}
                    {formatDate(submission.submittedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-1.5">
                  <span className="rounded-pill bg-caution-soft px-2.5 py-1 text-[11px] font-extrabold text-caution-deep">
                    {submission.status}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-pill bg-ink/5 px-2.5 py-1 text-[11px] font-extrabold text-ink-muted">
                    <EyeOff className="h-3 w-3" strokeWidth={2.6} aria-hidden="true" />
                    not public
                  </span>
                </div>
              </div>

              <p className="mt-3 text-body text-ink-muted">{submission.body}</p>

              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-micro text-ink-muted">
                <div>
                  <dt className="inline font-bold text-ink">Current step: </dt>
                  <dd className="inline">{item.step.replace(/_/g, " ")}</dd>
                </div>
                <div>
                  <dt className="inline font-bold text-ink">Tag status: </dt>
                  <dd className="inline">{submission.tagStatus}</dd>
                </div>
                <div>
                  <dt className="inline font-bold text-ink">Anonymous: </dt>
                  <dd className="inline">{submission.anonymous ? "yes" : "no"}</dd>
                </div>
                <div>
                  <dt className="inline font-bold text-ink">Attachment: </dt>
                  <dd className="inline">{submission.hasAttachment ? "yes — needs redaction" : "none"}</dd>
                </div>
              </dl>

              <p className="mt-3 border-t border-line-soft pt-3 text-micro text-ink-muted">
                {item.note}
              </p>
            </Card>
          ))}
        </div>

        <p className="mt-6 max-w-3xl text-micro text-ink-muted">
          Community stories post to the feed immediately and appear here for after-the-fact
          review. Private reports and correction requests never leave this queue. Row-level security
          gives the public role no read access to either, and a take-down is a human action recorded
          against a named moderator.
        </p>
      </section>
    </>
  );
}
