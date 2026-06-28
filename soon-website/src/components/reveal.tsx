"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

import { observeVisibility } from "./visibility";

/** Same easing the Highlight bar uses, so reveals feel of-a-piece. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

type RevealProps = {
  children: ReactNode;
  /** Element to render as (default `div`). Use `"h2"`, `"p"`, `"form"`, etc.
   *  to *replace* an existing element rather than wrap it in a new div. */
  as?: ElementType;
  /** ms before the reveal starts — stagger siblings by bumping this. */
  delay?: number;
  /** ms transition duration. */
  duration?: number;
  /** Starting vertical offset in px (positive = rises up into place). */
  y?: number;
  /** Starting horizontal offset in px. */
  x?: number;
  /** Starting scale (1 = none, e.g. 0.96 to grow in slightly). */
  scale?: number;
  /** Re-hide when scrolled away and replay on re-entry (default: once). */
  repeat?: boolean;
  /** IntersectionObserver rootMargin — default fires a touch before fully in view. */
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Reveal-on-scroll wrapper: fades + rises its children into place the first time
 * they enter the viewport. Pure CSS transition driven by an IntersectionObserver
 * (shared `observeVisibility`), so it adds no animation-library weight and stays
 * cheap. Renders as `as` (default div) so it can replace the target element
 * rather than nesting an extra wrapper.
 *
 * Reduced motion is handled in CSS (see the `[data-reveal]` rule in globals.css):
 * those users get the content shown immediately with no transform/transition.
 */
export function Reveal({
  children,
  as,
  delay = 0,
  duration = 700,
  y = 20,
  x = 0,
  scale = 1,
  repeat = false,
  rootMargin = "0px 0px -12% 0px",
  className,
  style,
}: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const elRef = useRef<HTMLElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let stop = () => {};
    stop = observeVisibility(
      el,
      (visible) => {
        if (visible) {
          setRevealed(true);
          if (!repeat) stop();
        } else if (repeat) {
          setRevealed(false);
        }
      },
      { rootMargin },
    );
    return () => stop();
  }, [repeat, rootMargin]);

  const hidden = !revealed;
  const transform = hidden
    ? `translate3d(${x}px, ${y}px, 0)${scale !== 1 ? ` scale(${scale})` : ""}`
    : "none";

  const revealStyle: CSSProperties = {
    opacity: hidden ? 0 : 1,
    transform,
    transition: `opacity ${duration}ms ${EASE} ${delay}ms, transform ${duration}ms ${EASE} ${delay}ms`,
    willChange: hidden ? "opacity, transform" : undefined,
    ...style,
  };

  // createElement (not JSX) avoids the "props resolve to never" quirk when the
  // tag is a broad `ElementType`. `data-reveal` lets CSS force the reduced-motion
  // fallback (see globals.css). We only pass `elRef` here (never read `.current`
  // during render), so forwarding the ref object is safe.
  return createElement(
    Tag,
    // eslint-disable-next-line react-hooks/refs -- forwarding the ref object, never reading .current during render
    {
      ref: elRef,
      className,
      style: revealStyle,
      "data-reveal": "",
    },
    children,
  );
}
