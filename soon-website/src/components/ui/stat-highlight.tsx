import { type CSSProperties } from "react";

import {
  PIXEL_SIZE,
  STAT_CLUSTERS,
  type PixelColor,
} from "@/data/stat-clusters";

/**
 * Design number font-size (px). Cluster coordinates are authored in this space,
 * so expressing every feature in `em` makes the whole cluster scale 1:1 with the
 * responsive number (which shares the same design basis) — no JS measuring.
 */
const BASIS = 81.944;
const em = (px: number) => `${px / BASIS}em`;

/**
 * Vertical offset applied to every cluster so it sits lower on the number.
 * Authored in the BASIS px space and expressed in `em` (via NUDGE_Y_EM) so it
 * scales 1:1 with the responsive number — a fixed px nudge would ride too low on
 * the smaller mobile sizes.
 */
const NUDGE_Y = 16;

/**
 * Per-stat horizontal squeeze (around the rect's center): narrows the green rect
 * and pulls the scatter pixels inward, without distorting the square pixels the
 * way a plain scaleX would. 1 = untouched. Use for stats whose designed rect is
 * wider than the number (e.g. "70%" reuses the wide 236px rect).
 */
const COMPRESS_X: Record<string, number> = {
  "70%": 0.78,
  "25%": 0.78, // same width as 70% (reuses its rect)
  "300k": 0.72, // one char narrower than the 5-char "300K+" rect it reuses
};

/**
 * Values without their own Figma-authored cluster reuse an existing one whose
 * number is the same visual width (single digit, or ~3 narrow chars). Keeps the
 * hover highlight working for any stat without re-parsing the design.
 */
const CLUSTER_ALIAS: Record<string, string> = {
  "4": "9", // single digit
  "30+": "5:1", // three narrow chars (shares the 105.93 rect)
  "25%": "70%", // percentage — reuse the wide 236.51 rect
  "300k": "300K+", // renamed value keeps the original 300K cluster
};

const PIXEL_BG: Record<PixelColor, string> = {
  ink: "var(--color-ink)",
  accent: "var(--color-accent)",
  cobalt: "var(--color-cobalt)",
};

/** Deterministic 0..1 from an index — stable across SSR/CSR (no Math.random). */
function jitter(n: number) {
  const s = Math.sin((n + 1) * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * The hover "highlight cluster" that sits *behind* a stat number: an accent-green
 * rectangle that sweeps in from the left (like <Highlight>) plus a scatter of
 * ink/accent/cobalt pixels that flicker in on a staggered delay. Driven purely by
 * the parent card's `group` hover — grows in on enter, retracts on mouse-out.
 * Reduced-motion users get an instant, transition-free toggle.
 *
 * Render it as the first child of a `relative` number wrapper inside a `group`.
 */
export function StatHighlight({ value }: { value: string }) {
  const cluster = STAT_CLUSTERS[value] ?? STAT_CLUSTERS[CLUSTER_ALIAS[value] ?? ""];
  if (!cluster) return null;
  const { w, h, rect, pixels } = cluster;

  // Optional horizontal squeeze around the rect's center (keeps pixels square).
  const s = COMPRESS_X[value] ?? 1;
  const cx = rect.x + rect.w / 2;
  const squeeze = (x: number) => cx + (x - cx) * s;
  const rectW = rect.w * s;
  const rectX = cx - rectW / 2;

  // Center the green rect on the number wrapper (rect widths already match each
  // number's width in the design), then let the pixels fall where they may.
  const dx = cx - w / 2;
  const dy = rect.y + rect.h / 2 - h / 2;

  const container: CSSProperties = {
    width: em(w),
    height: em(h),
    left: "50%",
    top: "50%",
    // NUDGE_Y drops the cluster a touch so the highlight sits behind the number
    // rather than riding high on it.
    transform: `translate(calc(-50% - ${em(dx)}), calc(-50% - ${em(dy)} + ${em(NUDGE_Y)}))`,
  };

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute z-0 block"
      style={container}
    >
      {/* Green highlight — grows from the left on hover, retracts on leave. */}
      <span
        className="absolute origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transition-none"
        style={{
          left: em(rectX),
          top: em(rect.y),
          width: em(rectW),
          height: em(rect.h),
          backgroundColor: "var(--color-accent)",
        }}
      />
      {/* Scatter pixels — flicker in on a per-square stagger. */}
      {pixels.map((p, i) => (
        <span
          key={i}
          className="absolute opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 motion-reduce:transition-none"
          style={{
            left: em(squeeze(p.x)),
            top: em(p.y),
            width: em(PIXEL_SIZE),
            height: em(PIXEL_SIZE),
            backgroundColor: PIXEL_BG[p.c],
            transitionDelay: `${Math.round(80 + jitter(i) * 260)}ms`,
          }}
        />
      ))}
    </span>
  );
}
