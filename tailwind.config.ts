import type { Config } from "tailwindcss";

/**
 * Kena Scam design tokens.
 *
 * The spine — ink / purple / line / paper, the radii, the shadows and the type
 * scale — is the Team12 (TrustX) system, so anything built for that codebase
 * drops in here unchanged. On top of it sit the Kena accents (cream ground, hot
 * pink, lime, tangerine, navy) which carry the sticker labels, category chips,
 * the awareness game and the editorial moments. Accents are used as BACKGROUNDS
 * behind ink, never as small text on cream, which is what keeps contrast at AA.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0F1729", soft: "#1C2739", muted: "#6B7280" },
        purple: {
          50: "#F5F3FF", 100: "#F1EFFF", 200: "#E4DEFF", 300: "#C9BDFF",
          400: "#9B84FF", 500: "#7651FF", 600: "#6D4AFF", 700: "#5A38E0", 900: "#3A1F9E",
        },
        risk: { DEFAULT: "#DC3B4B", soft: "#FEF0F3", mid: "#F5A3AE", deep: "#B3384D" },
        caution: { DEFAULT: "#D98726", soft: "#FFF4E6", deep: "#A85C08" },
        safe: { DEFAULT: "#167C64", soft: "#E9F7F2", deep: "#0E5A48" },
        info: { DEFAULT: "#3B6FDC", soft: "#EEF2FF" },
        line: { DEFAULT: "#E8E9F0", soft: "#F1F2F7" },
        paper: { DEFAULT: "#FFFFFF", wash: "#FAFAFD", tint: "#F6F5FF" },

        /* --- Kena accents --- */
        cream: { DEFAULT: "#FFFDF6", deep: "#FBF3E4", edge: "#F0E6D2" },
        hot: { DEFAULT: "#FF2E88", soft: "#FFE7F1", deep: "#C4145F" },
        lime: { DEFAULT: "#C6F24E", soft: "#F2FBDC", deep: "#5C7A08" },
        tangerine: { DEFAULT: "#FF7A2F", soft: "#FFF0E6", deep: "#B44A0C" },
        navy: { DEFAULT: "#141A3C", soft: "#E7E9F4" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "ui-serif", "cursive"],
      },
      fontSize: {
        mega: ["clamp(44px,7vw,96px)", { lineHeight: "0.92", letterSpacing: "-0.045em", fontWeight: "800" }],
        display: ["clamp(38px,4.4vw,58px)", { lineHeight: "1.04", letterSpacing: "-0.035em", fontWeight: "800" }],
        h1: ["clamp(32px,3.6vw,46px)", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "800" }],
        h2: ["24px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        h3: ["17px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "700" }],
        eyebrow: ["11px", { lineHeight: "1", letterSpacing: "0.055em", fontWeight: "800" }],
        micro: ["12px", { lineHeight: "1.45" }],
        body: ["14px", { lineHeight: "1.55" }],
        lede: ["17px", { lineHeight: "1.55" }],
      },
      borderRadius: { card: "16px", panel: "20px", field: "12px", chip: "10px", pill: "999px" },
      boxShadow: {
        card: "0 10px 30px rgba(16,23,41,.06)",
        lift: "0 18px 40px rgba(16,23,41,.10)",
        float: "0 24px 50px rgba(88,59,128,.16)",
        inset: "inset 0 0 0 1px #E8E9F0",
        /* The chunky editorial offset used on stickers and the game cards. */
        stamp: "4px 4px 0 0 #0F1729",
        "stamp-lg": "7px 7px 0 0 #0F1729",
      },
      backgroundImage: {
        wash: "linear-gradient(180deg,#FFFDF6 0%,#FBFAFF 46%,#FDF4F8 100%)",
        "hero-glow": "radial-gradient(1100px 480px at 78% 14%, #F1EBFF 0%, rgba(255,253,246,0) 64%)",
        "panel-tint": "linear-gradient(120deg,#F4F1FF 0%,#FBF4F7 100%)",
        "hot-tint": "linear-gradient(120deg,#FFE7F1 0%,#F4F1FF 100%)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(10px)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
        pop: {
          "0%": { transform: "scale(.86)", opacity: "0" },
          "60%": { transform: "scale(1.04)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-7px)" } },
        ticker: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "pulse-ring": {
          "0%": { transform: "scale(.7)", opacity: ".55" },
          "100%": { transform: "scale(2.1)", opacity: "0" },
        },
        wave: { "0%,100%": { transform: "scaleY(.35)" }, "50%": { transform: "scaleY(1)" } },
      },
      animation: {
        "fade-up": "fade-up .4s ease both",
        shimmer: "shimmer 1.4s linear infinite",
        pop: "pop .32s cubic-bezier(.2,.9,.3,1.2) both",
        float: "float 5s ease-in-out infinite",
        ticker: "ticker 32s linear infinite",
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
