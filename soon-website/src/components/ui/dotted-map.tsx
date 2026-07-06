"use client";

import { type CSSProperties, useEffect, useRef } from "react";

import { MAP_DOTS, MAP_W, MAP_H, DOT_R } from "@/data/map-dots";
import { prefersReducedMotion } from "@/lib/visibility";

/** Deterministic 0..1 from an index — stable, no Math.random. */
function jitter(n: number) {
  const s = Math.sin((n + 1) * 12.9898) * 43758.5453;
  return s - Math.floor(s);
}

const INK = "#1f1f1f";
const FADE_MS = 420; // per-dot fade duration
const SPREAD_MS = 1200; // window over which dot start-times are scattered

// Fade the map out toward the bottom (the South-America tail).
const BOTTOM_FADE = "linear-gradient(to bottom, #000 80%, transparent 100%)";

/**
 * The dotted map of the Americas, drawn on a single <canvas> (1,899 dots — far
 * cheaper than 1,899 DOM nodes). When `active` flips true the dots "twinkle" in:
 * each fades from 0→1 at a deterministic random offset within SPREAD_MS. One-shot
 * rAF that self-stops. Reduced-motion paints every dot immediately.
 *
 * - `viewH` crops the canvas to that height (map-local px) so only the top of the
 *   map (North America + a little South America) shows; defaults to the full map.
 * - `fadeBottom` masks the bottom edge so the crop falls off softly.
 *
 * Fills its parent; the parent should be sized MAP_W × viewH.
 */
export function DottedMap({
  active,
  viewH = MAP_H,
  fadeBottom = false,
}: {
  active: boolean;
  viewH?: number;
  fadeBottom?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(MAP_W * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.scale(dpr, dpr);

    const paint = (alphaOf: (i: number) => number) => {
      ctx.clearRect(0, 0, MAP_W, viewH);
      ctx.fillStyle = INK;
      for (let i = 0; i < MAP_DOTS.length; i++) {
        const [x, y] = MAP_DOTS[i];
        if (y - DOT_R > viewH) continue; // below the crop — skip
        const a = alphaOf(i);
        if (a <= 0) continue;
        ctx.globalAlpha = a;
        ctx.beginPath();
        ctx.arc(x, y, DOT_R, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    // Before activation: blank. (Static render happens once active.)
    if (!active) {
      ctx.clearRect(0, 0, MAP_W, viewH);
      return;
    }
    if (startedRef.current) {
      paint(() => 1);
      return;
    }
    startedRef.current = true;

    if (prefersReducedMotion()) {
      paint(() => 1);
      return;
    }

    let raf = 0;
    let t0 = 0;
    const total = SPREAD_MS + FADE_MS;
    const tick = (t: number) => {
      if (!t0) t0 = t;
      const elapsed = t - t0;
      paint((i) => {
        const delay = jitter(i) * SPREAD_MS;
        return Math.max(0, Math.min(1, (elapsed - delay) / FADE_MS));
      });
      if (elapsed < total) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, viewH]);

  const style: CSSProperties | undefined = fadeBottom
    ? { maskImage: BOTTOM_FADE, WebkitMaskImage: BOTTOM_FADE }
    : undefined;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="absolute inset-0 h-full w-full"
      style={style}
    />
  );
}
