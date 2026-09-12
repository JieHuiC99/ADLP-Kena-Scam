import Link from "next/link";
import { Wordmark } from "./site-nav";

const COLUMNS = [
  {
    title: "The tea",
    links: [
      { href: "/tea", label: "Scam Tea feed" },
      { href: "/trends", label: "One Scam, Many Stories" },
      { href: "/weekly", label: "Kena Weekly" },
      { href: "/game", label: "Kena or Not?" },
    ],
  },
  {
    title: "The numbers",
    links: [
      { href: "/radar", label: "Scam Radar" },
      { href: "/pulse", label: "Malaysia Scam Pulse" },
      { href: "/about#provenance", label: "Where stories come from" },
      { href: "/moderation", label: "Moderation queue (internal)" },
    ],
  },
  {
    title: "Kena Scam",
    links: [
      { href: "/about", label: "About Kena Scam" },
      { href: "/about#events", label: "Events" },
      { href: "/about#donate", label: "Donate / Support us" },
      { href: "/about#partner", label: "Partner with us" },
      { href: "/privacy", label: "Privacy" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="shell grid gap-10 py-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <Wordmark compact />
          <p className="mt-3 max-w-xs text-body text-ink-muted">
            Scams do not stay inside one platform, language, or generation. Neither should scam
            awareness.
          </p>
          <div className="mt-5 grid gap-2">
            <p className="text-eyebrow uppercase text-ink-muted">If money has already moved</p>
            <Link href="/kena" className="text-micro text-ink-muted hover:text-purple-700">
              <span className="font-bold text-ink">I kena already</span> · calm steps, no judgement
            </Link>
            <p className="text-micro text-ink-muted">
              Always confirm official reporting numbers through your bank or an official government
              site.
            </p>
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-eyebrow uppercase text-ink-muted">{column.title}</h2>
            <ul className="mt-3 grid gap-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-body text-ink-muted hover:text-purple-700">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="shell grid gap-3 py-6 text-micro text-ink-muted">
          <p className="max-w-4xl">
            Kena Scam is independent. It is not affiliated with, endorsed by, or operated by any
            government agency, bank, telco or social platform, and it does not collect data from any
            platform. Stories come from people who submitted them, creators who gave permission, and
            published advisories.
          </p>
          <p className="max-w-4xl">
            It explains patterns and red flags — it never verifies a person, business, account or
            link, and it never tells you something is definitely a scam.
          </p>
        </div>
      </div>
    </footer>
  );
}
