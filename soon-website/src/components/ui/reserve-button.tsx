"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Hero CTA. Applications aren't open yet, so clicking pops a small speech
 * bubble ("Application coming SOON") above the button instead of navigating.
 * The bubble auto-dismisses; re-clicking re-shows it and resets the timer.
 */
export function ReserveButton() {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const handleClick = () => {
    setShow(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setShow(false), 2800);
  };

  return (
    <div className="relative inline-flex">
      {/* Speech bubble — sits above the button, tail pointing down at it. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none absolute bottom-full left-0 mb-3 whitespace-nowrap rounded-xl bg-ink px-4 py-2 text-sm uppercase tracking-body text-white shadow-lg transition-all duration-300 ease-out ${
          show
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-1 scale-95 opacity-0"
        }`}
      >
        Application coming{" "}
        <span className="font-display italic normal-case text-accent">SOON</span>
        {/* Tail */}
        <span className="absolute -bottom-1 left-6 size-3 rotate-45 bg-ink" />
      </div>

      <Button onClick={handleClick}>Reserve your room</Button>
    </div>
  );
}
