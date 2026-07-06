"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { BoundingBox } from "@/components/ui/bounding-box";
import { BoundingGrid } from "@/components/ui/bounding-grid";
import { DottedMap } from "@/components/ui/dotted-map";
import { Highlight } from "@/components/ui/highlight";
import { Reveal } from "@/components/ui/reveal";
import { ScaledStage } from "@/components/ui/scaled-stage";
import { MAP_W } from "@/data/map-dots";
import {
  ALL_SPONSORS,
  AREAS,
  BG_VECTORS,
  CLUSTER,
  EDGES,
  SPONSORS,
  STAGE_H,
  STAGE_W,
  type Area,
  type Sponsor,
} from "@/data/past-sponsors";
import { observeVisibility, prefersReducedMotion } from "@/lib/visibility";

const MAP_X = 353.04;
const MAP_Y = 183.19;
// Crop the map to North America + a little South America (map-local px); the rest
// of the tail is faded out. Roughly matches the desktop stage's bottom clip.
const MAP_VIEW_H = 1000;

type Box = { x: number; y: number; w: number; h: number };
const BOX_BY_ID: Record<string, Box> = {};
[...SPONSORS, CLUSTER.aucctus, CLUSTER.cystack, CLUSTER.polar].forEach((s) => {
  BOX_BY_ID[s.id] = { x: s.x, y: s.y, w: s.w, h: s.h };
});

const areaCenter = (a: Area) => ({ x: a.x + a.w / 2, y: a.y + a.h / 2 });

/** Midpoint of the box edge closest to `target` — where a connector leaves the
 *  card (per Figma, lines exit the median of the nearest edge, not a corner). */
function closestEdgeMidpoint(b: Box, target: { x: number; y: number }) {
  const mids = [
    { x: b.x + b.w / 2, y: b.y }, // top
    { x: b.x + b.w / 2, y: b.y + b.h }, // bottom
    { x: b.x, y: b.y + b.h / 2 }, // left
    { x: b.x + b.w, y: b.y + b.h / 2 }, // right
  ];
  let best = mids[0];
  let bd = Infinity;
  for (const m of mids) {
    const d = (m.x - target.x) ** 2 + (m.y - target.y) ** 2;
    if (d < bd) {
      bd = d;
      best = m;
    }
  }
  return best;
}

/** City label + logo — the shared body of every logo card / cluster cell. */
function CardContent({ city, logo }: { city: string; logo: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-1.5 p-3.5">
      <span className="text-center font-sans text-[14px] leading-none tracking-tight text-ink-soft">
        ({city})
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- small logo inside a scaled stage */}
      <img src={logo} alt={city} className="min-h-0 w-full flex-1 object-contain" />
    </div>
  );
}

/** Positioned wrapper that flickers its child in on load. */
function Flicker({
  box,
  style,
  children,
}: {
  box: Box;
  style: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute z-20"
      style={{ left: box.x, top: box.y, width: box.w, height: box.h, ...style }}
    >
      {children}
    </div>
  );
}

