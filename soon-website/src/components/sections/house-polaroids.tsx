"use client";

import { useEffect, useRef } from "react";

import { Polaroid } from "@/components/ui/polaroid";
import { Reveal } from "@/components/ui/reveal";
import { prefersReducedMotion } from "@/lib/visibility";

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

/**
 * Polaroids around the 3D house scene, filling the tall gap between the hero and
 * the concept section.
 *
 * Desktop: scattered on either side of the house, each sliding in from its own
 * side with a staggered ease-out (and back out when scrolled away), then
 * drifting vertically with the mouse (deeper cards move more → parallax).
 *
 * Mobile: no room to flank the house, so they stack down the centre as a small,
 * half-overlapping pile — later cards sit lower and on top, so they build up as
 * you scroll. Mouse parallax is skipped on touch / coarse pointers.
 */
export default function SectionHousePolaroids() {
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Parallax is a mouse affordance — skip it on touch / coarse pointers so the
    // mobile stack keeps its clean CSS layout.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // target = latest pointer position (normalised to [-1, 1] from viewport
    // centre); cur = smoothed value we ease toward each frame.
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const tick = () => {
      // exponential smoothing → buttery drift instead of instant snapping
      cur.x += (target.x - cur.x) * 0.07;
      cur.y += (target.y - cur.y) * 0.07;
      for (let i = 0; i < layerRefs.current.length; i++) {
        const el = layerRefs.current[i];
        if (!el) continue;
        const depth = POLAROIDS[i].depth;
        // vertical is the lead motion (mouse up/down); horizontal is a subtle hint
        el.style.transform = `translate3d(${cur.x * depth * 0.35}px, ${cur.y * depth}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div className="relative w-full overflow-x-clip">
      <div className="pointer-events-none relative mx-auto -mt-[34svh] flex max-w-lg flex-col items-center px-6 pt-0 pb-20 lg:max-w-360 lg:-mt-[20vh] lg:block lg:h-185 lg:px-0 lg:py-0">
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
              x={p.x}
              delay={p.delay}
              duration={1200}
              rootMargin="-28% 0px -28% 0px"
            >
              <Polaroid src={p.src} rotate={p.rotate} caption={p.caption} />
            </Reveal>
          </div>
        ))}
      </div>
    </div>
  );
}
