"use client";

import { useState } from "react";

import { Reveal } from "@/components/reveal";

import { FAQS, type FaqEntry } from "./data";

/** Squares centered exactly on the box corners (same motif as the guest vistas). */
const CORNER_POS = [
  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
];

/**
 * The accordion stack. Only one row is open at a time — opening a row collapses
 * any other. Expanding a row pushes only the rows below it (the heading and the
 * static background vectors are unaffected).
 */
export function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="pointer-events-none relative flex flex-col gap-4">
      {FAQS.map((faq, i) => (
        <Reveal key={faq.question} delay={i * 70} y={16}>
          <FaqItem
            {...faq}
            open={openIndex === i}
            onToggle={() => setOpenIndex((cur) => (cur === i ? null : i))}
          />
        </Reveal>
      ))}
    </div>
  );
}

/**
 * A single FAQ row: a bordered bounding box with a corner square at each
 * corner. Clicking the header toggles the box open, revealing the answer; the
 * "+" glyph rotates 45° into an "✕". The box grows with its content via a
 * `grid-template-rows` 0fr→1fr transition (animates to auto height).
 */
function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: FaqEntry & { open: boolean; onToggle: () => void }) {
  return (
    <div className="pointer-events-auto relative border border-line bg-white">
      {CORNER_POS.map((pos) => (
        <span
          key={pos}
          aria-hidden
          className={`absolute z-10 size-[9.5px] border border-line bg-white ${pos}`}
        />
      ))}

      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-4 text-left transition-colors md:px-7.5 ${
          open ? "" : "hover:bg-surface/60"
        }`}
      >
        <span className="font-sans text-[clamp(15px,1.7vw,20px)] font-bold tracking-tight text-ink-soft">
          {question}
        </span>
        <PlusGlyph open={open} />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="px-6 pb-6 text-body leading-normal tracking-body text-muted md:px-7.5 md:pb-7">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Cobalt plus that rotates 45° into an ✕ when the item is open. */
function PlusGlyph({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative size-3.75 shrink-0 text-cobalt transition-transform duration-300 ${
        open ? "rotate-45" : ""
      }`}
    >
      <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-current" />
    </span>
  );
}
