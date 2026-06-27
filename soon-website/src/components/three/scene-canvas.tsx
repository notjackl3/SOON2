"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";

import { Scene } from "./scene";
import { SceneErrorBoundary } from "./scene-error-boundary";

/**
 * The WebGL canvas. Loaded client-only (see scene-background.tsx) since it
 * touches browser/WebGL APIs. No `camera` prop — Scene swaps in the Blender
 * camera from the GLB at runtime.
 *
 * The GLB is rendered *unlit* (UNLIT_BAKED → Scene/makeUnlit): baked Cycles
 * lighting shows exactly as exported — no scene lights, no tone mapping. The
 * canvas is transparent over a flat white wrapper (see scene-background.tsx).
 */
export default function SceneCanvas() {
  return (
    <Canvas
      // Render-on-demand: the scene is scrubbed by scroll, so it only needs to
      // draw when scroll changes (see Scene's invalidate-on-scroll), not 60×/sec.
      frameloop="demand"
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NoToneMapping;
      }}
    >
      <SceneErrorBoundary>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </SceneErrorBoundary>
    </Canvas>
  );
}
