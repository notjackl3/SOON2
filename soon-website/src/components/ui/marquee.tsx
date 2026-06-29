"use client";

import { useEffect, useRef, type RefObject } from "react";

import { observeVisibility } from "@/lib/visibility";

export interface MarqueeTile {
  /** Optional image src under /public; omit for a gray placeholder tile. */
  src?: string;
  alt?: string;
  /** width / height ratio used to size the tile (default 3:2). */
  aspect?: number;
}

interface MarqueeProps {
  tiles: MarqueeTile[];
  /** -1 = right→left, 1 = left→right. */
  direction: 1 | -1;
  /** Idle drift speed in px/s. */
  baseSpeed?: number;
  /** How much page-scroll velocity adds to the drift. */
  velocityFactor?: number;
  /** Shared scroll-velocity ref from useScrollVelocity. */
  velocityRef: RefObject<number>;
}

function Tile({ tile }: { tile: MarqueeTile }) {
  return (
    <div
      className="relative mr-3 h-full shrink-0 md:mr-4"
      style={{ aspectRatio: tile.aspect ?? 1.5 }}
    >
      {/* Inner element does the hover lift, so it isn't clipped by the track. */}
      <div className="h-full w-full overflow-hidden border border-line bg-[#d9d9d9] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-3 hover:shadow-2xl hover:shadow-black/25">
        {tile.src ? (
          // eslint-disable-next-line @next/next/no-img-element -- carousel tile, intentionally plain <img>
          <img
            src={tile.src}
            alt={tile.alt ?? ""}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[11px] uppercase tracking-body text-muted">
              photo
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * One full-bleed carousel row. Drifts at `baseSpeed` and speeds up with page
 * scroll velocity (rAF transform, seamless wrap via a duplicated set). Hovering
 * the row pauses it; hovering a tile lifts it like picking up a card.
 *
 * Horizontal overflow is clipped by the parent section's `overflow-hidden`, so
 * the row itself doesn't clip vertically — letting the hover lift show.
 */
export function Marquee({
  tiles,
  direction,
  baseSpeed = 28,
  velocityFactor = 0.25,
  velocityRef,
}: MarqueeProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const scrolling = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let raf = 0;
    let last = performance.now();
    let visible = false;
    const tick = (t: number) => {
      const dt = Math.min(0.05, Math.max(0, (t - last) / 1000));
      last = t;
      const vel = Math.abs(velocityRef.current);

      // The browser freezes :hover during active scroll, which would otherwise
      // leave a card stuck lifted. Drop pointer-events while scrolling so the
      // hover releases (the card lowers).
      const isScrolling = vel > 40;
      if (isScrolling !== scrolling.current) {
        scrolling.current = isScrolling;
        if (rowRef.current) {
          rowRef.current.style.pointerEvents = isScrolling ? "none" : "";
        }
      }

      const setWidth = setRef.current?.offsetWidth ?? 0;
      if (setWidth > 0 && !reduce) {
        const speed = baseSpeed + vel * velocityFactor;
        let next = offset.current + speed * direction * dt;
        // Keep within (-setWidth, 0] so the duplicated set wraps seamlessly.
        next = (((next % setWidth) + setWidth) % setWidth) - setWidth;
        offset.current = next;
        track.style.transform = `translate3d(${next}px,0,0)`;
      }
      // Stop scheduling frames while the row is off-screen (or motion reduced).
      if (visible && !reduce) raf = requestAnimationFrame(tick);
      else raf = 0;
    };

    const start = () => {
      if (raf) return;
      // Reset the clock so the first resumed frame has a small dt, not a jump.
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    // Pause the drift whenever the row scrolls off-screen.
    const stopObserving = observeVisibility(rowRef.current ?? track, (v) => {
      visible = v;
      if (v && !reduce) start();
      else stop();
    });

    return () => {
      stopObserving();
      stop();
    };
  }, [baseSpeed, velocityFactor, direction, velocityRef]);

  return (
    <div ref={rowRef} className="relative h-[clamp(150px,26vw,330px)]">
      <div ref={trackRef} className="flex h-full w-max will-change-transform">
        <div ref={setRef} className="flex h-full">
          {tiles.map((tile, i) => (
            <Tile key={`a-${i}`} tile={tile} />
          ))}
        </div>
        <div className="flex h-full" aria-hidden>
          {tiles.map((tile, i) => (
            <Tile key={`b-${i}`} tile={tile} />
          ))}
        </div>
      </div>
    </div>
  );
}
