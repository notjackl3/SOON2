"use client";

import { useEffect, useRef, useState } from "react";

import { BoundingBox } from "@/components/ui/bounding-box";
import { Polaroid } from "@/components/ui/polaroid";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/utils";
import { observeVisibility, prefersReducedMotion } from "@/lib/visibility";

/** Scattered polaroids flanking the 3D house. `desktop` holds the lg+ absolute
 *  scatter position; below lg (mobile + iPad) they ignore it and fall into a
 *  centred, half-overlapping column. `depth` = px each card drifts per full
 *  mouse deflection (its max travel). Each desktop top-% keeps a resting gap on
 *  the drifting edge larger than that depth, so the parallax can never push a
 *  card out of the bounded zone (the container's h-185 box) into the hero above
 *  or the section below. Add a `src` per entry once the photos are chosen. */
const POLAROIDS = [
  {
    caption: "come together",
    src: "/polaroid/soon.jpg",
    rotate: -7,
    x: -220,
    delay: 0,
    depth: 26,
    desktop: "lg:left-[8%] lg:top-[10%] lg:w-64",
  },
  {
    caption: "build projects",
    src: "/polaroid/the-build.jpg",
    rotate: 5,
    x: -300,
    delay: 160,
    depth: 20,
    desktop: "lg:left-[31%] lg:top-[48%] lg:w-56",
  },
  {
    caption: "have fun",
    src: "/polaroid/36-hours.jpg",
    rotate: 6,
    x: 300,
    delay: 80,
    depth: 22,
    desktop: "lg:right-[31%] lg:top-[8%] lg:w-56",
  },
  {
    caption: "create memories",
    src: "/polaroid/the-house.jpg",
    rotate: -6,
    x: 220,
    delay: 240,
    depth: 26,
    desktop: "lg:right-[8%] lg:top-[42%] lg:w-64",
  },
] as const;

const PHOTO_COUNT = POLAROIDS.filter((p) => p.src).length;
const STRING_DRAW_MS = 900;
const DOT_R = 6; // pin/button head radius

/**
 * Polaroids around the 3D house scene, filling the tall gap between the hero and
 * the concept section.
 *
 * Desktop: scattered on either side of the house, each sliding in from its own
 * side, then drifting vertically with the mouse (parallax). A single continuous
 * accent "string" is drawn through the top of every card (left → right, corkboard
 * garland style) once all photos have loaded, with a pin/button circle at each
 * card. The line flexes live with the parallax as the cards drift.
 *
 * Mobile: no room to flank the house, so they stack down the centre as a small,
 * half-overlapping pile. Parallax and strings are desktop-only.
 */
