import { type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BoxCorner = "tl" | "tr" | "bl" | "br";

/** Corner-square sizes: `sm` is the vista size, `lg` matches the FAQ accordion. */
export type CornerSize = "sm" | "lg";

const ALL_CORNERS: BoxCorner[] = ["tl", "tr", "bl", "br"];

/** Corner-square Tailwind sizes, shared with the <BoundingGrid> organism. */
export const CORNER_SIZE: Record<CornerSize, string> = {
  sm: "size-1.5",
  lg: "size-[9.5px]",
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
 */
export function BoundingBox({
  corners = ALL_CORNERS,
  cornerSize = "sm",
  color,
  className,
  children,
}: {
  corners?: BoxCorner[];
  cornerSize?: CornerSize;
  color?: string;
  className?: string;
  children?: ReactNode;
}) {
  const style: CSSProperties = {
    backgroundColor: color ?? "var(--color-background)",
  };
  return (
    <div className={cn("relative border border-line", className)} style={style}>
      {children}
      {corners.map((corner) => (
        <span
          key={corner}
          aria-hidden
          className={cn(
            "absolute border border-line bg-white",
            CORNER_SIZE[cornerSize],
            CORNER_POS[corner],
          )}
        />
      ))}
    </div>
  );
}
