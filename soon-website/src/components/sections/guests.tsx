"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ShapeGridEdge } from "@/components/shapes/shape-grid-edge";
import { BoundingBox } from "@/components/ui/bounding-box";
import { ScaledStage } from "@/components/ui/scaled-stage";
import { Vista } from "@/components/ui/vista";
import {
  BG_VECTORS,
  EDGES,
  MOBILE_DECOR,
  MOBILE_EDGES,
  MOBILE_LAYOUT,
  MOBILE_PIC,
  MOBILE_STAGE_H,
  MOBILE_STAGE_W,
  PEOPLE,
  PIC,
  STAGE_H,
  STAGE_W,
  type Corner,
  type EdgeEnd,
  type Person,
} from "@/data/guests";
import {
  cornerAnchor,
  clampOffset,
  springStep,
  type VistaState,
} from "@/lib/physics";

// --- Physics tuning ---------------------------------------------------------
const K = 11; // spring stiffness (lower = slower return)
const C = 7; // damping (~critical for no bounce)
const DRIFT_A = 9; // lilypad drift radius (px)
const PUSH_R = 190; // cursor influence radius (px)
const PUSH_STRENGTH = 2600; // cursor push force
const MAX_OFFSET = 70; // hard cap on displacement from home

type ResolvedEnd =
  | { fixed: true; x: number; y: number }
  | { fixed: false; i: number; ax: number; ay: number };

const IDX: Record<string, number> = {};
PEOPLE.forEach((p, i) => (IDX[p.id] = i));

function resolveEnd(end: EdgeEnd): ResolvedEnd {
  if (end.kind === "edge") return { fixed: true, x: end.x, y: end.y };
  const i = IDX[end.id];
  const a = cornerAnchor(PEOPLE[i], end.corner);
  return { fixed: false, i, ax: a.x, ay: a.y };
}

const RESOLVED = EDGES.map((e) => ({
  from: resolveEnd(e.from),
  to: resolveEnd(e.to),
}));

function pointOf(end: ResolvedEnd, states: VistaState[]) {
  if (end.fixed) return { x: end.x, y: end.y };
  return { x: end.ax + states[end.i].x, y: end.ay + states[end.i].y };
}

function FeedbackHeading({ className }: { className?: string }) {
  return (
    <p className={className}>
      Real <span className="font-display italic">feedback</span>.
    </p>
  );
}

// --- Mobile stage helpers ---------------------------------------------------
const PERSON_BY_ID: Record<string, Person> = {};
PEOPLE.forEach((p) => (PERSON_BY_ID[p.id] = p));
const MLAYOUT_BY_ID: Record<string, (typeof MOBILE_LAYOUT)[number]> = {};
MOBILE_LAYOUT.forEach((m) => (MLAYOUT_BY_ID[m.id] = m));

/** A mobile portrait corner (picture corner) in mobile-stage px. */
function mCorner(id: string, corner: Corner) {
  const m = MLAYOUT_BY_ID[id];
  return {
    x: m.x + (corner === "tr" || corner === "br" ? MOBILE_PIC : 0),
    y: m.y + (corner === "bl" || corner === "br" ? MOBILE_PIC : 0),
  };
}
const mEnd = (end: EdgeEnd) =>
  end.kind === "edge" ? { x: end.x, y: end.y } : mCorner(end.id, end.corner);

