"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { fitCameraToViewport } from "./fit-camera";
import { useScrollProgress } from "./use-scroll-progress";
import {
  BLENDER_ASPECT,
  FADE_ID,
  MODEL_URL,
  SCREEN_PAN,
  SCROLL_SPAN_ID,
  SCRUB_CURVE,
  SCRUB_END_FRACTION,
  UNLIT_BAKED,
} from "./constants";

/**
 * How quickly the scrub catches up to the scroll position (higher = snappier).
 *
 * Lenis already inertially smooths `window.scrollY`, so this is a *second*
 * smoothing pass — keep it high so the camera tracks the (already-smooth)
 * scroll tightly instead of lagging behind it by a second easing curve.
 * Set very high (or bypass the damp for `smoothed = progress`) for a 1:1 lock.
 */
const SCRUB_DAMP = 30;

/**
 * Replace every material with an unlit MeshBasicMaterial that shows the baked
 * texture (base-color `map`, or `emissiveMap` if baked via an Emission node)
 * exactly as exported — no relighting, no tone mapping. Idempotent.
 */
function makeUnlit(root: THREE.Object3D) {
  if (root.userData.__unlit) return;
  root.userData.__unlit = true;

  const convert = (m: THREE.Material) => {
    const src = m as THREE.MeshStandardMaterial;
    // Baked texture lives in base color OR emissive (Emission-node route).
    const map = src.map ?? src.emissiveMap ?? null;
    if (map) map.colorSpace = THREE.SRGBColorSpace;
    // When a baked map exists, show it unmodulated (white tint). Otherwise keep
    // the material's flat color. This avoids black base-color factors (common
    // with the Emission route) multiplying the texture to black.
    const color = map
      ? new THREE.Color(0xffffff)
      : (src.color?.clone() ?? new THREE.Color(0xffffff));
    const basic = new THREE.MeshBasicMaterial({
      map,
      color,
      transparent: src.transparent,
      opacity: src.opacity,
      alphaMap: src.alphaMap ?? null,
      alphaTest: src.alphaTest,
      side: src.side,
      vertexColors: src.vertexColors,
      depthWrite: src.depthWrite,
    });
    basic.toneMapped = false; // show baked pixels 1:1
    basic.name = src.name;
    src.dispose();
    return basic;
  };

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(convert)
      : convert(mesh.material);
  });
}

/**
 * Interpolate the ordered screen-pan stops at scrub progress `p`. Each segment
 * is eased with smoothstep so the pan velocity is zero at every stop — that
 * removes the "wobble" a linear ramp leaves when it hits a hold (a sudden slope
 * change at the knee). Ends clamp, so the pan holds past the first/last stop.
 */
function samplePan(
  stops: typeof SCREEN_PAN,
  p: number,
): { x: number; y: number } {
  if (p <= stops[0].at) return stops[0];
  const last = stops[stops.length - 1];
  if (p >= last.at) return last;
  for (let i = 1; i < stops.length; i++) {
    const b = stops[i];
    if (p <= b.at) {
      const a = stops[i - 1];
      const t = (p - a.at) / (b.at - a.at);
      const e = t * t * (3 - 2 * t); // smoothstep: ease in and out of each stop
      return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
    }
  }
  return last;
}

/**
 * Loads the Blender GLB, uses its *exported camera* as the render camera, and
 * drives that camera's baked animation purely from scroll position — so
 * scrolling down plays the camera move forward and scrolling up reverses it.
 */
export function Scene() {
  const { scene, cameras, animations } = useGLTF(MODEL_URL);
  const { actions, mixer } = useAnimations(animations, scene);
  const set = useThree((s) => s.set);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  // Scrub runs from the top of the span to halfway through the placeholder, so
  // the camera animation finishes early and then holds while the scene fades.
  const progress = useScrollProgress(SCROLL_SPAN_ID, {
    endId: FADE_ID,
    endFraction: SCRUB_END_FRACTION,
  });
  const smoothed = useRef(0);
  const refFovDeg = useRef(0);
  const fovReady = useRef(false);

  const camera = cameras[0] as THREE.PerspectiveCamera | undefined;
  const duration = animations[0]?.duration ?? 0;

  // Render the baked scene unlit (before first paint) so it never gets relit.
  useLayoutEffect(() => {
    if (UNLIT_BAKED) makeUnlit(scene);
  }, [scene]);

  // Promote the Blender camera to the render camera and capture its *pristine*
  // vertical FOV. This must run in a layout effect — before the first animation
  // frame — because `fitCameraToViewport` overwrites `camera.fov` every frame.
  // If a frame beat this capture, we'd store an already-reshaped fov as the
  // reference lens and the model would render at the wrong (inconsistent) size.
  useLayoutEffect(() => {
    if (!camera) return;
    refFovDeg.current = camera.fov; // vertical FOV at the Blender (16:9) aspect
    fovReady.current = true;
    set({ camera });
    invalidate(); // draw the first frame now that the camera exists
  }, [camera, set, invalidate]);

  // With `frameloop="demand"` the scene only renders when we ask. Scrolling is
  // the only thing that changes it, so request a frame on every scroll; the
  // useFrame below keeps requesting until the inertial scrub has caught up.
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [invalidate]);

  // Enable every clip so `mixer.setTime` evaluates it. We never call
  // `mixer.update(delta)`, so the animation only advances when *we* scrub it.
  useEffect(() => {
    const clips = Object.values(actions);
    clips.forEach((action) => action?.reset().play());
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer]);

  useFrame((_, delta) => {
    // Wait for the pristine reference lens before fitting, so we never scale the
    // frustum against a stale/default fov.
    if (!camera || duration <= 0 || !fovReady.current) return;

    // Inertial catch-up toward the raw scroll progress for a smooth scrub.
    smoothed.current = THREE.MathUtils.damp(
      smoothed.current,
      progress.current,
      SCRUB_DAMP,
      delta,
    );

    // --- Keyframe → scroll mapping (Option A: linear + curve) ---------------
    // The baked timeline maps onto the scroll span, reshaped by SCRUB_CURVE
    // (1 = linear/Blender spacing, <1 = front-load early keyframes).
    // For Option B (pin a specific keyframe to a specific section), replace
    // `curved` with a piecewise lerp over an ordered [{progress,time}] table.
    const curved = Math.pow(smoothed.current, SCRUB_CURVE);
    const time = Math.min(curved * duration, duration - 1e-3);
    mixer.setTime(time);

    // Keep framing faithful to the Blender camera at any viewport aspect.
    fitCameraToViewport(camera, size.width / size.height, {
      blenderAspect: BLENDER_ASPECT,
      refFovDeg: refFovDeg.current,
      mode: "cover",
    });

    // Screen-space pan: shift the frustum (not the model) to reframe the house
    // per keyframe. Offsets are fractions of the viewport; +x → right, +y →
    // down (a negative view offset shifts the rendered window the opposite way).
    const pan = samplePan(SCREEN_PAN, smoothed.current);
    if (pan.x !== 0 || pan.y !== 0) {
      camera.setViewOffset(
        size.width,
        size.height,
        -pan.x * size.width,
        -pan.y * size.height,
        size.width,
        size.height,
      );
    } else if (camera.view?.enabled) {
      camera.clearViewOffset();
    }

    // Still easing toward the scroll position → request another frame. Once the
    // scrub has settled we stop, so an idle page renders nothing.
    if (Math.abs(progress.current - smoothed.current) > 1e-4) invalidate();
  });

  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_URL);
