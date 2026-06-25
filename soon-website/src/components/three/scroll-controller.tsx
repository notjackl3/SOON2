"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

import { useSlideSnap } from "./use-slide-snap";

/**
 * Owns the page scroll: Lenis inertial smoothing for free scrolling within a
 * section, plus the full-takeover slideshow snap between `data-snap-section`
 * elements. Renders nothing.
 */
export default function ScrollController() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis();
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

  useSlideSnap(lenisRef);

  return null;
}
