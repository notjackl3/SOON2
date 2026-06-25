# 3D models

Drop your Blender export here as **`scene.glb`** (the path the site loads:
`/models/scene.glb`, configured in `src/components/three/constants.ts`).

Export from Blender → **File → Export → glTF 2.0 (.glb)** with:

- **Include:** Cameras ✔, Selected Objects (or visible) ✔, Punctual Lights ✔ (optional)
- **Animation:** Animation ✔, **Sampling Animations** ✔ (bakes the eased camera
  keyframes so they survive the export)

The GLB must contain the static scene plus **one animated camera**. Until the
file exists the site runs normally — the 3D background simply renders nothing
(handled by `scene-error-boundary.tsx`).

**IMPORTANT!!!!**
Unless you want a 50 megabyte model... Make sure you're in SOON2/soon-website. Run `npm run optimize:glb`. Now it should be ~250 KB. magic.

