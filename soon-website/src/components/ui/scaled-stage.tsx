"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Renders a fixed `width`×`height` design stage scaled proportionally to the
 * available width (no breakpoints — everything zooms together). `cap` limits
 * the scale to 1× and centers the stage (so it never blows up past its natural
 * size); without it the stage fills the width at any scale.
 */
export function ScaledStage({
  width,
  height,
  cap = false,
  className,
  children,
}: {
  width: number;
  height: number;
  cap?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ scale: 1, offsetX: 0, height });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const compute = () => {
      const w = wrap.clientWidth;
      if (!w) return; // hidden — skip
      const scale = cap ? Math.min(w / width, 1) : w / width;
      setLayout({
        scale,
        offsetX: cap ? Math.max(0, (w - width * scale) / 2) : 0,
        height: height * scale,
      });
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [width, height, cap]);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${className ?? ""}`}
      style={{ height: layout.height }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width,
          height,
          transform: `translateX(${layout.offsetX}px) scale(${layout.scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
