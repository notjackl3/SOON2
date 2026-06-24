import * as THREE from "three";

/**
 * Keep an imported Blender camera framing the scene "exactly like Blender"
 * across arbitrary viewport aspect ratios.
 *
 * The glTF exporter bakes Blender's lens (focal length + sensor fit + render
 * aspect) into a single fixed *vertical* FOV (`yfov`), which three.js exposes as
 * `PerspectiveCamera.fov`. That frustum is correct only at Blender's render
 * aspect (here 16:9). When the browser viewport has a different aspect, we have
 * to decide how to map that fixed frustum onto the screen:
 *
 *   - "cover"   (default) — fill the viewport, cropping the overflowing axis.
 *                 Matches `background-size: cover`. The framed subject is never
 *                 lost; you just see a bit more/less on one axis.
 *   - "contain" — fit the whole Blender frame on screen, letterboxing the rest.
 *
 * On either axis the FOV we *keep* equals the Blender FOV, so framing is
 * faithful; only the off-axis is derived. When the viewport aspect equals the
 * Blender aspect, the camera is byte-for-byte the Blender camera.
 */
export type FitMode = "cover" | "contain";

export interface FitCameraOptions {
  /** Blender render aspect (width / height), e.g. 1920/1080 = 16/9. */
  blenderAspect: number;
  /** Reference vertical FOV in degrees, captured from the GLB camera at import. */
  refFovDeg: number;
  mode?: FitMode;
}

export function fitCameraToViewport(
  camera: THREE.PerspectiveCamera,
  viewAspect: number,
  { blenderAspect, refFovDeg, mode = "cover" }: FitCameraOptions,
): void {
  const vRef = THREE.MathUtils.degToRad(refFovDeg);
  // Blender's horizontal FOV implied by the vertical FOV at the render aspect.
  const hRef = 2 * Math.atan(Math.tan(vRef / 2) * blenderAspect);

  // Anchor the horizontal axis when the viewport is *wider* than Blender for
  // "cover" (so we crop top/bottom, never the sides), and the opposite for
  // "contain". When anchoring horizontal, derive vertical FOV from hRef.
  const viewportWider = viewAspect >= blenderAspect;
  const anchorHorizontal = mode === "cover" ? viewportWider : !viewportWider;

  const vFov = anchorHorizontal
    ? 2 * Math.atan(Math.tan(hRef / 2) / viewAspect)
    : vRef;

  camera.fov = THREE.MathUtils.radToDeg(vFov);
  camera.aspect = viewAspect;
  camera.updateProjectionMatrix();
}