export default function SectionPastSponsors() {
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [reduced, setReduced] = useState(false);

  // Play once when whichever layout (desktop stage or mobile map) enters view.
  useEffect(() => {
    const els = [desktopRef.current, mobileRef.current].filter(
      Boolean,
    ) as HTMLElement[];
    if (!els.length) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let done = false;
    const stops: Array<() => void> = [];
    const trigger = () => {
      if (done) return;
      done = true;
      stops.forEach((s) => s());
      const reduce = prefersReducedMotion();
      setReduced(reduce);
      // Hold a beat after the section settles before the sequence plays.
      timer = setTimeout(() => setLoaded(true), reduce ? 0 : 650);
    };
    els.forEach((el) =>
      stops.push(
        observeVisibility(el, (v) => v && trigger(), {
          rootMargin: "0px 0px -15% 0px",
        }),
      ),
    );
    return () => {
      stops.forEach((s) => s());
      if (timer) clearTimeout(timer);
    };
  }, []);

  // Flicker style for the i-th card.
  const flicker = (i: number): CSSProperties => {
    if (!loaded) return { opacity: 0 };
    if (reduced) return { opacity: 1 };
    return { animation: "sponsor-flicker 640ms both", animationDelay: `${220 + i * 90}ms` };
  };

  return (
    <section id="past-sponsors" className="relative w-full overflow-hidden bg-white">
      {/* ---------- Desktop: the map stage, fit to one viewport ---------- */}
      <div
        ref={desktopRef}
        className="relative hidden h-dvh overflow-hidden md:block"
      >
        <FitStage>
            {/* Decorative vectors (back). The arc draws itself on; the rest are
                static SVGs. */}
            {BG_VECTORS.map((v) =>
              v.src.includes("arc") ? (
                <div
                  key={v.src}
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{ left: v.x, top: v.y, width: v.w, height: v.h }}
                >
                  <AnimatedArc active={loaded} reduced={reduced} />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- decorative SVG
                <img
                  key={v.src}
                  src={v.src}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute"
                  style={{ left: v.x, top: v.y, width: v.w, height: v.h }}
                />
              ),
            )}

            {/* Green city areas (behind the map, like Figma) */}
            {AREAS.map((a, i) => (
              <div key={a.id} className="absolute z-0" style={{ left: a.x, top: a.y }}>
                <Highlight
                  active={loaded}
                  width={a.w}
                  height={a.h}
                  color="var(--color-accent)"
                  delay={i * 70}
                />
              </div>
            ))}

            {/* Dotted map — cropped to NA + a little SA, faded at the bottom */}
            <div
              className="absolute z-1"
              style={{ left: MAP_X, top: MAP_Y, width: MAP_W, height: MAP_VIEW_H }}
            >
              <DottedMap active={loaded} viewH={MAP_VIEW_H} fadeBottom />
            </div>

            {/* Connector lines */}
            <svg
              className="absolute inset-0 z-2 overflow-visible"
              width={STAGE_W}
              height={STAGE_H}
              viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
              fill="none"
              aria-hidden
            >
              {EDGES.map((e, i) => {
                const a = AREAS.find((x) => x.id === e.area)!;
                const p2 = areaCenter(a);
                const p1 = closestEdgeMidpoint(BOX_BY_ID[e.from], p2);
                // Round so the SSR and client strings match exactly (Math.hypot
                // can differ in the last ULP between Node and the browser).
                const len = Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y) * 100) / 100;
                return (
                  <line
                    key={i}
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="var(--color-line)"
                    strokeWidth={1.32}
                    strokeDasharray={len}
                    strokeDashoffset={loaded ? 0 : len}
                    style={{
                      transition: reduced
                        ? undefined
                        : `stroke-dashoffset 550ms ease ${700 + i * 70}ms`,
                    }}
                  />
                );
              })}
            </svg>

            {/* Heading */}
            <div className="absolute z-3" style={{ left: 67.83, top: 90.95, width: 340 }}>
              <Reveal>
                <p className="font-sans text-[80px] font-medium leading-none tracking-tight text-ink">
                  Our past <span className="font-display italic">sponsors</span>
                </p>
                <p className="mt-5 font-sans text-[22px] leading-snug tracking-tight text-ink-soft">
                  Where will you take us next?
                </p>
              </Reveal>
            </div>

            {/* Standalone sponsor cards */}
            {SPONSORS.map((s, i) => (
              <Flicker key={s.id} box={s} style={flicker(i)}>
                <BoundingBox cornerSize="xl" className="h-full w-full">
                  {s.kind === "quote" ? (
                    <QuoteBody sponsor={s} />
                  ) : (
                    <CardContent city={s.city} logo={s.logo} />
                  )}
                </BoundingBox>
              </Flicker>
            ))}

            {/* Toronto cluster. P renders first so the grid's shared corner square
                (top-right = P's bottom-left) paints on top of P's box, not behind. */}
            <Flicker box={CLUSTER.polar} style={flicker(SPONSORS.length + 1)}>
              <BoundingBox cornerSize="xl" corners={["tl", "tr", "br"]} className="h-full w-full">
                <CardContent city={CLUSTER.polar.city} logo={CLUSTER.polar.logo} />
              </BoundingBox>
            </Flicker>

            {/* aucctus + cystack (2×1 grid, shared edge/corners) */}
            <Flicker
              box={{
                x: CLUSTER.aucctus.x,
                y: CLUSTER.aucctus.y,
                w: CLUSTER.aucctus.w + CLUSTER.cystack.w,
                h: CLUSTER.aucctus.h,
              }}
              style={flicker(SPONSORS.length)}
            >
              {/* bg-white so the map is hidden behind the cluster (grid cells are
                  otherwise transparent); grid-rows-1 gives the single row a definite
                  height so a squarish logo can't grow its cell past the grid. */}
              <BoundingGrid
                cols={2}
                rows={1}
                cornerSize="xl"
                className="h-full w-full grid-rows-1 bg-white"
              >
                <CardContent city={CLUSTER.aucctus.city} logo={CLUSTER.aucctus.logo} />
                <CardContent city={CLUSTER.cystack.city} logo={CLUSTER.cystack.logo} />
              </BoundingGrid>
            </Flicker>
        </FitStage>
      </div>

      {/* ---------- Mobile: simplified stacked grid ---------- */}
      <div className="px-8 py-14 md:hidden">
        <h2 className="font-sans text-[clamp(40px,11vw,64px)] font-medium leading-none tracking-tight text-ink">
          Our past <span className="font-display italic">sponsors</span>
        </h2>
        <p className="mt-4 font-sans text-[clamp(16px,4.5vw,20px)] tracking-tight text-ink-soft">
          Where will you take us next?
        </p>

        {/* Dotted map with the city areas (no cards/connectors — those are the
            grid below). Uses the map's own coordinate space; areas are offset
            from stage coords into map-local coords. */}
        <div ref={mobileRef} className="mt-8">
          <ScaledStage width={MAP_W} height={MAP_VIEW_H}>
            {AREAS.map((a, i) => (
              <div
                key={a.id}
                className="absolute"
                style={{ left: a.x - MAP_X, top: a.y - MAP_Y }}
              >
                <Highlight
                  active={loaded}
                  width={a.w}
                  height={a.h}
                  color="var(--color-accent)"
                  delay={i * 70}
                />
              </div>
            ))}
            <DottedMap active={loaded} viewH={MAP_VIEW_H} fadeBottom />
          </ScaledStage>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4">
          {ALL_SPONSORS.map((s) => (
            <BoundingBox
              key={s.id}
              cornerSize="lg"
              className="flex aspect-3/2 flex-col items-center justify-center"
            >
              <CardContent city={s.city} logo={s.logo} />
            </BoundingBox>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Chatforce quote card body. */
function QuoteBody({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <div>
        <p className="font-sans text-[16px] leading-[1.08] tracking-tight text-ink-soft">
          {sponsor.quote}
        </p>
        <p className="mt-3 font-sans text-[13px] leading-none tracking-tight text-ink-soft">
          {sponsor.author}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-sans text-[13px] leading-none tracking-tight text-ink-soft">
          ({sponsor.city})
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element -- small logo inside a scaled stage */}
        <img src={sponsor.logo} alt="Chatforce" className="h-7.75 w-39 object-contain object-right" />
      </div>
    </div>
  );
}

/** The decorative dashed arc, drawn on (stroke-dashoffset) when active. */
function AnimatedArc({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 555.294 1086.52"
      fill="none"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <path
        d="M555.065 0.618751C221.265 124.321 -51.6657 544.516 9.20369 1086.45"
        stroke="var(--color-line)"
        strokeWidth={1.32}
        pathLength={1}
        style={{
          strokeDasharray: 1,
          strokeDashoffset: active ? 0 : 1,
          transition: reduced ? undefined : "stroke-dashoffset 1800ms ease 300ms",
        }}
      />
    </svg>
  );
}

/**
 * Scales the fixed STAGE_W×STAGE_H stage to *contain* within its parent (fits
 * both width and height, capped at 1×, centered) so the whole composition fits
 * one viewport. The map bleeds past the 1200 frame and is clipped — as in Figma.
 */
function FitStage({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ scale: 1, x: 0, y: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const compute = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      if (!w || !h) return;
      const scale = Math.min(w / STAGE_W, h / STAGE_H, 1);
      setT({ scale, x: (w - STAGE_W * scale) / 2, y: (h - STAGE_H * scale) / 2 });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

