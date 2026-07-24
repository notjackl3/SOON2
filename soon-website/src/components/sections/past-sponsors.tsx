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
import { linkifyCompanies } from "@/lib/companies";
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

// Shrinks the whole desktop composition to ~90% ("viewed at 90% zoom"): the map
// + cards scale down and, staying centred, leave larger side margins.
const DESKTOP_ZOOM = 0.9;

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

/** City label + logo — the shared body of every logo card / cluster cell. When
 *  `url` is set the logo becomes a clickable link to the sponsor's site. */
function CardContent({ city, logo, url }: { city: string; logo: string; url?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center gap-1.5 px-2.5 py-3">
      <span className="text-center font-sans text-[14px] leading-none tracking-tight text-ink-soft">
        ({city})
      </span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${city} sponsor website`}
          className="flex min-h-0 w-full flex-1 items-center justify-center transition-opacity hover:opacity-70"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- small logo inside a scaled stage */}
          <img src={logo} alt={city} className="max-h-full w-full object-contain" />
        </a>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- small logo inside a scaled stage
        <img src={logo} alt={city} className="min-h-0 w-full flex-1 object-contain" />
      )}
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
    <section id="past-sponsors" className="relative w-full overflow-x-clip bg-white">
      {/* ---------- Desktop: the map stage, fit to width ---------- */}
      <div
        ref={desktopRef}
        className="relative hidden md:block"
      >
        <FitStage zoom={DESKTOP_ZOOM}>
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
                    <CardContent city={s.city} logo={s.logo} url={s.url} />
                  )}
                </BoundingBox>
              </Flicker>
            ))}

            {/* Toronto cluster. P renders first so the grid's shared corner square
                (top-right = P's bottom-left) paints on top of P's box, not behind. */}
            <Flicker box={CLUSTER.polar} style={flicker(SPONSORS.length + 1)}>
              <BoundingBox cornerSize="xl" corners={["tl", "tr", "br"]} className="h-full w-full">
                <CardContent city={CLUSTER.polar.city} logo={CLUSTER.polar.logo} url={CLUSTER.polar.url} />
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
                <CardContent city={CLUSTER.aucctus.city} logo={CLUSTER.aucctus.logo} url={CLUSTER.aucctus.url} />
                <CardContent city={CLUSTER.cystack.city} logo={CLUSTER.cystack.logo} url={CLUSTER.cystack.url} />
              </BoundingGrid>
            </Flicker>
        </FitStage>
      </div>

      {/* ---------- Mobile: simplified stacked grid ---------- */}
      <div className="px-8 py-14 md:hidden">
        <h2 className="text-h2 font-medium leading-none tracking-tight text-ink">
          Our past <span className="font-display italic">sponsors</span>
        </h2>
        <p className="mt-4 text-body tracking-body">
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
              <CardContent city={s.city} logo={s.logo} url={s.url} />
            </BoundingBox>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Quote card body — quote, author, then city + logo along the bottom. */
function QuoteBody({ sponsor }: { sponsor: Sponsor }) {
  return (
    <div className="flex h-full flex-col p-4">
      <div>
        <p className="font-sans text-[16px] leading-[1.08] tracking-tight text-ink-soft">
          {sponsor.quote}
        </p>
        <p className="mt-3 whitespace-pre-line font-sans text-[13px] leading-none tracking-tight text-ink-soft">
          {sponsor.author ? linkifyCompanies(sponsor.author) : null}
        </p>
      </div>
      <div className="mt-7 flex items-center justify-between">
        <span className="font-sans text-[13px] leading-none tracking-tight text-ink-soft">
          ({sponsor.city})
        </span>
        {sponsor.url ? (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${sponsor.city} sponsor website`}
            className="transition-opacity hover:opacity-70"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- small logo inside a scaled stage */}
            <img src={sponsor.logo} alt={sponsor.city} className="max-h-7 w-auto max-w-[110px] object-contain object-right" />
          </a>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- small logo inside a scaled stage
          <img src={sponsor.logo} alt={sponsor.city} className="max-h-7 w-auto max-w-[110px] object-contain object-right" />
        )}
      </div>
    </div>
  );
}

/** Corner-pin-style squares (white fill + line border, ~15px like the BoundingBox
 *  "xl" corners) at each end of the arc: the start (top-right, 555.065, 0.62) and
 *  the terminus (bottom-left, 9.2, 1086.45). `delay` matches each end to when the
 *  arc reaches it — the start as it begins drawing, the end once it finishes. */
const ARC_END_SQUARES = [
  { cx: 555.065, cy: 0.618751, delay: 400 },
  { cx: 9.20369, cy: 1086.45, delay: 2000 },
];
const ARC_SQUARE_SIZE = 15;

/** The decorative dashed arc, drawn on (stroke-dashoffset) when active, with a
 *  corner-pin square that flickers in at each end as the arc reaches it. */
function AnimatedArc({ active, reduced }: { active: boolean; reduced: boolean }) {
  return (
    <svg
      viewBox="0 0 555.294 1086.52"
      fill="none"
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
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
      {ARC_END_SQUARES.map((sq, i) => (
        <rect
          key={i}
          x={sq.cx - ARC_SQUARE_SIZE / 2}
          y={sq.cy - ARC_SQUARE_SIZE / 2}
          width={ARC_SQUARE_SIZE}
          height={ARC_SQUARE_SIZE}
          fill="white"
          stroke="var(--color-line)"
          strokeWidth={1.32}
          style={{
            opacity: active ? 1 : 0,
            transition: reduced ? undefined : `opacity 300ms ease ${sq.delay}ms`,
          }}
        />
      ))}
    </svg>
  );
}

/**
 * Scales the fixed STAGE_W×STAGE_H stage to fit its parent's *width* (capped at
 * 1×, centered when the parent is wider than the stage). The wrapper takes the
 * scaled stage height so the section grows to fit the whole composition rather
 * than clipping it vertically; horizontal bleed past the stage is clipped by the
 * section's `overflow-x-clip`.
 */
function FitStage({ children, zoom = 1 }: { children: ReactNode; zoom?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ scale: 1, x: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const compute = () => {
      const w = wrap.clientWidth;
      if (!w) return;
      // Fit-to-width (never upscale past native), then apply the zoom factor.
      const scale = Math.min(w / STAGE_W, 1) * zoom;
      setT({ scale, x: (w - STAGE_W * scale) / 2 });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [zoom]);

  return (
    <div ref={wrapRef} className="relative w-full" style={{ height: STAGE_H * t.scale }}>
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `translateX(${t.x}px) scale(${t.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

