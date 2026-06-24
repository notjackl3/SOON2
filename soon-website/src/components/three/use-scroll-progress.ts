import { useEffect, useRef, type RefObject } from "react";

/**
 * Tracks scroll progress across a range as a 0→1 value, written to a ref (no
 * React re-render per scroll frame — the value is read inside the r3f
 * `useFrame` loop, which lives in a different component tree, so we decouple via
 * the DOM by element id).
 *
 * The range starts at the top of `spanId` (progress 0 when its top reaches the
 * top of the viewport) and ends `endFraction` of the way *through* `endId`'s own
 * scroll (progress 1). With the defaults (`endId === spanId`, `endFraction = 1`)
 * this is simply "scrolled all the way through `spanId`".
 *
 * Example: end the scrub halfway down the placeholder section →
 *   useScrollProgress(SPAN, { endId: FADE, endFraction: 0.5 })
 *
 * Updates on scroll and resize. Works with native scroll and Lenis (Lenis
 * drives `window.scrollY`, so `getBoundingClientRect()` stays accurate).
 */
export interface ScrollRangeOptions {
  /** Element whose scroll-through defines where progress reaches 1. Defaults to `spanId`. */
  endId?: string;
  /** Fraction (0–1) through the end element at which progress reaches 1. Default 1. */
  endFraction?: number;
}

export function useScrollProgress(
  spanId: string,
  options: ScrollRangeOptions = {},
): RefObject<number> {
  const { endId = spanId, endFraction = 1 } = options;
  const progress = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const span = document.getElementById(spanId);
      const end = document.getElementById(endId);
      if (!span || !end) return;

      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const spanStart = span.getBoundingClientRect().top + scrollY; // absolute top
      const endTop = end.getBoundingClientRect().top + scrollY;
      const endScrollable = Math.max(0, end.offsetHeight - vh);
      const endScroll = endTop + endFraction * endScrollable; // scrollY where progress hits 1

      const range = endScroll - spanStart;
      progress.current =
        range > 0
          ? Math.min(1, Math.max(0, (scrollY - spanStart) / range))
          : 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [spanId, endId, endFraction]);

  return progress;
}
