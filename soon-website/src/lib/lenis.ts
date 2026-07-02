import type Lenis from "lenis";

/**
 * Shared handle to the single Lenis instance owned by ScrollController, so
 * in-page navigation (e.g. "Partner with us" → contact form) scrolls with the
 * same inertial smoothing as the rest of the page instead of a native jump.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

/** Smooth-scroll to the element with the given id. Falls back to native smooth
 *  scroll if Lenis isn't mounted yet. `offset` nudges the final stop (negative
 *  = leave a gap above the target). */
export function scrollToId(id: string, offset = -24) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) {
    instance.scrollTo(el, { offset });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
