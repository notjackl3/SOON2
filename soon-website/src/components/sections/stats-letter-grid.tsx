"use client";

import { useEffect, useState } from "react";

import { BoundingGrid } from "@/components/ui/bounding-grid";
import { cn } from "@/lib/utils";

/**
 * The "Where our hackers HAVE BEEN" letter grid. Each cell is a flip card: the
 * front shows one letter of H·A·V·E·B·E·E·N, the back a hacker-company logo.
 * Pointer devices flip on hover; touch devices flip on tap (persisted in state).
 * Logos are paired to letters in filename order, reading L-to-R / top-to-bottom.
 */
const LOGO_DIR = "/past-sponsors/hacker-companies";

type Cell = { letter: string; name: string; logo: string };

const CELLS: Cell[] = [
  { letter: "H", name: "Amazon", logo: `${LOGO_DIR}/amazon.png` },
  { letter: "A", name: "Capital One", logo: `${LOGO_DIR}/capital-one.png` },
  { letter: "V", name: "IBM", logo: `${LOGO_DIR}/ibm.png` },
  { letter: "E", name: "Nasdaq", logo: `${LOGO_DIR}/nasdaq.png` },
  { letter: "B", name: "Robinhood", logo: `${LOGO_DIR}/robinhood.png` },
  { letter: "E", name: "Roblox", logo: `${LOGO_DIR}/roblox.png` },
  { letter: "E", name: "Shopify", logo: `${LOGO_DIR}/shopify.png` },
  { letter: "N", name: "Wealthsimple", logo: `${LOGO_DIR}/wealthsimple.png` },
];

export function StatsLetterGrid() {
  // Cells tapped open (touch); hover handles pointer devices via CSS.
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  // Idle attractor: with nothing hovered/tapped, flip one random cell at a
  // time (never the same twice in a row) to hint the grid is interactive.
  const [autoIdx, setAutoIdx] = useState<number | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let prev = -1;
    const flip = () => {
      let next = Math.floor(Math.random() * CELLS.length);
      if (next === prev) next = (next + 1) % CELLS.length;
      prev = next;
      setAutoIdx(next);
      timer = setTimeout(() => {
        setAutoIdx(null);
        timer = setTimeout(flip, 900); // pause with all cells resting
      }, 1400); // dwell time on the flipped cell
    };
    timer = setTimeout(flip, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <BoundingGrid
      cols={4}
      rows={2}
      cornerSize="lg"
      cellClassName="group relative aspect-square perspective-[1000px]"
    >
      {CELLS.map((cell, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${cell.letter} — ${cell.name}`}
          onClick={() => toggle(i)}
          data-flip
          className={cn(
            "absolute inset-0 cursor-pointer bg-transparent transform-3d transition-transform duration-500 group-hover:rotate-y-180",
            (open.has(i) || autoIdx === i) && "rotate-y-180",
          )}
        >
          {/* Front — letter */}
          <span className="absolute inset-0 flex items-center justify-center backface-hidden font-display text-[clamp(48px,7vw,94px)] leading-none tracking-tight text-ink">
            {cell.letter}
          </span>
          {/* Back — company logo on an inset opaque panel: just large enough to
              mask the letter on the (coplanar) front face behind it (transparent
              logos would otherwise reveal it), but pulled off the cell edges so the
              grid frame lines and corner pins stay clean. */}
          <span className="absolute inset-0 flex items-center justify-center backface-hidden rotate-y-180">
            <span className="flex h-4/5 w-4/5 items-center justify-center bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- small logo */}
              <img
                src={cell.logo}
                alt={cell.name}
                className="max-h-[70%] max-w-[85%] object-contain"
              />
            </span>
          </span>
        </button>
      ))}
    </BoundingGrid>
  );
}
