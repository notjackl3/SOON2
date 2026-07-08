/**
 * A viewport height that stays put while iOS Safari's URL bar animates.
 *
 * Every time Safari's toolbar shows or hides, `window.innerHeight` (and the
 * `dvh` unit) changes. Layout and scroll math keyed to the live value jitter as
 * the user scrolls — most visibly at the 3D → carousel boundary, where nudging
 * up and down repeatedly toggles the bar and makes the sections (and the fading
 * 3D canvas) jump back and forth.
 *
 * We lock the height and only refresh it on a *width* change — a rotation or a
 * real window resize — treating a height-only change as the toolbar and
 * ignoring it. Layout sizes off `100svh` (the toolbar-shown height, itself a
 * static length), so the locked value matches the CSS box.
 */

let height = 0;
let width = 0;
let initialized = false;

function sync() {
  height = window.innerHeight;
  width = window.innerWidth;
}

function onResize() {
  // Width change = rotation / genuine resize → adopt the new height.
  // Height-only change = the URL bar toggling → keep the locked value.
  if (window.innerWidth !== width) sync();
}

/** Begin tracking. Idempotent; safe to call from any client mount. */
export function initStableViewport() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  sync();
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);
}

/** Viewport height in px, held steady against the iOS URL-bar wobble. */
export function getStableViewportHeight(): number {
  if (typeof window === "undefined") return 0;
  if (!height) sync();
  return height;
}
