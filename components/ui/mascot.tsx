import Image from "next/image";
import { cn } from "./index";

/**
 * The Kena Scam mascot.
 *
 * One component for every placement so sizing, motion and accessibility are
 * decided once. Two rules it enforces rather than leaves to each caller:
 *
 * - A mascot that carries meaning gets real alt text; a decorative one gets
 *   empty alt plus aria-hidden, so a screen reader is not read a list of
 *   purple blobs between the sentences that actually matter.
 * - Animation is CSS-only and every animation used here is already disabled by
 *   the global prefers-reduced-motion rule in globals.css, so nothing bounces
 *   for someone who asked for stillness.
 *
 * Sizes are capped in rem rather than set as fixed pixels, so a hero mascot
 * shrinks on a phone instead of forcing the page sideways.
 */

export type MascotPose =
  | "friendly-intro"
  | "shocked-alert"
  | "help-support"
  | "resource-search"
  | "success-celebration"
  | "presentation"
  | "community-toast"
  | "site-update"
  | "data-review"
  | "centralised-story-collector"
  | "global-language-translator"
  | "weekly-report"
  | "share-your-story"
  | "live-data-analysis"
  | "interactive-scam-simulation"
  | "automated-content-tagging"
  | "save-a-life"
  | "advanced-scam-search";

/** The intrinsic aspect of the source art, so nothing is ever squashed. */
const ASPECT = 1;

const SIZE = {
  xs: "w-10",
  sm: "w-16 sm:w-20",
  md: "w-24 sm:w-32",
  lg: "w-40 sm:w-56 lg:w-[22rem]",
} as const;

/** Rendered width hint for next/image, roughly the largest painted size. */
const PIXELS = { xs: 80, sm: 160, md: 256, lg: 704 } as const;

const MOTION = {
  float: "animate-float",
  pop: "animate-pop",
  wave: "animate-float",
  none: "",
} as const;

export function Mascot({
  pose,
  size = "md",
  alt,
  animate = "none",
  className,
  priority,
}: {
  pose: MascotPose;
  size?: keyof typeof SIZE;
  /**
   * Describe what the mascot is telling the reader. Omit it entirely when the
   * mascot only decorates copy that already says the same thing — the image is
   * then hidden from assistive technology.
   */
  alt?: string;
  animate?: keyof typeof MOTION;
  className?: string;
  priority?: boolean;
}) {
  const decorative = !alt;
  const pixels = PIXELS[size];

  return (
    <Image
      src={`/mascots/${pose}.png`}
      alt={alt ?? ""}
      aria-hidden={decorative || undefined}
      width={pixels}
      height={Math.round(pixels / ASPECT)}
      priority={priority}
      // h-auto keeps the intrinsic ratio whatever width the breakpoint picks,
      // and select-none stops the art being dragged out of the layout.
      className={cn("h-auto max-w-full select-none", SIZE[size], MOTION[animate], className)}
    />
  );
}
