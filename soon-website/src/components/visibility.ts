/**
 * Shared helpers for pausing animation loops that are off-screen or that the
 * user has opted out of via `prefers-reduced-motion`. Keeping this in one place
 * means every canvas effect gates its `requestAnimationFrame` loop the same way.
 */

/** True when the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Call `onChange(visible)` whenever `el` enters or leaves the viewport, so an
 * animation loop can stop scheduling frames while it isn't on screen. A
 * generous `rootMargin` means the loop has resumed a frame before the element
 * actually scrolls into view (no visible pop-in).
 *
 * Returns a cleanup function; call it from the effect teardown.
 */
export function observeVisibility(
  el: Element,
  onChange: (visible: boolean) => void,
  { rootMargin = "200px" }: { rootMargin?: string } = {},
): () => void {
  if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
    // No observer available (SSR / very old browser): assume visible so the
    // effect still runs rather than silently never starting.
    onChange(true);
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) onChange(entry.isIntersecting);
    },
    { rootMargin },
  );
  io.observe(el);
  return () => io.disconnect();
}
