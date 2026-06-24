"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial smooth scrolling. Lenis drives `window.scrollY`, so all the
 * scroll-progress measurements (getBoundingClientRect) stay accurate and the
 * 3D scrub inherits the smoothing for free. Renders nothing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis();
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
