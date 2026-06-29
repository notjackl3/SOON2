"use client";

import ShapeGrid from "@/components/shapes/shape-grid";

/**
 * A static ShapeGrid pinned to the left or right edge of its (relative) parent,
 * spanning ~42% of the width and the full height. The grid's own dark vignette
 * is disabled (`fadeColor` transparent); instead a radial CSS mask centered on
 * the edge fades it into the background — the same treatment as the DotField.
 *
 * Interactive: hovering a cell fills it (no trail). The grid sits behind the
 * section content, so the parent must let pointer events through to it (the
 * overlaying content is `pointer-events-none`, with interactive leaves
 * re-enabled). Desktop only.
 */
export function ShapeGridEdge({ side }: { side: "left" | "right" }) {
  const at = side === "left" ? "left center" : "right center";
  const mask = `radial-gradient(ellipse 90% 80% at ${at}, #000 0%, transparent 78%)`;

  return (
    <div
      aria-hidden
      className={`absolute inset-y-0 hidden w-[42%] md:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      <ShapeGrid
        shape="square"
        squareSize={26}
        speed={0.1}
        direction={side === "left" ? "right" : "left"}
        hoverTrailAmount={0}
        borderColor="rgba(205, 206, 216, 0.7)"
        hoverFillColor="rgba(199, 255, 70, 0.6)"
        fadeColor="rgba(0, 0, 0, 0)"
      />
    </div>
  );
}
