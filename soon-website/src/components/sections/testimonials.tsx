"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import TargetCursor from "@/components/TargetCursor";
import { ScaledStage } from "@/components/ui/scaled-stage";
import { cn } from "@/lib/utils";
import {
  PEOPLE,
  PHOTO,
  STAGE_H,
  STAGE_W,
  type PersonOutline,
} from "@/data/testimonials";

/**
 * Testimonials — the interactive campfire photo (Figma node 459-2).
 *
 * Outlines are invisible at rest; hovering shows a lime stroke + translucent
 * fill. Clicking a person slides the photo (and its outlines) to the right and
 * flickers a static info card in on the left, at the photo's height. Switching
 * people keeps the shifted layout (the card re-flickers); closing (click-away /
 * Esc / clicking the same person / scrolling away) flickers the card out and
 * slides the photo back. A react-bits TargetCursor reticle frames each outline
 * while the pointer is over the section.
 */

const MODAL_W = 330;
const MODAL_H = 410;
const SHIFT = 210; // px the photo slides right to make room for the card
const MODAL_X = 72; // card rest position (left), static
const MODAL_Y = PHOTO.y + (PHOTO.h - MODAL_H) / 2; // vertically centred on photo

export default function SectionTestimonials() {
  const [selected, setSelected] = useState<PersonOutline | null>(null);
  const [closing, setClosing] = useState(false);
  const [inView, setInView] = useState(false);
  const [active, setActive] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0 }); // last cursor, viewport px
  const inViewRef = useRef(false);
  const closingRef = useRef(false);
  const closeTimer = useRef(0);

  // Is the cursor over the section? (drives the target cursor.)
  const evalActive = () => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    const { x, y } = pointer.current;
    const inside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    setActive((prev) => (prev === inside ? prev : inside));
  };

  const open = (person: PersonOutline) => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = 0;
    }
    closingRef.current = false;
    setClosing(false);
    setSelected(person);
  };
  // Flicker the card out + slide the photo back, then unmount.
  const close = () => {
    if (!selected || closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = 0;
      closingRef.current = false;
      setClosing(false);
      setSelected(null);
    }, 340);
  };
  const toggle = (person: PersonOutline) =>
    selected?.id === person.id ? close() : open(person);

  // Track the pointer globally (ref only) so we always know where it is, even
  // when the section scrolls under a stationary cursor.
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (inViewRef.current) evalActive();
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute `active` on scroll (reveals the cursor when the section scrolls
  // under a stationary pointer), and once on entering view.
  useEffect(() => {
    if (!inView) return;
    const onScroll = () => evalActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    evalActive();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  // Mount the TargetCursor only while the section is on-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        inViewRef.current = e.isIntersecting;
        setInView(e.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Esc closes.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Scrolling the section out of view dismisses the card.
  useEffect(() => {
    if (!inView && selected) close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, selected]);

  const shifted = selected !== null && !closing;

  return (
    <section
      ref={sectionRef}
      id="testimonials"
      className="relative w-full overflow-x-clip bg-surface py-8 md:py-16"
    >
      <h2 className="sr-only">What our community says</h2>

      {inView && (
        <TargetCursor
          targetSelector=".cursor-target"
          cursorColor="#c7ff46"
          active={active}
          pointerRef={pointer}
        />
      )}

      <ScaledStage width={STAGE_W} height={STAGE_H}>
        {/* Click-away layer (below the photo group; the group is pointer-events-
            none except the outline paths, so photo/background clicks fall
            through to here and close). */}
        {selected && (
          <button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 z-10 cursor-default"
            onClick={close}
          />
        )}

        {/* Photo + outlines — slides right to make room for the card */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-transform duration-300 ease-out will-change-transform"
          style={{ transform: shifted ? `translateX(${SHIFT}px)` : "translateX(0)" }}
        >
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
            />
          </div>

          <svg
            className="absolute inset-0"
            width={STAGE_W}
            height={STAGE_H}
            viewBox={`0 0 ${STAGE_W} ${STAGE_H}`}
            fill="none"
          >
            {PEOPLE.map((person) => {
              const isSelected = selected?.id === person.id;
              return (
                <path
                  key={person.id}
                  d={person.path}
                  transform={`translate(${person.x} ${person.y})`}
                  fillRule="evenodd"
                  role="button"
                  tabIndex={0}
                  aria-label={`Read ${person.name}'s testimonial`}
                  fill="var(--color-accent)"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ pointerEvents: "all" }}
                  className={cn(
                    "cursor-target transition-[stroke-opacity,fill-opacity] duration-200 focus:outline-none",
                    isSelected
                      ? "[fill-opacity:0.18] [stroke-opacity:1]"
                      : "[fill-opacity:0] [stroke-opacity:0] hover:[fill-opacity:0.18] hover:[stroke-opacity:1] focus-visible:[fill-opacity:0.25] focus-visible:[stroke-opacity:1]",
                  )}
                  onClick={() => toggle(person)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggle(person);
                    }
                  }}
                />
              );
            })}
          </svg>
        </div>

        {/* Info card — static, on the left, at the photo's height */}
        {selected && (
          <div
            key={selected.id}
            data-testimonial-popup
            role="dialog"
            aria-label={selected.name}
            className="absolute z-40"
            style={{
              left: MODAL_X,
              top: MODAL_Y,
              width: MODAL_W,
              height: MODAL_H,
              animation: closing
                ? "testimonial-flicker-out 0.34s ease forwards"
                : "sponsor-flicker 0.5s ease both",
            }}
          >
            <div className="relative h-full w-full overflow-hidden border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
              <img
                src="/testimonials/union.svg"
                alt=""
                aria-hidden
                className="pointer-events-none absolute"
                style={{
                  left: 101,
                  top: 196,
                  width: 255.7,
                  height: 244.74,
                  transform: "rotate(180deg)",
                }}
              />

              <div className="relative flex h-full flex-col gap-4 p-8">
                {selected.image && (
                  <div className="relative h-[148px] w-full shrink-0 overflow-hidden bg-[#d9d9d9]">
                    <Image
                      src={selected.image}
                      alt={selected.name}
                      fill
                      sizes="266px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex min-h-0 flex-1 flex-col gap-3.5">
                  <div className="flex flex-col gap-2">
                    <p className="text-[20px] font-medium leading-none tracking-tight text-ink-soft">
                      {selected.name}
                    </p>
                    <p className="text-[14px] uppercase leading-none tracking-tight text-muted">
                      {selected.role}
                    </p>
                  </div>
                  <p className="flex-1 overflow-hidden text-[12px] leading-normal tracking-body text-muted">
                    {selected.bio}
                  </p>
                </div>

                {/* Read-more pill (design-system accent pill, as a link) */}
                {selected.linkedin && (
                  <a
                    href={selected.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Read ${selected.name}'s post on LinkedIn`}
                    className="cursor-target inline-flex w-fit shrink-0 items-center gap-1.5 rounded-[22px] border-[1.5px] border-[#a8e618] bg-accent/30 px-3.5 py-1.5 text-[10px] uppercase tracking-tight text-ink transition-colors hover:bg-accent/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- brand icon */}
                    <img src="/footer/linkedin.svg" alt="" aria-hidden className="size-3" />
                    Read more on LinkedIn
                  </a>
                )}
              </div>

              {/* Footer pixel cluster (top-left, over the image corner) */}
              <div aria-hidden>
                <span className="absolute left-[27px] top-[27px] size-[10.75px] bg-cobalt" />
                <span className="absolute left-[37.75px] top-[37.75px] size-[10.75px] bg-cobalt" />
                <span className="absolute left-[48.5px] top-[27px] size-[10.75px] bg-accent" />
                <span className="absolute left-[59.25px] top-[27px] size-[10.75px] bg-ink-soft" />
              </div>

              {/* Image-overlay pixels (bottom-right of the headshot) */}
              <div aria-hidden>
                <span className="absolute left-[293px] top-[153px] size-[11px] bg-accent" />
                <span className="absolute left-[282px] top-[164px] size-[11px] bg-cobalt" />
                <span className="absolute left-[271px] top-[176px] size-[11px] bg-accent" />
              </div>
            </div>

            {/* Corner squares (outside the clipped body) */}
            {[
              "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
              "right-0 top-0 translate-x-1/2 -translate-y-1/2",
              "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
              "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
            ].map((corner) => (
              <span
                key={corner}
                aria-hidden
                className={cn(
                  "pointer-events-none absolute size-[9.5px] border border-line bg-white",
                  corner,
                )}
              />
            ))}
          </div>
        )}
      </ScaledStage>
    </section>
  );
}
