import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";

import { SNAP_DURATION, SNAP_SECTION_ATTR, SNAP_THRESHOLD } from "./constants";

const SELECTOR = `[${SNAP_SECTION_ATTR}]`;
const EPS = 8; // px tolerance for "at the section edge"
const IDLE_RELEASE_MS = 200; // relax the resistance if the gesture pauses below threshold

type State = "free" | "locked" | "animating";

/**
 * Full-takeover slideshow snapping between elements marked with
 * `data-snap-section`, in DOM order.
 *
 * - Inside a section taller than the viewport you scroll freely (Lenis handles
 *   it). At the section's top/bottom edge, further scroll is *resisted*
 *   (Lenis is paused) and accumulated; once it passes SNAP_THRESHOLD it
 *   auto-glides to the adjacent section, top-aligned. A gesture that pauses
 *   below the threshold springs back to free scrolling.
 * - During the glide all input is swallowed. Because the glide moves
 *   `window.scrollY`, the 3D camera scrub follows and animates through it.
 *
 * Disabled under `prefers-reduced-motion` (normal scrolling remains).
 */
export function useSlideSnap(lenisRef: RefObject<Lenis | null>) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let state: State = "free";
    let lockDir = 0;
    let accum = 0;
    let touchY = 0;
    let releaseTimer: number | undefined;

    const sections = () =>
      Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const absTop = (el: HTMLElement) =>
      el.getBoundingClientRect().top + window.scrollY;
    const absBottom = (el: HTMLElement) => absTop(el) + el.offsetHeight;

    // The section whose top is at or above the viewport top.
    const currentIndex = (list: HTMLElement[]) => {
      const y = window.scrollY;
      let idx = 0;
      for (let i = 0; i < list.length; i++) {
        if (absTop(list[i]) <= y + EPS) idx = i;
      }
      return idx;
    };

    const release = () => {
      if (state !== "locked") return;
      state = "free";
      accum = 0;
      lenisRef.current?.start();
    };

    const snapTo = (list: HTMLElement[], i: number) => {
      const lenis = lenisRef.current;
      const target = list[i];
      if (!lenis || !target) {
        release();
        return;
      }
      state = "animating";
      accum = 0;
      // Per-transition speed: a destination section can override the glide time
      // via `data-snap-duration="<seconds>"` (e.g. a longer angle-to-angle fly).
      const override = Number(target.dataset.snapDuration);
      const duration = override > 0 ? override : SNAP_DURATION;
      lenis.scrollTo(absTop(target), {
        duration,
        lock: true,
        force: true,
        easing: (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic
        onComplete: () => {
          state = "free";
          lenis.start();
        },
      });
    };

    // Returns true if the gesture was consumed (caller should preventDefault).
    const handle = (dir: number, magnitude: number): boolean => {
      const list = sections();
      if (list.length < 2) return false;
      if (state === "animating") return true; // swallow input mid-glide

      if (state === "free") {
        const index = currentIndex(list);
        const el = list[index];
        const atEdge =
          dir > 0
            ? window.scrollY + window.innerHeight >= absBottom(el) - EPS &&
              index < list.length - 1
            : window.scrollY <= absTop(el) + EPS && index > 0;
        if (!atEdge) return false; // free-scroll within the section
        // Enter the sticky-resistance lock at this boundary.
        state = "locked";
        lockDir = dir;
        accum = 0;
        lenisRef.current?.stop();
      }

      // state === "locked"
      if (dir !== lockDir) {
        release();
        return false;
      }
      accum += magnitude;
      if (accum >= SNAP_THRESHOLD) {
        const fresh = sections();
        snapTo(fresh, currentIndex(fresh) + lockDir);
      }
      return true;
    };

    const scheduleRelease = () => {
      window.clearTimeout(releaseTimer);
      releaseTimer = window.setTimeout(release, IDLE_RELEASE_MS);
    };

    const onWheel = (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      if (handle(dir, Math.abs(e.deltaY))) {
        e.preventDefault();
        scheduleRelease();
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? touchY;
      const dy = touchY - y; // positive = scrolling down
      touchY = y;
      const dir = Math.sign(dy);
      if (!dir) return;
      if (handle(dir, Math.abs(dy))) {
        e.preventDefault();
        scheduleRelease();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.clearTimeout(releaseTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      lenisRef.current?.start();
    };
  }, [lenisRef]);
}
