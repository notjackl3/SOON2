"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

/**
 * Owns the page scroll: Lenis inertial smoothing gives continuous free
 * scrolling the whole way down, which the 3D camera scrub follows directly.
 * Renders nothing.
 */
export default function ScrollController() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // `lerp` is the "weight" dial: how fast the smoothed scroll chases raw
    // input. Lenis defaults to 0.1 (floaty/heavy); higher tracks input more 1:1
    // and feels lighter/snappier. `wheelMultiplier` scales distance per notch —
    // raise if scrolling feels slow to cover ground.
    const lenis = new Lenis({ lerp: 0.25, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return null;
}
