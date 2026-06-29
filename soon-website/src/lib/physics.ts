import { PIC, type Corner, type Person } from "@/data/guests";

/** Per-vista runtime offset from home (stage px) + velocity. */
export interface VistaState {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** Home anchor of a picture corner in stage px (before any drift offset). */
export function cornerAnchor(person: Person, corner: Corner) {
  return {
    x: person.x + (corner === "tr" || corner === "br" ? PIC : 0),
    y: person.y + (corner === "bl" || corner === "br" ? PIC : 0),
  };
}

/**
 * One spring + damping integration step (semi-implicit Euler), with an extra
 * external force `(fx, fy)` for the cursor push. Low `k` + near-critical `c`
 * gives the slow "memory-foam" return. Mutates `s`.
 */
export function springStep(
  s: VistaState,
  targetX: number,
  targetY: number,
  fx: number,
  fy: number,
  k: number,
  c: number,
  dt: number,
) {
  s.vx += (-k * (s.x - targetX) - c * s.vx + fx) * dt;
  s.vy += (-k * (s.y - targetY) - c * s.vy + fy) * dt;
  s.x += s.vx * dt;
  s.y += s.vy * dt;
}

/** Clamp the offset magnitude so a card never strays far from home. */
export function clampOffset(s: VistaState, max: number) {
  const d = Math.hypot(s.x, s.y);
  if (d > max) {
    const k = max / d;
    s.x *= k;
    s.y *= k;
    s.vx *= 0.5;
    s.vy *= 0.5;
  }
}
