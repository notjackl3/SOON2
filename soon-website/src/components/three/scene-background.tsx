"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import { FADE_ID } from "./constants";

// Client-only: the canvas touches WebGL/browser APIs. `ssr: false` is allowed
// here because this module is itself a Client Component.
const SceneCanvas = dynamic(() => import("./scene-canvas"), { ssr: false });

/**
 * Fixed, full-screen canvas pinned *behind* all page content
 * (`-z-10`, `pointer-events-none`). Fades out as the user scrolls through the
 * Spill placeholder section so the 3D is gone before the Footer.
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
        const distance = fadeEl.offsetHeight - window.innerHeight;
        // 0 while the placeholder's top is below the viewport top, ramping to 1
        // as we scroll through it.
        const p =
          distance > 0
            ? Math.min(1, Math.max(0, -rect.top / distance))
            : rect.top <= 0
              ? 1
              : 0;
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
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <SceneCanvas />
    </div>
  );
}
