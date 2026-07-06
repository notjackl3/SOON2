import { Children, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { CORNER_SIZE, type CornerSize } from "@/components/ui/bounding-box";

/**
 * A grid of cells that share a single, continuous frame — the "organism" form of
 * <BoundingBox>. Unlike a row of individual boxes (whose adjacent borders double
 * up and whose corner squares land slightly offset), this draws each interior
 * line exactly once and drops a corner square on *every* lattice intersection, so
 * neighboring cells read as one overlapping grid (the "HAVE BEEN" block).
 *
 * Pass `cols * rows` children — each is placed in one cell, row-major.
 */
export function BoundingGrid({
  cols,
  rows,
  cornerSize = "sm",
  className,
  cellClassName,
  children,
}: {
  cols: number;
  rows: number;
  /** Corner-square size — `sm` (default) or `lg`. */
  cornerSize?: CornerSize;
  /** Classes on the grid container. */
  className?: string;
  /** Classes on every cell wrapper (e.g. `aspect-square flex items-center …`). */
  cellClassName?: string;
  children: ReactNode;
}) {
  // Every (col, row) intersection of the lattice — (cols+1) × (rows+1) nodes.
  const nodes: Array<{ x: number; y: number }> = [];
  for (let y = 0; y <= rows; y++) {
    for (let x = 0; x <= cols; x++) nodes.push({ x, y });
  }

  return (
    <div
      className={cn("relative grid border-l border-t border-line", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {/* Each cell carries only its right + bottom line, so interior edges are
          drawn once and the container's top/left completes the outer frame. */}
      {Children.map(children, (child) => (
        <div className={cn("relative border-b border-r border-line", cellClassName)}>
          {child}
        </div>
      ))}
      {/* Corner squares on every intersection — the overlapping "handles". */}
      {nodes.map(({ x, y }) => (
        <span
          key={`${x}-${y}`}
          aria-hidden
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2 border border-line bg-white",
            CORNER_SIZE[cornerSize],
          )}
          style={{ left: `${(x / cols) * 100}%`, top: `${(y / rows) * 100}%` }}
        />
      ))}
    </div>
  );
}
