"use client";

import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogDescription,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScaledStage } from "@/components/ui/scaled-stage";
import {
  HEADSHOTS_READY,
  PEOPLE,
  PHOTO,
  STAGE_H,
  STAGE_W,
  type PersonOutline,
} from "@/data/testimonials";

/**
 * Testimonials — the interactive campfire photo (Figma node 459-2).
 *
 * A fixed 1440x883 stage scales proportionally to the width (ScaledStage), so
 * the SVG person-outlines stay locked to the photo at every size. Each outline
 * is drawn in lime by default; hovering fills it with a translucent lime, and
 * clicking (or Enter/Space) opens a modal with that person's info (node 459-156).
 */
export default function SectionTestimonials() {
  const [selected, setSelected] = useState<PersonOutline | null>(null);

  return (
    <section
      id="testimonials"
      className="relative w-full overflow-x-clip bg-white py-8 md:py-16"
    >
      <h2 className="sr-only">What our community says</h2>

      <ScaledStage width={STAGE_W} height={STAGE_H}>
        {/* Group photo */}
        <div
          className="absolute overflow-hidden"
          style={{ left: PHOTO.x, top: PHOTO.y, width: PHOTO.w, height: PHOTO.h }}
        >
          <Image
            src="/testimonials/photo.png"
            alt="The SOON team gathered around a campfire"
            fill
            sizes="900px"
            className="object-cover"
            priority={false}
          />
        </div>

        {/* Interactive outlines overlaying the photo */}
        <svg
          className="absolute inset-0"
          width={STAGE_W}
          height={STAGE_H}
          viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
          fill="none"
        >
          {PEOPLE.map((p) => (
            <path
              key={p.id}
              d={p.path}
              transform={`translate(${p.x} ${p.y})`}
              role="button"
              tabIndex={0}
              aria-label={`Read ${p.name}'s testimonial`}
              stroke="var(--color-accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: "all" }}
              className="cursor-pointer [fill:var(--color-accent)] [fill-opacity:0] transition-[fill-opacity] duration-200 hover:[fill-opacity:0.18] focus:outline-none focus-visible:[fill-opacity:0.25]"
              onClick={() => setSelected(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelected(p);
                }
              }}
            />
          ))}
        </svg>
      </ScaledStage>

      {/* Person modal */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        {selected && (
          <DialogPanel>
            <div className="flex flex-col gap-6 p-8">
              {/* Decorative pixel cluster (brand motif) */}
              <div aria-hidden className="absolute left-6 top-6 flex gap-[2px]">
                <span className="size-[9px] bg-cobalt" />
                <span className="size-[9px] bg-accent" />
                <span className="size-[9px] bg-ink-soft" />
              </div>

              {/* Headshot */}
              <div className="relative h-[148px] w-full overflow-hidden bg-[#d9d9d9]">
                {HEADSHOTS_READY && (
                  <Image
                    src={selected.image}
                    alt={selected.name}
                    fill
                    sizes="330px"
                    className="object-cover"
                  />
                )}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-2">
                  <DialogTitle className="text-[20px] font-medium leading-none tracking-tight text-ink-soft">
                    {selected.name}
                  </DialogTitle>
                  <p className="text-[14px] uppercase leading-none tracking-tight text-muted">
                    {selected.role}
                  </p>
                </div>
                <DialogDescription className="text-[12px] leading-normal tracking-body text-muted">
                  {selected.bio}
                </DialogDescription>
              </div>
            </div>
          </DialogPanel>
        )}
      </Dialog>
    </section>
  );
}
