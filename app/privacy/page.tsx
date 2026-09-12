import type { Metadata } from "next";
import Link from "next/link";
import { Card, PrototypeDataTag, Sticker } from "@/components/ui";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What Kena Scam collects, what it never collects, and how submitted stories are handled.",
};

const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "Nothing about you personally. There are no accounts, no tracking cookies, and no analytics on this site.",
      "Reactions, saves and the awareness-game score live in your own browser and are never sent anywhere.",
      "Two small preferences are stored locally: whether you dismissed the first-visit chooser (this browser session only) and whether you turned off surprise scenarios.",
    ],
  },
  {
    title: "What happens to a story you submit",
    body: [
      "A community story is posted to the feed straight away, anonymously by default, and labelled as an unreviewed community post. A private report from the I kena already page is never published at all.",
      "Community posts are reviewed after the fact and can be taken down. Stories we collect and publish ourselves are redacted first: names, handles, phone numbers, account numbers, addresses, IC numbers and any accusation about an identifiable person or business are removed.",
      "Images you attach to a community story are shown publicly on your post. Please blur IC numbers, banking details, addresses, passwords, OTPs and private chats before attaching anything.",
      "Anonymous posting is on by default, and it is the safer choice. You can request removal of your own post at any time.",
    ],
  },
  {
    title: "Public posts and permission",
    body: [
      "Public posts can help us spot scam patterns, but we do not automatically repost them. Stories are published only when submitted directly, shared with permission, or rewritten as anonymous, redacted pattern insights.",
      "A creator name, handle or link is shown only for a story that was submitted by its author or shared with their permission, and only in the form they chose.",
      "When consent is withdrawn, public attribution and source media are removed from every surface at once.",
    ],
  },
  {
    title: "AI features",
    body: [
      "Search understanding, tag suggestion, the assistant, the weekly digest and the voice-note audio can use a model, server-side only. The API key is never exposed to the browser.",
      "The assistant answers only from approved story and trend records and shows which ones it used. It does not verify people, businesses, accounts or links.",
      "Voice audio is generated from fixed scenario text using a built-in synthetic voice. No voice is ever cloned, and no real person is imitated.",
      "Every one of these features has a complete local fallback, so the site works fully even when the model is unavailable.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-hero-glow">
        <div className="shell py-10">
          <Sticker tone="white">Privacy</Sticker>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            The short version: we do not want your data.
          </h1>
          <p className="mt-3 max-w-2xl text-lede text-ink-muted">
            Kena Scam is about patterns, not people. The less we hold about you, the less there is
            to lose.
          </p>
        </div>
      </section>

      <section className="shell pb-14 pt-2">
        <div className="grid gap-4">
          {SECTIONS.map((section) => (
            <Card key={section.title} className="p-6 sm:p-8">
              <h2 className="font-display text-h2">{section.title}</h2>
              <div className="mt-3 grid gap-2.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="max-w-3xl text-body text-ink-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </Card>
          ))}

          <Card className="border-2 border-ink bg-cream-deep p-6 shadow-stamp sm:p-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <PrototypeDataTag />
              <span className="text-eyebrow uppercase text-ink-muted">In short</span>
            </div>
            <p className="mt-3 max-w-4xl text-body text-ink">
              We hold as little about you as we can. No accounts are required to read, no tracking,
              no analytics, and the only things stored in your browser are a dismissed pop-up and
              your simulation preference.
            </p>
            <p className="mt-3 text-body text-ink-muted">
              Questions, corrections or removal requests:{" "}
              <Link href="/contact" className="font-semibold text-purple-700 hover:underline">
                contact us
              </Link>
              .
            </p>
          </Card>
        </div>
      </section>
    </>
  );
}
