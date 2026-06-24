"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import { fitCameraToViewport } from "./fit-camera";
import { useScrollProgress } from "./use-scroll-progress";
import {
  BLENDER_ASPECT,
  FADE_ID,
  MODEL_URL,
  SCROLL_SPAN_ID,
  SCRUB_END_FRACTION,
} from "./constants";

/** How quickly the scrub catches up to the scroll position (higher = snappier). */
const SCRUB_DAMP = 6;

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

  // Scrub runs from the top of the span to halfway through the placeholder, so
  // the camera animation finishes early and then holds while the scene fades.
  const progress = useScrollProgress(SCROLL_SPAN_ID, {
    endId: FADE_ID,
    endFraction: SCRUB_END_FRACTION,
  });
  const smoothed = useRef(0);
  const refFovDeg = useRef(50);

  const camera = cameras[0] as THREE.PerspectiveCamera | undefined;
  const duration = animations[0]?.duration ?? 0;

  // Promote the Blender camera to the render camera and remember its lens.
  useEffect(() => {
    if (!camera) return;
    refFovDeg.current = camera.fov; // vertical FOV at the Blender (16:9) aspect
    set({ camera });
  }, [camera, set]);

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
    if (!camera || duration <= 0) return;

    // Inertial catch-up toward the raw scroll progress for a smooth scrub.
    smoothed.current = THREE.MathUtils.damp(
      smoothed.current,
      progress.current,
      SCRUB_DAMP,
      delta,
    );

    // --- Keyframe → scroll mapping (Option A: linear) -----------------------
    // The whole baked timeline maps proportionally to the scroll span.
    // For Option B (pin a specific keyframe to a specific section), replace
    // this line with a piecewise lerp over an ordered [{progress,time}] table.
    const time = Math.min(smoothed.current * duration, duration - 1e-3);
    mixer.setTime(time);

    // Keep framing faithful to the Blender camera at any viewport aspect.
    fitCameraToViewport(camera, size.width / size.height, {
      blenderAspect: BLENDER_ASPECT,
      refFovDeg: refFovDeg.current,
      mode: "cover",
    });
  });

  return <primitive object={scene} />;
}

useGLTF.preload(MODEL_URL);
