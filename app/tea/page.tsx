import { Suspense } from "react";
import type { Metadata } from "next";
import { TeaClient } from "@/components/tea/tea-client";
import { REFERENCE_DATE, getStoryViews, getTrends } from "@/lib/repo";

export const metadata: Metadata = {
  title: "Scam Tea",
  description:
    "Every curated demo scam story in one feed, across six platforms and four languages. Search by scam type, tactic, platform, language or state.",
};

export default async function TeaPage() {
  const [stories, trends] = await Promise.all([getStoryViews(), getTrends()]);

  return (
    // useSearchParams needs a Suspense boundary for the static shell.
    <Suspense
      fallback={<div className="shell py-20 text-body text-ink-muted">Pouring the tea…</div>}
    >
      <TeaClient stories={stories} trends={trends} referenceTime={REFERENCE_DATE.getTime()} />
    </Suspense>
  );
}
