"use client";

import { useEffect, useRef, useState } from "react";

import { observeVisibility } from "@/lib/visibility";

interface CountUpProps {
  /** Display target, e.g. "70" or "09" — leading zeros are preserved. */
  value: string;
  /** ms the count takes. */
  duration?: number;
  /** ms before counting starts (stagger). */
  delay?: number;
  /** Re-run the count each time it re-enters the viewport. */
  repeat?: boolean;
  rootMargin?: string;
  className?: string;
}

/** Pad an integer back to the target's width so "09"/"01" keep their zero. */
function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

/**
 * Counts a number up from zero to `value` the first time it scrolls into view
 * (rAF + ease-out). SSR renders the final value, so it's correct without JS and
 * for crawlers; on the client it primes to zero while off-screen, then animates.
 * Reduced-motion users keep the final value (no animation).
 */
export function CountUp({
  value,
  duration = 1100,
  delay = 0,
  repeat = false,
  // Positive bottom margin: fire just *before* the number scrolls in, so the
  // prime-to-zero happens off-screen and the user only ever sees it count up.
  rootMargin = "0px 0px 80px 0px",
  className,
}: CountUpProps) {
  const target = parseInt(value, 10) || 0;
  const width = value.length;
  const [display, setDisplay] = useState(value);
  const elRef = useRef<HTMLSpanElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Reduced motion: leave the final value (already the initial state).
    if (reduce) return;

    const clear = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
      rafRef.current = null;
      timerRef.current = null;
    };

    const run = () => {
      const begin = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - begin) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setDisplay(pad(Math.round(target * eased), width));
        if (t < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    const stop = observeVisibility(
      el,
      (visible) => {
        if (visible) {
          clear();
          // Prime to zero in the (off-screen) callback, then count up.
          setDisplay(pad(0, width));
          timerRef.current = setTimeout(run, delay);
          if (!repeat) stop();
        } else if (repeat) {
          clear();
          setDisplay(pad(0, width));
        }
      },
      { rootMargin },
    );

    return () => {
      stop();
      clear();
    };
  }, [target, width, duration, delay, repeat, rootMargin]);

  return (
    <span ref={elRef} className={className}>
      {display}
    </span>
  );
}
