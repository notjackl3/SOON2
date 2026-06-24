/** Path to the Blender export (static scene + one animated camera). */
export const MODEL_URL = "/models/scene.glb";

/** Blender render aspect ratio — confirmed 1920×1080. */
export const BLENDER_ASPECT = 16 / 9;

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
export const SCRUB_END_FRACTION = 0.5;