export default function SectionHousePolaroids({
  enabled = true,
}: {
  /** Off hides the polaroids + string (section stays blank, same height). */
  enabled?: boolean;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const polyRef = useRef<SVGPolylineElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [loaded, setLoaded] = useState(0);
  const allLoaded = loaded >= PHOTO_COUNT;

  // Parallax drift + live string positioning (desktop only, while in view).
  useEffect(() => {
    if (!enabled) return;
    const desktop = window.matchMedia("(min-width: 1024px)");
    if (!desktop.matches) return;
    const reduced = prefersReducedMotion();
    const fine = window.matchMedia("(pointer: fine)").matches;
    const parallax = fine && !reduced;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;
    let running = false;

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    // Thread one continuous polyline through every card's top-centre (the pin
    // point), and glue each circle to the same point. Read live rects so the
    // whole garland flexes as the cards drift with the parallax.
    const positionLines = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const s = svg.getBoundingClientRect();
      const cardPts: string[] = [];
      let firstY = 0;
      let lastY = 0;
      for (let i = 0; i < POLAROIDS.length; i++) {
        const card = layerRefs.current[i];
        if (!card) continue;
        const r = card.getBoundingClientRect();
        const x = r.left + r.width / 2 - s.left;
        const y = r.top - s.top;
        if (cardPts.length === 0) firstY = y;
        lastY = y;
        cardPts.push(`${x},${y}`);
        const dot = dotRefs.current[i];
        if (dot) {
          dot.setAttribute("cx", String(x));
          dot.setAttribute("cy", String(y));
        }
      }
      if (!cardPts.length) return;
      // Run the garland off both page edges (level with the outer cards) so it
      // reads as one string spanning the whole width.
      const pts = [`0,${firstY}`, ...cardPts, `${s.width},${lastY}`];
      polyRef.current?.setAttribute("points", pts.join(" "));
    };

    const tick = () => {
      if (parallax) {
        cur.x += (target.x - cur.x) * 0.07;
        cur.y += (target.y - cur.y) * 0.07;
        for (let i = 0; i < layerRefs.current.length; i++) {
          const el = layerRefs.current[i];
          if (!el) continue;
          const depth = POLAROIDS[i].depth;
          el.style.transform = `translate3d(${cur.x * depth * 0.35}px, ${cur.y * depth}px, 0)`;
        }
      }
      positionLines();
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };

    if (parallax) {
      window.addEventListener("pointermove", onMove, { passive: true });
    }
    const stopObserve = observeVisibility(
      outerRef.current!,
      (visible) => (visible ? start() : stop()),
      { rootMargin: "200px" },
    );

    return () => {
      stop();
      stopObserve();
      window.removeEventListener("pointermove", onMove);
    };
  }, [enabled]);

  // Draw the line in — one continuous left → right stroke — but only once every
  // photo has loaded AND all four polaroids have finished sliding into place. We
  // poll the reveal wrappers' opacity so the timing tracks the real entrance,
  // whenever the section actually scrolls into view.
  useEffect(() => {
    if (!enabled) return;
    if (!allLoaded) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    const reduced = prefersReducedMotion();

    let raf = 0;
    let cancelled = false;
    let cleanup = 0;

    // Every card's Reveal wrapper (the layer's only child) has reached full
    // opacity → its slide-in has finished.
    const entranceDone = () => {
      for (let i = 0; i < POLAROIDS.length; i++) {
        const inner = layerRefs.current[i]?.firstElementChild as HTMLElement | null;
        if (!inner) return false;
        if (parseFloat(getComputedStyle(inner).opacity) < 0.99) return false;
      }
      return true;
    };

    const draw = () => {
      const poly = polyRef.current;
      if (!poly) return;

      // Measure the garland from its current points; per-segment lengths let each
      // pin pop in as the stroke sweeps past it. coords[0] is the left page edge.
      const coords = (poly.getAttribute("points") || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((p) => p.split(",").map(Number));
      const segs: number[] = [];
      let total = 0;
      for (let i = 1; i < coords.length; i++) {
        const d = Math.hypot(
          coords[i][0] - coords[i - 1][0],
          coords[i][1] - coords[i - 1][1],
        );
        segs.push(d);
        total += d;
      }
      total = total || 1;

      if (reduced) {
        poly.style.strokeDasharray = "none";
        poly.style.strokeDashoffset = "0";
        dotRefs.current.forEach((dot) => dot && (dot.style.opacity = "1"));
        return;
      }

      // Draw the continuous line in with one stroke sweep (left → right).
      poly.style.transition = "none";
      poly.style.strokeDasharray = String(total);
      poly.style.strokeDashoffset = String(total);
      void poly.getBoundingClientRect(); // force reflow before transitioning
      poly.style.transition = `stroke-dashoffset ${STRING_DRAW_MS}ms ease`;
      poly.style.strokeDashoffset = "0";
      // once drawn, drop the dash so the live parallax updates stay clean
      cleanup = window.setTimeout(() => {
        poly.style.transition = "none";
        poly.style.strokeDasharray = "none";
      }, STRING_DRAW_MS + 60);

      // Pop each pin in right as the sweeping stroke reaches it. Card i sits at
      // coords[i + 1], so the distance to it is segs[0..i].
      dotRefs.current.forEach((dot, i) => {
        if (!dot) return;
        let acc = 0;
        for (let k = 0; k <= i; k++) acc += segs[k] ?? 0;
        const delay = (acc / total) * STRING_DRAW_MS;
        dot.style.transition = `opacity 200ms ease ${delay}ms`;
        dot.style.opacity = "1";
      });
    };

    // Poll until the entrance is done (or a safety cap elapses), then draw once.
    const startTime = performance.now();
    const wait = () => {
      if (cancelled) return;
      if (reduced || entranceDone() || performance.now() - startTime > 8000) {
        draw();
        return;
      }
      raf = requestAnimationFrame(wait);
    };
    raf = requestAnimationFrame(wait);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (cleanup) clearTimeout(cleanup);
    };
  }, [allLoaded, enabled]);

  return (
    <div ref={outerRef} className="relative w-full overflow-x-clip">
      {/* When disabled, keep the cards laid out but `invisible` so the section
          stays blank at the exact same height (mobile height is content-driven,
          so an empty box would collapse). */}
      <div
        className={cn(
          "pointer-events-none relative z-10 mx-auto -mt-[34svh] flex max-w-lg flex-col items-center px-6 pt-0 pb-20 lg:max-w-360 lg:-mt-[20vh] lg:block lg:h-185 lg:px-0 lg:py-0",
          !enabled && "invisible",
        )}
      >
        {POLAROIDS.map((p, i) => (
          // outer layer carries the mouse-parallax transform; Reveal inside owns
          // the slide-in transform — nesting lets the two compose cleanly.
          <div
            key={i}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className={[
              "pointer-events-auto relative w-52 will-change-transform sm:w-56",
              // mobile: a big, half-overlapping zig-zag pile that fills the page
              i > 0 ? "-mt-28" : "",
              i % 2 === 0 ? "self-start ml-[2%]" : "self-end mr-[2%]",
              // lg: break out of the column into the absolute scatter
              // (lg:w-* lives in p.desktop — don't add a conflicting width here)
              "lg:absolute lg:mt-0 lg:ml-0 lg:mr-0 lg:self-auto",
              p.desktop,
            ].join(" ")}
          >
            <Reveal
              repeat
              reHideBelowOnly
              x={p.x}
              delay={p.delay}
              duration={1200}
              rootMargin="-28% 0px -28% 0px"
            >
              {/* Rotate the frame + card together so the bounding-box corner
                  squares stay glued to the polaroid's corners. */}
              <div style={{ rotate: `${p.rotate}deg` }}>
                <BoundingBox cornerSize="xl" color="transparent" className="w-full">
                  <Polaroid
                    src={enabled ? p.src : undefined}
                    caption={p.caption}
                    onLoad={() => setLoaded((n) => n + 1)}
                  />
                </BoundingBox>
              </div>
            </Reveal>
          </div>
        ))}
      </div>

      {/* Corkboard garland (desktop only), ON TOP of the cards: one continuous
          accent line threaded through every polaroid with a pin at each. Hidden
          until the draw-in; positioned every frame by the parallax loop. */}
      {enabled && (
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
          aria-hidden
          fill="none"
        >
          <polyline
            ref={polyRef}
            stroke="var(--color-accent)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ strokeDasharray: 9999, strokeDashoffset: 9999 }}
          />
          {POLAROIDS.map((_, i) => (
            <circle
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              r={DOT_R}
              fill="var(--color-accent)"
              style={{ opacity: 0 }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
