"use client";

import { useEffect, useRef, useState } from "react";

import { Portrait } from "@/components/team/portrait";
import { CELL_W, TEAM_COLS, TEAM_GROUPS } from "@/components/team/data";

// Fixed design stage; matches background.svg's natural size. The whole stage
// scales proportionally to the available width (no breakpoints) — a dedicated
// mobile layout comes later.
const STAGE_W = 1440;
const STAGE_H = 967;

export default function SectionTeam() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale: 1, height: STAGE_H });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const compute = () => {
      const scale = wrap.clientWidth / STAGE_W;
      setLayout({ scale, height: STAGE_H * scale });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-white">
      <div
        ref={wrapRef}
        className="relative w-full"
        style={{ height: layout.height }}
      >
        {/* Fixed 1440×967 stage, scaled to the width so everything zooms together */}
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${layout.scale})`,
          }}
        >
          {/* Full background (defines the stage; top aligns with the portraits) */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/team/background.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 size-full"
          />

          {/* Portraits (left) */}
          <div className="absolute left-0 top-0 flex w-[971px] flex-col gap-3 py-[13px]">
            {TEAM_GROUPS.map((group, gi) => (
              <div key={gi} className="flex flex-col">
                {group.map((row, ri) => (
                  <div
                    key={ri}
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${TEAM_COLS}, ${CELL_W}px)`,
                    }}
                  >
                    {row.map((m) => (
                      <Portrait
                        key={m.name}
                        member={m}
                        style={{
                          gridColumn: m.span
                            ? `${m.col + 1} / span ${m.span}`
                            : `${m.col + 1}`,
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Title (right) — pre-rendered SVG */}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/team/who-we-are.svg"
            alt="Who we are"
            className="pointer-events-none absolute"
            style={{ left: 836.68, top: 369.66, width: 518.597 }}
          />
        </div>
      </div>
    </section>
  );
}
