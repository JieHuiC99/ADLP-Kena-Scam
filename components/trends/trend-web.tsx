import { LANG_LABEL } from "@/lib/data/types";
import type { Story } from "@/lib/data/types";

/**
 * The connection web.
 *
 * Draws every story in a trend as a node on a ring, each labelled with its
 * platform and language, all wired into one centre. This is the argument the
 * whole product is making, rendered as a picture: four separate posts that
 * nobody connected are in fact one scam.
 *
 * It is a decorative diagram of information already listed as text beneath it,
 * so it is hidden from assistive technology rather than duplicating the list.
 */

const PLATFORM_FILL: Record<string, string> = {
  whatsapp: "#167C64",
  telegram: "#3B6FDC",
  facebook: "#6D4AFF",
  tiktok: "#0F1729",
  instagram: "#FF2E88",
  reddit: "#FF7A2F",
};

export function TrendWeb({ stories, title }: { stories: Story[]; title: string }) {
  const count = stories.length;
  if (!count) return null;

  const width = 640;
  const height = 300;
  const cx = width / 2;
  const cy = height / 2;
  const rx = 232;
  const ry = 104;

  const nodes = stories.map((story, index) => {
    // Start at the top and go clockwise, so the ring reads in story order.
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    return {
      story,
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry,
    };
  });

  return (
    <div className="scroll-x px-5 pb-5">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full min-w-[560px]"
        role="img"
        aria-label={`${count} stories from different platforms and languages, all describing ${title}`}
      >
        <defs>
          <radialGradient id="trend-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#C9BDFF" />
            <stop offset="100%" stopColor="#6D4AFF" />
          </radialGradient>
        </defs>

        {/* Spokes first, so nodes sit on top of them. */}
        {nodes.map(({ story, x, y }) => (
          <line
            key={`line-${story.id}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#C9BDFF"
            strokeWidth={1.6}
            strokeDasharray="4 4"
          />
        ))}

        <circle cx={cx} cy={cy} r={46} fill="url(#trend-core)" />
        <circle cx={cx} cy={cy} r={46} fill="none" stroke="#0F1729" strokeWidth={2} />
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-white"
          style={{ fontSize: 12, fontWeight: 800 }}
        >
          ONE
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          className="fill-white"
          style={{ fontSize: 12, fontWeight: 800 }}
        >
          SCAM
        </text>

        {nodes.map(({ story, x, y }) => {
          const anchor = x < cx - 30 ? "end" : x > cx + 30 ? "start" : "middle";
          const dx = anchor === "end" ? -16 : anchor === "start" ? 16 : 0;
          const dy = anchor === "middle" ? (y < cy ? -18 : 26) : 0;
          return (
            <g key={story.id}>
              <circle
                cx={x}
                cy={y}
                r={11}
                fill={PLATFORM_FILL[story.platform] ?? "#6D4AFF"}
                stroke="#fff"
                strokeWidth={2.5}
              />
              <text
                x={x + dx}
                y={y + dy + 1}
                textAnchor={anchor}
                className="fill-ink"
                style={{ fontSize: 11, fontWeight: 700 }}
              >
                {story.platform}
              </text>
              <text
                x={x + dx}
                y={y + dy + 14}
                textAnchor={anchor}
                className="fill-ink-muted"
                style={{ fontSize: 10 }}
              >
                {LANG_LABEL[story.originalLanguage]} · {story.state}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
