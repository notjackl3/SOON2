"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/** What makes the bar expand. Use `active` instead for fully controlled mode. */
export type HighlightTrigger = "in-view" | "hover" | "click" | "scroll";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const toCssLength = (v: number | string | undefined) =>
  typeof v === "number" ? `${v}px` : v;

/**
 * A highlight bar that grows from 0 → full width (scaleX, anchored left) when
 * triggered, then sits behind any `children`. Mirrors the hero/stat
 * "highlight-behind-text" pattern but animates in.
 *
 * - Wrap text to highlight it: the bar fills the text's box.
 * - Omit `children` + pass `width`/`height` for a standalone bar.
 * - `color` defaults to the accent green (`--color-accent`).
 * - Drive it with a `trigger`, or pass `active` to control it yourself.
 */
export function Highlight({
  children,
  trigger = "in-view",
  color,
  width,
  height = "0.6em",
  duration = 600,
  delay = 0,
  ease = "cubic-bezier(0.22, 1, 0.36, 1)",
  once = true,
  active,
  rootMargin = "0px 0px -30% 0px",
  scrubMs = 160,
  revealDelay = 0,
  className,
  barClassName = "inset-0",
}: {
  /** Content to sit in front of the bar. Omit for a standalone bar. */
  children?: ReactNode;
  /** What expands the bar. Ignored when `active` is provided. */
  trigger?: HighlightTrigger;
  /** Bar color; defaults to accent green. */
  color?: string;
  /** Fixed width (number → px). Omit to fill the children/container. */
  width?: number | string;
  /** Standalone-bar height, used only when there are no `children`. */
  height?: number | string;
  /** Animation duration in ms. */
  duration?: number;
  /** Animation delay in ms. */
  delay?: number;
  /** CSS easing for the expansion. */
  ease?: string;
  /** in-view/hover/click: animate once vs. retract when the trigger ends. */
  once?: boolean;
  /** Controlled mode: drive expansion yourself, ignoring `trigger`. */
  active?: boolean;
  /**
   * in-view only: IntersectionObserver rootMargin. The default shrinks the
   * viewport's bottom 30% so the bar fires when the element is ~30% up from
   * the bottom — not right at the edge where it'd be missed.
   */
  rootMargin?: string;
  /**
   * scroll only: transition (ms) applied to scroll-scrubbed fill updates once
   * the initial reveal has played. Small enough to track the scroll, long
   * enough to smooth out per-frame jitter.
   */
  scrubMs?: number;
  /** scroll only: wait this many ms after mount before the opening reveal plays. */
  revealDelay?: number;
  /** Classes on the wrapper (positioning, text styles, …). */
  className?: string;
  /** Classes on the bar itself — override to let it bleed past the text. */
  barClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [internal, setInternal] = useState(false);
  const [reduced, setReduced] = useState(false);
  // scroll mode: `scrollFill` tracks scroll position, but the displayed fill is
  // gated behind `mounted` so the very first paint is always scaleX(0) — even if
  // a scroll/resize event lands early — giving a guaranteed left→right reveal.
  // `revealed` flips once the opening animation is done so later updates use the
  // snappier scrub transition.
  const [scrollFill, setScrollFill] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const isControlled = active !== undefined;
  const isScroll = !isControlled && trigger === "scroll";
  const expanded = isControlled ? active : internal;
  const hasChildren = children != null && children !== false;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (isControlled || trigger !== "in-view") return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInternal(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInternal(false);
        }
      },
      { threshold: 0, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [isControlled, trigger, once, rootMargin]);

  useEffect(() => {
    if (!isScroll) return;
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    // Fill = how much of the element still sits below the viewport's top edge.
    // 1 while it's comfortably in view; eases to 0 as it scrolls off the top,
    // and back to 1 when scrolled into view again.
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const travel = rect.height * 1.6;
      setScrollFill(travel > 0 ? clamp01(rect.bottom / travel) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    // Measure right away so scrollFill is correct, but hold the mount gate for
    // `revealDelay` so the empty bar sits visibly before it sweeps open.
    compute();
    const openTimer = window.setTimeout(() => setMounted(true), revealDelay);
    const revealTimer = window.setTimeout(
      () => setRevealed(true),
      revealDelay + duration + 60,
    );
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(openTimer);
      window.clearTimeout(revealTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isScroll, duration, revealDelay]);

  const handlers =
    isControlled || trigger === "in-view" || trigger === "scroll"
      ? {}
      : trigger === "hover"
        ? {
            onMouseEnter: () => setInternal(true),
            onMouseLeave: () => {
              if (!once) setInternal(false);
            },
          }
        : {
            onClick: () => setInternal((v) => (once ? true : !v)),
          };

  const fill = isScroll ? (mounted ? scrollFill : 0) : expanded ? 1 : 0;
  // Long opening animation on mount/reveal; snappier while scrubbing to scroll.
  const activeMs = isScroll && revealed ? scrubMs : duration;
  const activeDelay = isScroll && revealed ? 0 : delay;

  const barStyle: CSSProperties = {
    backgroundColor: color ?? "var(--color-accent)",
    transformOrigin: "left center",
    transform: `scaleX(${fill})`,
    transition: reduced ? "none" : `transform ${activeMs}ms ${ease} ${activeDelay}ms`,
  };

  const wrapperStyle: CSSProperties = {
    width: toCssLength(width),
    height: hasChildren ? undefined : toCssLength(height),
  };

  return (
    <span
      ref={ref}
      className={`relative ${hasChildren ? "inline-flex" : "block"} ${className ?? ""}`}
      style={wrapperStyle}
      {...handlers}
    >
      <span aria-hidden className={`absolute ${barClassName}`} style={barStyle} />
      {hasChildren ? <span className="relative">{children}</span> : null}
    </span>
  );
}