/** Mobile portrait: framed photo (corner squares via BoundingBox) + name/role. */
function MobileGuestCard({
  person,
  corners,
}: {
  person: Person;
  corners: Corner[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <BoundingBox
        corners={corners}
        cornerSize="sm"
        color="var(--color-surface)"
        className="relative aspect-square w-full"
      >
        <Image
          src={person.image}
          alt={person.name}
          fill
          sizes="130px"
          className="object-cover"
        />
      </BoundingBox>
      {/* Name/role get their own horizontal padding so the text is inset from
          the card (and screen) edges without shrinking the photo above. */}
      <div className="flex flex-col gap-0.5 px-1.5">
        <p className="font-display text-[9.66px] font-semibold leading-none tracking-[0.02em] text-ink-soft">
          {person.name}
        </p>
        <p className="text-[6.67px] uppercase leading-snug tracking-tight text-muted">
          {person.role}
        </p>
      </div>
    </div>
  );
}

export default function SectionGuests() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const vistaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const cursor = useRef({ x: 0, y: 0, active: false });

  const [layout, setLayout] = useState({
    scale: 1,
    offsetX: 0,
    height: STAGE_H,
  });

  // Fit the fixed stage to the wrapper width (capped at 1× so it never upscales).
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const compute = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      const scale = Math.min(w / STAGE_W, 1);
      setLayout({
        scale,
        offsetX: Math.max(0, (w - STAGE_W * scale) / 2),
        height: STAGE_H * scale,
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  // Physics loop (desktop only). rAF writes transforms + line endpoints directly.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const states: VistaState[] = PEOPLE.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));

    const writeFrame = () => {
      for (let i = 0; i < states.length; i++) {
        const node = vistaRefs.current[i];
        if (node) {
          node.style.transform = `translate3d(${states[i].x}px,${states[i].y}px,0)`;
        }
      }
      RESOLVED.forEach((edge, li) => {
        const line = lineRefs.current[li];
        if (!line) return;
        const p1 = pointOf(edge.from, states);
        const p2 = pointOf(edge.to, states);
        line.setAttribute("x1", String(p1.x));
        line.setAttribute("y1", String(p1.y));
        line.setAttribute("x2", String(p2.x));
        line.setAttribute("y2", String(p2.y));
      });
    };

    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const elapsed = (t - t0) / 1000;
      const cur = cursor.current;

      for (let i = 0; i < states.length; i++) {
        const p = PEOPLE[i];
        const s = states[i];
        // Lilypad drift target.
        const tx = DRIFT_A * Math.sin(elapsed * (0.25 + i * 0.015) + i * 1.7);
        const ty = DRIFT_A * Math.cos(elapsed * (0.22 + i * 0.013) + i * 2.3);
        // Cursor push (outward from cursor, within radius).
        let fx = 0;
        let fy = 0;
        if (cur.active) {
          const dx = p.x + PIC / 2 + s.x - cur.x;
          const dy = p.y + PIC / 2 + s.y - cur.y;
          const dist = Math.hypot(dx, dy) || 0.0001;
          if (dist < PUSH_R) {
            const f = (PUSH_STRENGTH * (1 - dist / PUSH_R)) / dist;
            fx += f * dx;
            fy += f * dy;
          }
        }
        springStep(s, tx, ty, fx, fy, K, C, dt);
        clampOffset(s, MAX_OFFSET);
      }
      writeFrame();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const apply = () => {
      if (desktop.matches && !reduced.matches) {
        start();
      } else {
        stop();
        states.forEach((s) => {
          s.x = s.y = s.vx = s.vy = 0;
        });
        writeFrame();
      }
    };

    apply();
    desktop.addEventListener("change", apply);
    reduced.addEventListener("change", apply);
    return () => {
      stop();
      desktop.removeEventListener("change", apply);
      reduced.removeEventListener("change", apply);
    };
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const scale = rect.width / STAGE_W;
    cursor.current.x = (e.clientX - rect.left) / scale;
    cursor.current.y = (e.clientY - rect.top) / scale;
    cursor.current.active = true;
  };
  const onPointerLeave = () => {
    cursor.current.active = false;
  };

  return (
    <section
      id="guests"
      className="relative w-full overflow-hidden bg-white"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {/* Animated shape grid, faded in from the left edge (desktop only) */}
      <ShapeGridEdge side="left" />

      {/* Mobile: staggered portraits connected corner-to-corner (Figma 256:3) */}
      <div className="py-6 md:hidden">
        <ScaledStage width={MOBILE_STAGE_W} height={MOBILE_STAGE_H}>
          {/* Decorative clouds + pixel clusters (back) */}
          {MOBILE_DECOR.map((d) => (
            // eslint-disable-next-line @next/next/no-img-element -- decorative SVG
            <img
              key={d.src}
              src={d.src}
              alt=""
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: d.x,
                top: d.y,
                width: d.w,
                height: d.h,
                transform: d.rotate ? `rotate(${d.rotate}deg)` : undefined,
              }}
            />
          ))}

          {/* Header */}
          <div
            className="absolute"
            style={{ left: 44.27, top: 72.71, width: 234.47 }}
          >
            <FeedbackHeading className="font-sans text-[34.418px] font-medium leading-none tracking-tight text-ink" />
            <p className="mt-0.75 text-center text-[6.48px] uppercase tracking-tight text-muted">
              Past judges and speakers
            </p>
          </div>

          {/* Connector lines (behind the portraits) */}
          <svg
            className="absolute inset-0 overflow-visible"
            width={MOBILE_STAGE_W}
            height={MOBILE_STAGE_H}
            viewBox={`0 0 ${MOBILE_STAGE_W} ${MOBILE_STAGE_H}`}
            fill="none"
            aria-hidden
          >
            {MOBILE_EDGES.map((edge, i) => {
              const p1 = mEnd(edge.from);
              const p2 = mEnd(edge.to);
              return (
                <line
                  key={i}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="var(--color-line)"
                  strokeWidth={0.6}
                />
              );
            })}
          </svg>

          {/* Portraits */}
          {MOBILE_LAYOUT.map((m) => (
            <div
              key={m.id}
              className="absolute"
              style={{ left: m.x, top: m.y, width: MOBILE_PIC }}
            >
              <MobileGuestCard person={PERSON_BY_ID[m.id]} corners={m.corners} />
            </div>
          ))}
        </ScaledStage>
      </div>

      {/* Desktop: floating stage. pointer-events-none so hovers fall through to
          the grid behind; the cursor-push physics is driven by the section's
          pointer handlers (which still fire via event bubbling). */}
      <div
        ref={wrapRef}
        className="pointer-events-none relative hidden md:block"
        style={{ height: layout.height }}
      >
        <div
          ref={stageRef}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `translateX(${layout.offsetX}px) scale(${layout.scale})`,
          }}
        >
          {/* Background vectors (decorative) */}
          {BG_VECTORS.map((v) => (
            // eslint-disable-next-line @next/next/no-img-element -- decorative SVG
            <img
              key={v.src}
              src={v.src}
              alt=""
              aria-hidden
              className="pointer-events-none absolute"
              style={{ left: v.x, top: v.y, width: v.w, height: v.h }}
            />
          ))}

          {/* Heading */}
          <div className="absolute" style={{ left: 120, top: 232, width: 545 }}>
            <FeedbackHeading className="font-sans text-[80px] font-medium leading-none tracking-tight text-ink" />
          </div>
          <p
            className="absolute text-[11px] uppercase tracking-body text-muted"
            style={{ left: 410, top: 348, width: 160 }}
          >
            Past judges and speakers
          </p>

          {/* Connector lines */}
          <svg
            className="absolute inset-0 overflow-visible"
            width={STAGE_W}
            height={STAGE_H}
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            fill="none"
          >
            {RESOLVED.map((edge, i) => (
              <line
                key={i}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                x1={edge.from.fixed ? edge.from.x : edge.from.ax}
                y1={edge.from.fixed ? edge.from.y : edge.from.ay}
                x2={edge.to.fixed ? edge.to.x : edge.to.ax}
                y2={edge.to.fixed ? edge.to.y : edge.to.ay}
                stroke="var(--color-line)"
                strokeWidth={1}
              />
            ))}
          </svg>

          {/* Vistas */}
          {PEOPLE.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => {
                vistaRefs.current[i] = el;
              }}
              className="absolute z-10 will-change-transform"
              style={{ left: p.x, top: p.y, width: PIC }}
            >
              <Vista
                name={p.name}
                role={p.role}
                image={p.image}
                corners={p.corners}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
