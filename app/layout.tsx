import type { Metadata, Viewport } from "next";
import { Caveat, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { AskKena } from "@/components/chat/ask-kena";
import { SimulationProvider } from "@/components/game/simulation-provider";
import { currentUser } from "@/lib/supabase";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

// The chunky editorial headline face.
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// Handwritten marginalia.
const script = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Kena Scam — one scam, many stories",
    template: "%s · Kena Scam",
  },
  description:
    "Scam stories are scattered across Facebook, TikTok, Reddit, WhatsApp, Telegram and Instagram, in four languages. Kena Scam brings the tea together so you can see the same scam being retold everywhere at once.",
  applicationName: "Kena Scam",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#6D4AFF",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Resolved from the auth cookie on the server, never from localStorage.
  const user = await currentUser();

  return (
    <html lang="en" className={`${sans.variable} ${display.variable} ${script.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded-pill focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SimulationProvider>
          <SiteNav user={user ? { name: user.name } : null} />
          <main id="main">{children}</main>
          <SiteFooter />
          <AskKena />
        </SimulationProvider>
      </body>
    </html>
  );
}
