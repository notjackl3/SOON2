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
  const cluster = STAT_CLUSTERS[value];
  if (!cluster) return null;
  const { w, h, rect, pixels } = cluster;

  // Center the green rect on the number wrapper (rect widths already match each
  // number's width in the design), then let the pixels fall where they may.
  const dx = rect.x + rect.w / 2 - w / 2;
  const dy = rect.y + rect.h / 2 - h / 2;

  const container: CSSProperties = {
    width: em(w),
    height: em(h),
    left: "50%",
    top: "50%",
    transform: `translate(calc(-50% - ${em(dx)}), calc(-50% - ${em(dy)}))`,
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
          left: em(rect.x),
          top: em(rect.y),
          width: em(rect.w),
          height: em(rect.h),
          backgroundColor: "var(--color-accent)",
        }}
      />
      {/* Scatter pixels — flicker in on a per-square stagger. */}
      {pixels.map((p, i) => (
        <span
          key={i}
          className="absolute scale-50 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:scale-100 group-hover:opacity-100 motion-reduce:transition-none"
          style={{
            left: em(p.x),
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
