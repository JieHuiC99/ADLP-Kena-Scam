import type { Metadata } from "next";
import Link from "next/link";
import { Flag, Handshake, MessageSquare, Newspaper } from "lucide-react";
import { Card, Sticker, buttonClass, cn } from "@/components/ui";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Kena Scam about corrections, removals, partnerships or press.",
};

const ROUTES = [
  {
    icon: Flag,
    title: "Correction or removal",
    body: "Every published story has a Request correction or removal action on its Source card. That is the fastest route, because it comes with the story attached.",
    href: "/tea",
    cta: "Find the story",
  },
  {
    icon: MessageSquare,
    title: "Share a scam story",
    body: "Use the Join the gang form. Anonymous by default, redacted and reviewed before anything could be published.",
    href: "/share",
    cta: "Share your story",
  },
  {
    icon: Handshake,
    title: "Partnerships",
    body: "Platforms, banks, telcos, NGOs and newsrooms. No partnerships exist yet, and nothing on this site implies one.",
    href: "/about#partner",
    cta: "Read about partnering",
  },
  {
    icon: Newspaper,
    title: "Press",
    body: "Kena Scam is independent. Please do not describe its figures as official statistics — they are counts of community reports.",
    href: "/about",
    cta: "Read about the numbers",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="bg-hero-glow">
        <div className="shell py-10">
          <Sticker tone="hot">Contact</Sticker>
          <h1 className="mt-4 max-w-2xl font-display text-display">Talk to us lah.</h1>
          <p className="mt-3 max-w-2xl text-lede text-ink-muted">
            Each route below goes straight to the part of the site that handles it.
          </p>
        </div>
      </section>

      <section className="shell pb-14 pt-2">
        <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2">
          {ROUTES.map((route) => (
            <Card key={route.title} className="flex flex-col p-6">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-chip border-2 border-ink bg-white shadow-stamp">
                <route.icon className="h-5 w-5 text-ink" strokeWidth={2.3} />
              </span>
              <h2 className="mt-4 font-display text-h2">{route.title}</h2>
              <p className="mt-2 text-body text-ink-muted">{route.body}</p>
              <Link href={route.href} className={cn(buttonClass("ghost", "md"), "mt-4 self-start")}>
                {route.cta}
              </Link>
            </Card>
          ))}
        </div>

        <Card className="mt-4 p-6">
          <h2 className="font-display text-h2">If money has already moved</h2>
          <p className="mt-2 max-w-2xl text-body text-ink-muted">
            Do not wait for us. Call your bank on the number printed on your own card first, then
            make an official report. The steps are laid out in order here.
          </p>
          <Link href="/kena" className={cn(buttonClass("dark", "md"), "mt-4")}>
            I kena already
          </Link>
        </Card>
      </section>
    </>
  );
}
