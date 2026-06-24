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
 */
export default function SceneCanvas() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
      onCreated={({ gl }) => {
        // Approximate the Blender look; tune against a Blender screenshot.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
      }}
    >
      <SceneErrorBoundary>
        <Suspense fallback={null}>
          {/*
            Fallback lighting so the scene is visible even if the GLB ships
            without exported lights. Remove these two lights if you exported
            "Punctual Lights" from Blender and want only those.
          */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 2]} intensity={1.2} />
          <Scene />
        </Suspense>
      </SceneErrorBoundary>
    </Canvas>
  );
}
