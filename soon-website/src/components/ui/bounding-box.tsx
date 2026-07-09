import { type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BoxCorner = "tl" | "tr" | "bl" | "br";

/** Corner-square sizes: `sm` is the vista size, `lg` matches the FAQ accordion,
 *  `xl` matches the past-sponsors map "pin" squares (~15px in stage space). */
export type CornerSize = "sm" | "lg" | "xl";

const ALL_CORNERS: BoxCorner[] = ["tl", "tr", "bl", "br"];

/** Corner-square Tailwind sizes, shared with the <BoundingGrid> organism. */
export const CORNER_SIZE: Record<CornerSize, string> = {
  sm: "size-1.5",
  lg: "size-[9.5px]",
  xl: "size-[15px]",
};

/** Square centered exactly on each box corner (matches the vista frame). */
const CORNER_POS: Record<BoxCorner, string> = {
  tl: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  tr: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  bl: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  br: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
};

/**
 * Decorative bounding box mirroring the carousel/vista frame: a thin `line`
 * border with little corner squares. Purely presentational.
 *
 * - `corners`: which corners show a square (default: all four).
 * - `cornerSize`: `sm` (vista size, default) or `lg` (FAQ accordion size).
 * - `color`: interior fill, any CSS color. Defaults to the page background;
 *   pass `"transparent"` to let whatever's behind show through.
 * - `overlayFrame`: draw the border + corner squares as a non-interactive
 *   layer on top of the children, so inner content (fills, highlights) can
 *   never cover the frame. Defaults to `false` (frame sits behind content).
 */
export function BoundingBox({
  corners = ALL_CORNERS,
  cornerSize = "sm",
  color,
  overlayFrame = false,
  className,
  children,
}: {
  corners?: BoxCorner[];
  cornerSize?: CornerSize;
  color?: string;
  overlayFrame?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const style: CSSProperties = {
    backgroundColor: color ?? "var(--color-background)",
  };
  const cornerSquares = corners.map((corner) => (
    <span
      key={corner}
      aria-hidden
      className={cn(
        "absolute border border-line bg-white",
        CORNER_SIZE[cornerSize],
        CORNER_POS[corner],
      )}
    />
  ));

  if (overlayFrame) {
    return (
      <div className={cn("relative", className)} style={style}>
        {children}
        {/* Frame layer sits above content; never intercepts pointer events. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 border border-line"
        >
          {cornerSquares}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative border border-line", className)} style={style}>
      {children}
      {cornerSquares}
    </div>
  );
}
