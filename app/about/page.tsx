import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Handshake, HeartHandshake, Mail, ShieldCheck } from "lucide-react";
import { Card, PrototypeDataTag, ScriptNote, Sticker, buttonClass, cn } from "@/components/ui";
import { Mascot } from "@/components/ui/mascot";

export const metadata: Metadata = {
  title: "About",
  description:
    "What Kena Scam is, where its stories come from, and what it deliberately does not do.",
};

const NOT_DOING = [
  "We do not scrape social platforms, and we have no access to anyone's private messages.",
  "We do not verify a person, business, bank account, phone number, link or app. Nothing here is a checker.",
  "We never say something is definitely a scam. We describe patterns, red flags and safer next steps.",
  "We do not name or accuse anyone. Stories are about methods, not people.",
  "We do not verify community posts before they appear. They are labelled as unreviewed, checked afterwards, and taken down when they should be.",
];

export default function AboutPage() {
  return (
    <>
      <section className="relative bg-hero-glow">
        <div className="shell py-10">
          <Sticker tone="lime">About</Sticker>
          <h1 className="mt-4 max-w-3xl font-display text-display">
            Scams do not stay inside one platform, language, or generation.{" "}
            <span className="text-purple-600">Neither should scam awareness.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lede text-ink-muted">
            Scam stories are scattered across Facebook, TikTok, Reddit, WhatsApp, Telegram and
            Instagram, and split again by language. A Facebook uncle, a TikTok aunty, a Reddit poster
            and a WhatsApp group can all be describing the same scam without any of them knowing.
            Kena Scam puts those tellings side by side.
          </p>
          <ScriptNote className="mt-4">one scam, many stories. that is the whole idea.</ScriptNote>
          <Mascot
            pose="community-toast"
            size="md"
            className="pointer-events-none absolute right-6 top-10 hidden xl:block"
          />
        </div>
      </section>

      {/* -------------------------------------------------------- provenance */}
      <section id="provenance" className="shell scroll-mt-20 py-8">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-[1.2fr_1fr]">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <Mascot pose="resource-search" size="sm" className="shrink-0" />
              <h2 className="font-display text-h2">Where stories come from</h2>
            </div>
            <p className="mt-3 text-lede font-semibold text-ink">
              Public posts can help us spot scam patterns, but we do not automatically repost them.
              Stories are published only when submitted directly, shared with permission, or
              rewritten as anonymous, redacted pattern insights.
            </p>
            <p className="mt-3.5 text-body text-ink-muted">
              Every story carries a source record, and the Source card on each story page shows which
              of those it is. A creator name, handle or link appears only when someone submitted
              their own story or consented to it being shared, and only in the form they chose. A
              pattern noticed in public discussion is never republished, never credited, and never
              shown with a handle, screenshot or post text — only the pattern itself, written in our
              own words.
            </p>
            <p className="mt-3.5 text-body text-ink-muted">
              If a creator withdraws consent, attribution and source media disappear from every
              surface at once. Every published story carries a{" "}
              <span className="font-semibold text-ink">Request correction or removal</span> action.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link href="/tea" className={buttonClass("dark", "md")}>
                See the Source cards
              </Link>
              <Link href="/moderation" className={buttonClass("ghost", "md")}>
                See the moderation workflow
              </Link>
            </div>
          </Card>

          <Card className="p-6 sm:p-8">
            <h2 className="flex items-center gap-2 font-display text-h2">
              <ShieldCheck className="h-5 w-5 text-safe" strokeWidth={2.3} aria-hidden="true" />
              What Kena Scam does not do
            </h2>
            <ul className="mt-3.5 grid gap-2.5">
              {NOT_DOING.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-body text-ink-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-hot" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------------------ notice */}
      <section className="shell pb-8">
        <Card className="border-2 border-ink bg-cream-deep p-6 shadow-stamp sm:p-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <PrototypeDataTag />
            <span className="text-eyebrow uppercase text-ink-muted">About the numbers</span>
          </div>
          <p className="mt-3 max-w-4xl text-lede text-ink">
            Kena Scam combines consented community reports, creator-submitted stories and published
            advisories. Every story is redacted before publication.
          </p>
          <p className="mt-3 max-w-4xl text-body text-ink-muted">
            The figures on Scam Radar and Malaysia Scam Pulse are computed from the same records
            that power the feed, so the numbers and the stories can never drift apart. They are
            counts of what people reported to us, not official incident statistics. Kena Scam is
            independent and is not affiliated with, endorsed by, or operated by any government
            agency, bank, telco or social platform.
          </p>
        </Card>
      </section>

      {/* -------------------------------------------- events / donate / partner */}
      <section className="shell pb-14">
        <div className="grid gap-4 [&>*]:min-w-0 lg:grid-cols-3">
          <Card id="events" className="scroll-mt-20 p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-ink bg-lime shadow-stamp">
              <CalendarDays className="h-5 w-5 text-ink" strokeWidth={2.3} />
            </span>
            <h2 className="mt-4 font-display text-h2">Events</h2>
            <p className="mt-2 text-body text-ink-muted">
              Community sessions at pasar malam, campus talks, and workshops for family group-chat
              admins — the people who forward warnings to everyone else.
            </p>
            <p className="mt-3 text-micro text-ink-muted">
              Nothing scheduled right now — upcoming dates appear here.
            </p>
          </Card>

          <Card id="donate" className="scroll-mt-20 p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-ink bg-hot shadow-stamp">
              <HeartHandshake className="h-5 w-5 text-white" strokeWidth={2.3} />
            </span>
            <h2 className="mt-4 font-display text-h2">Donate / Support us</h2>
            <p className="mt-2 text-body text-ink-muted">
              Moderation is the expensive part: redacting submissions, confirming permission, and
              translating every story into four languages takes people, not models.
            </p>
            <p className="mt-3 text-micro text-ink-muted">
              Donations are not open yet. This is where that will live.
            </p>
          </Card>

          <Card id="partner" className="scroll-mt-20 p-6">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-ink bg-white shadow-stamp">
              <Handshake className="h-5 w-5 text-ink" strokeWidth={2.3} />
            </span>
            <h2 className="mt-4 font-display text-h2">Partner with us</h2>
            <p className="mt-2 text-body text-ink-muted">
              For platforms, banks, telcos, NGOs and newsrooms: shared taxonomy, approved data
              exchange, and one place for the public to read what is actually going around.
            </p>
            <p className="mt-3 text-micro text-ink-muted">
              No partnerships exist yet. Nothing on this site implies one.
            </p>
          </Card>
        </div>

        <Card className="mt-4 p-6">
          <h2 className="flex items-center gap-2 font-display text-h2">
            <Mail className="h-5 w-5 text-purple-600" strokeWidth={2.3} aria-hidden="true" />
            Get in touch
          </h2>
          <p className="mt-2 max-w-2xl text-body text-ink-muted">
            Corrections, removal requests, partnership questions and press enquiries all go through
            the contact page.
          </p>
          <Link href="/contact" className={cn(buttonClass("dark", "md"), "mt-4")}>
            Contact Kena Scam
          </Link>
        </Card>
      </section>
    </>
  );
}
