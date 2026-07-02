/** Path to the Blender export (static scene + one animated camera). */
export const MODEL_URL = "/models/scene.glb";

/** Blender render aspect ratio — confirmed 1920×1080. */
export const BLENDER_ASPECT = 16 / 9;

/**
 * Render the GLB unlit (bake workflow): convert materials to MeshBasicMaterial
 * so the baked Cycles lighting shows exactly as exported, with no relighting
 * and no tone mapping (see Scene → makeUnlit). FALSE = live PBR + sky lights.
 */
export const UNLIT_BAKED = true;

/**
 * DOM ids shared between the page layout (which renders the elements) and the
 * 3D components (which measure them by id, decoupled from the React tree).
 */
export const SCROLL_SPAN_ID = "scene-scroll-span"; // Hero → Concept → Spill: drives the scrub
export const FADE_ID = "scene-fade"; // the Spill placeholder: drives the fade-out

/**
 * How far through the placeholder section the camera animation finishes
 * (0–1). 0.5 = the scrub completes halfway down the placeholder; lower = ends
 * sooner, 1 = ends at the very bottom of the placeholder.
 */
export const SCRUB_END_FRACTION = 0.3;

/**
 * Reshapes how scroll maps onto the animation timeline (applied as
 * `time = pow(scroll, SCRUB_CURVE) * duration`).
 *
 *   = 1   linear — keyframe timing matches your Blender spacing (default).
 *   < 1   front-loaded — early keyframes appear earlier, end slows down
 *         (e.g. 0.7 to pull the opening keyframes in a bit sooner).
 *   > 1   back-loaded — early keyframes held longer, end speeds up.
 *
 * For pinning *specific* keyframes to specific scroll points, use the
 * piecewise (Plan B) mapping noted in scene.tsx instead.
 */
export const SCRUB_CURVE = 1;

/**
 * Screen-space pan of the rendered scene, keyed to the scrub progress (0–1 — the
 * same value that drives the camera timeline). Each stop shifts the house
 * *within the frame* without changing the baked camera angle:
 *
 *   x > 0 → house moves right,  y > 0 → house moves down (fractions of viewport).
 *
 * Values interpolate linearly between stops, so the house *drifts* as you
 * scroll; stops must be in ascending `at` order and the ends clamp. Because the
 * camera fits with `cover`, panning toward the cropped (overflowing) axis
 * reveals more of the scene there — panning *down* on a wide desktop viewport
 * uncovers more roof. Panning along the non-cropped axis can expose the blank
 * background at the far edge, so keep that component modest.
 *
 * This is a 2D reframing, not a new viewpoint — the angle itself is baked in the
 * GLB (the 3D artist's domain). Set to a single `{ at: 0, x: 0, y: 0 }` stop to
 * disable.
 */
export const SCREEN_PAN: { at: number; x: number; y: number }[] = [
  { at: 0, x: 0, y: 0 }, // hero: keep the exported framing untouched
  { at: 0.55, x: 0.12, y: 0.12 }, // this keyframe: drift down-right, revealing the roof
  { at: 1, x: 0.12, y: 0.12 }, // hold the reframing through the rest of the scrub
];
