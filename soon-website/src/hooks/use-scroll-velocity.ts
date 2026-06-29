import { useEffect, useRef, type RefObject } from "react";

/**
 * Tracks page scroll velocity in px/s, written to a ref (read inside a rAF loop,
 * so no React re-render per frame). Smoothed and decays to 0 when scrolling
 * stops. Returns 0 under `prefers-reduced-motion`.
 *
 * Used by the recap marquees to speed up while the page scrolls.
 */
export function useScrollVelocity(): RefObject<number> {
  const velocity = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();

    const tick = (t: number) => {
      const dt = Math.max(1, t - lastT) / 1000; // seconds, guard against 0
      const y = window.scrollY;
      const instant = (y - lastY) / dt; // px/s, signed
      // Ease toward the instant value, then decay toward 0 when idle.
      velocity.current += (instant - velocity.current) * Math.min(1, dt * 12);
      lastY = y;
      lastT = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return velocity;
}
