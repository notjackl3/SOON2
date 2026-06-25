"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import { FADE_ID } from "./constants";

// Client-only: the canvas touches WebGL/browser APIs. `ssr: false` is allowed
// here because this module is itself a Client Component.
const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });

/**
 * Fixed, full-screen canvas pinned *behind* all page content
 * (`-z-10`, `pointer-events-none`). A solid white layer stays put while only the
 * 3D canvas fades out across the Spill placeholder — so the section resolves to
 * white (not the page background behind it) before the Footer.
 */
export default function SceneBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const fadeEl = document.getElementById(FADE_ID);
      let opacity = 1;
      if (fadeEl) {
        const rect = fadeEl.getBoundingClientRect();
        // Fully visible while the placeholder is at/above the viewport top,
        // ramping to 0 over one viewport of scrolling past it (i.e. across the
        // glide into the next section).
        const p = Math.min(1, Math.max(0, -rect.top / window.innerHeight));
        opacity = 1 - p;
      }
      el.style.opacity = String(opacity);
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
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 bg-white"
    >
      {/* Only the canvas fades; the white layer above stays solid. */}
      <div ref={ref} className="absolute inset-0">
        <SceneCanvas />
      </div>
    </div>
  );
}
