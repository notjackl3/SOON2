"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { Reveal } from "@/components/ui/reveal";
import { FADE_ID } from "@/components/three/constants";
import { cn } from "@/lib/utils";

/** Same easing the Reveal/Highlight components use. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Padding the closed banner keeps around the measured headline. */
const PAD_X = 44;
const PAD_Y = 48;

type Edge = "l" | "r" | "t" | "b";
/** Per-edge expansion, 0 = at the closed banner, 1 = at the container edge. */
type Edges = Record<Edge, number>;

const CLOSED: Edges = { l: 0, r: 0, t: 0, b: 0 };
const OPEN: Edges = { l: 1, r: 1, t: 1, b: 1 };

const CORNERS: {
  corner: "tl" | "tr" | "bl" | "br";
  /** The two edges this corner drags. */
  ex: "l" | "r";
  ey: "t" | "b";
  pos: string;
  cursor: string;
  /** Where the bobbing hint arrow sits, and its outward rotation. */
  arrowPos: string;
  arrowDeg: number;
}[] = [
  { corner: "tl", ex: "l", ey: "t", pos: "left-0 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-nwse-resize", arrowPos: "-left-8 -top-8", arrowDeg: -45 },
  { corner: "tr", ex: "r", ey: "t", pos: "right-0 top-0 translate-x-1/2 -translate-y-1/2", cursor: "cursor-nesw-resize", arrowPos: "-right-8 -top-8", arrowDeg: 45 },
  { corner: "bl", ex: "l", ey: "b", pos: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2", cursor: "cursor-nesw-resize", arrowPos: "-left-8 -bottom-8", arrowDeg: -135 },
  { corner: "br", ex: "r", ey: "b", pos: "right-0 bottom-0 translate-x-1/2 translate-y-1/2", cursor: "cursor-nwse-resize", arrowPos: "-right-8 -bottom-8", arrowDeg: 135 },
];

type HiddenItem = {
  kind: "photo" | "quote";
  style: CSSProperties;
  /** Replacement position/size for the stacked mobile composition. */
  mobileStyle: CSSProperties;
  title: string;
  body: string;
  /** Photo cards only: image under public/. */
  src?: string;
};

/** Content on the hidden layer — quotes still lorem for now. */
const HIDDEN_ITEMS: HiddenItem[] = [
  {
    kind: "photo",
    style: { left: "3%", top: "5%", width: "24%" },
    mobileStyle: { left: "5%", top: "4%", width: "46%" },
    title: "",
    body: "",
    src: "/concept/dsc-0108.jpg",
  },
  {
    kind: "quote",
    style: { left: "33%", top: "4%", width: "31%" },
    mobileStyle: { right: "5%", top: "5%", width: "40%" },
    title: "— Lorem I.",
    body: "“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.”",
  },
  {
    kind: "quote",
    style: { right: "4%", top: "13%", width: "21%" },
    mobileStyle: { left: "7%", top: "31%", width: "70%" },
    title: "— Dolor S.",
    body: "“Excepteur sint occaecat cupidatat non proident, sunt in culpa.”",
  },
  {
    kind: "quote",
    style: { left: "4%", bottom: "13%", width: "27%" },
    mobileStyle: { right: "7%", bottom: "24%", width: "70%" },
    title: "— Ipsum D.",
    body: "“Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.”",
  },
  {
    kind: "quote",
    style: { left: "38%", bottom: "5%", width: "21%" },
    mobileStyle: { left: "5%", bottom: "5%", width: "40%" },
    title: "— Amet C.",
    body: "“Sed ut perspiciatis unde omnis iste natus error sit voluptatem.”",
  },
  {
    kind: "photo",
    style: { right: "4%", bottom: "5%", width: "23%" },
    mobileStyle: { right: "5%", bottom: "4%", width: "46%" },
    title: "",
    body: "",
    src: "/concept/img-5244.jpg",
  },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

// Cards are always painted at full opacity — the clip window uncovers them the
// moment an edge is dragged over them, like a real layer sitting behind.
function HiddenCard({ item, isMobile }: { item: HiddenItem; isMobile: boolean }) {
  const style = isMobile ? item.mobileStyle : item.style;

  if (item.kind === "photo") {
    return (
      <figure
        className="absolute aspect-3/2 overflow-hidden border border-line bg-surface"
        style={style}
      >
        {item.src && (
          <Image
            src={item.src}
            alt="Inside the SOON hacker house"
            fill
            sizes="(max-width: 768px) 50vw, 420px"
            className="object-cover"
          />
        )}
      </figure>
    );
  }

  return (
    <blockquote className="absolute flex flex-col gap-2" style={style}>
      <p className="font-display text-[clamp(15px,1.6vw,22px)] italic leading-snug text-ink">
        {item.body}
      </p>
      <footer className="text-[11px] uppercase tracking-wide text-muted">{item.title}</footer>
    </blockquote>
  );
}

/**
 * Final slide of the 3D sequence: the "Ready to build something meaningful?"
 * banner rebuilt as a live selection frame. The closed box hugs the measured
 * headline (so it matches the original artwork), and each corner handle drags
 * its own two edges outward — 1:1 with the cursor, independent of the other
 * edges — uncovering a hidden layer of images/quotes/facts (lorem for now).
 * The reveal is a clip-path window over a full-size sheet, so the hidden
 * content stays pinned in place while the window grows. Holds {@link FADE_ID}
 * so the 3D background fades out as we glide past.
 */
export default function SectionSpill() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headlineRef = useRef<HTMLDivElement | null>(null);
  const [bounds, setBounds] = useState<{ w: number; h: number } | null>(null);
  const [headline, setHeadline] = useState<{ w: number; h: number } | null>(null);

  // On phones the layer is open from the start — no drag interaction.
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const [edges, setEdges] = useState<Edges>(CLOSED);
  const edgesRef = useRef<Edges>(CLOSED);
  const updateEdges = (next: Edges) => {
    edgesRef.current = next;
    setEdges(next);
  };

  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    ex: "l" | "r";
    ey: "t" | "b";
    x: number;
    y: number;
    start: Edges;
    moved: number;
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const head = headlineRef.current;
    if (!container || !head) return;
    const ro = new ResizeObserver(() => {
      const c = container.getBoundingClientRect();
      const h = head.getBoundingClientRect();
      setBounds({ w: c.width, h: c.height });
      setHeadline({ w: h.width, h: h.height });
    });
    ro.observe(container);
    ro.observe(head);
    return () => ro.disconnect();
  }, []);

  const ready = bounds !== null && headline !== null;
  // Closed banner hugs the headline; the gap to the container edge is what a
  // fully-dragged edge travels.
  const baseW = ready ? Math.min(headline.w + PAD_X, bounds.w) : 0;
  const baseH = ready ? Math.min(headline.h + PAD_Y, bounds.h) : 0;
  const maxX = ready ? Math.max(1, (bounds.w - baseW) / 2) : 1;
  const maxY = ready ? Math.max(1, (bounds.h - baseH) / 2) : 1;

  const shown = isMobile ? OPEN : edges;
  const inset = {
    l: maxX * (1 - shown.l),
    r: maxX * (1 - shown.r),
    t: maxY * (1 - shown.t),
    b: maxY * (1 - shown.b),
  };

  const onPointerDown = (e: ReactPointerEvent, ex: "l" | "r", ey: "t" | "b") => {
    if (!ready) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      ex,
      ey,
      x: e.clientX,
      y: e.clientY,
      start: { ...edgesRef.current },
      moved: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    // 1:1 with the cursor: each edge tracks its own axis only.
    updateEdges({
      ...edgesRef.current,
      [d.ex]: clamp01(d.start[d.ex] + (d.ex === "l" ? -dx : dx) / maxX),
      [d.ey]: clamp01(d.start[d.ey] + (d.ey === "t" ? -dy : dy) / maxY),
    });
  };

  const onPointerEnd = () => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    setDragging(false);
    const cur = edgesRef.current;
    if (d.moved < 4) {
      // A tap toggles this corner's two edges together.
      const open = (d.start[d.ex] + d.start[d.ey]) / 2 < 0.5 ? 1 : 0;
      updateEdges({ ...cur, [d.ex]: open, [d.ey]: open });
    } else {
      // Settle edges that ended near an extreme; leave the rest where dragged.
      const settle = (v: number) => (v < 0.15 ? 0 : v > 0.85 ? 1 : v);
      updateEdges({ ...cur, [d.ex]: settle(cur[d.ex]), [d.ey]: settle(cur[d.ey]) });
    }
  };

  const onHandleKeyDown = (e: KeyboardEvent, ex: "l" | "r", ey: "t" | "b") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const cur = edgesRef.current;
      const open = (cur[ex] + cur[ey]) / 2 < 0.5 ? 1 : 0;
      updateEdges({ ...cur, [ex]: open, [ey]: open });
    }
  };

  const maxOpen = Math.max(shown.l, shown.r, shown.t, shown.b);
  const frameTransition = dragging
    ? "none"
    : `clip-path 600ms ${EASE}, left 600ms ${EASE}, right 600ms ${EASE}, top 600ms ${EASE}, bottom 600ms ${EASE}`;

  return (
    <section
      id={FADE_ID}
      className="relative flex h-dvh items-center justify-center px-8 py-10"
    >
      <Reveal y={0} scale={0.96} duration={900} className="h-full w-full">
        <div
          ref={containerRef}
          className="relative h-full w-full select-none"
          style={{ visibility: ready ? undefined : "hidden" }}
        >
          {/* full-size sheet holding the hidden layer + headline, revealed
              through a clip-path window so content stays pinned in place */}
          <div
            className="absolute inset-0 bg-white"
            style={{
              clipPath: `inset(${inset.t}px ${inset.r}px ${inset.b}px ${inset.l}px)`,
              transition: frameTransition,
            }}
          >
            {/* dashed arcs sweeping through the hidden layer, behind the
                cards (one passes under each photo); they sit outside the
                closed window, so they only show once the box is dragged open */}
            {bounds && !isMobile && (
              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0"
                width={bounds.w}
                height={bounds.h}
                fill="none"
                stroke="#CDCED8"
                strokeDasharray="18 14"
              >
                <path
                  d={`M ${-bounds.w * 0.02} ${bounds.h * 0.5} C ${bounds.w * 0.18} ${bounds.h * 0.05}, ${bounds.w * 0.55} ${bounds.h * 0.08}, ${bounds.w * 1.03} ${bounds.h * 0.42}`}
                />
                <path
                  d={`M ${-bounds.w * 0.02} ${bounds.h * 0.7} C ${bounds.w * 0.25} ${bounds.h * 1.0}, ${bounds.w * 0.6} ${bounds.h * 0.98}, ${bounds.w * 1.03} ${bounds.h * 0.58}`}
                />
              </svg>
            )}

            <div aria-hidden={maxOpen === 0} className="pointer-events-none absolute inset-0">
              {HIDDEN_ITEMS.map((item, i) => (
                <HiddenCard key={i} item={item} isMobile={isMobile} />
              ))}
            </div>

            {/* headline — pinned to the container center */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div ref={headlineRef} className="flex flex-col items-start">
                {/* the display line tucks up under this via its negative margin */}
                <span className="whitespace-nowrap text-[clamp(17px,2.7vw,38px)] tracking-body text-black sm:-mb-[0.9em]">
                  Ready to build something
                </span>
                <div className="mt-2 flex items-center gap-3 sm:mt-0 sm:gap-8">
                  <div className="grid w-fit shrink-0 grid-cols-3">
                    <span className="size-5 bg-cobalt sm:size-7 md:size-8" />
                    <span className="size-5 bg-accent sm:size-7 md:size-8" />
                    <span className="size-5 bg-cobalt sm:size-7 md:size-8" />
                    <span className="size-5 bg-accent sm:size-7 md:size-8" />
                    <span className="size-5 bg-cobalt sm:size-7 md:size-8" />
                    <span className="size-5 bg-accent sm:size-7 md:size-8" />
                  </div>
                  <span className="font-display text-[clamp(26px,8.6vw,56px)] italic leading-none text-black sm:text-[clamp(44px,10.4vw,150px)]">
                    meaningful?
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* frame outline + handles, tracking the clip window */}
          <div
            className="absolute border border-line"
            style={{
              left: inset.l,
              right: inset.r,
              top: inset.t,
              bottom: inset.b,
              transition: frameTransition,
            }}
          >
            {!isMobile &&
              CORNERS.map(({ corner, ex, ey, pos, cursor }) => (
                <button
                  key={corner}
                  type="button"
                  aria-label={`Drag the ${corner} corner to resize`}
                  onPointerDown={(e) => onPointerDown(e, ex, ey)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerEnd}
                  onPointerCancel={onPointerEnd}
                  onKeyDown={(e) => onHandleKeyDown(e, ex, ey)}
                  className={cn(
                    "group absolute z-20 flex size-10 touch-none items-center justify-center",
                    pos,
                    cursor,
                  )}
                >
                  <span className="block size-5 border border-line bg-white transition-transform duration-300 group-hover:scale-125" />
                </button>
              ))}

            {/* bobbing outward arrows hinting that the corners drag */}
            {CORNERS.map(({ corner, arrowPos, arrowDeg }, i) => (
              <span
                key={`arrow-${corner}`}
                aria-hidden
                className={cn("pointer-events-none absolute z-10 text-muted", arrowPos)}
                style={{
                  transform: `rotate(${arrowDeg}deg)`,
                  opacity: 1 - maxOpen,
                  transition: dragging ? "none" : `opacity 400ms ${EASE}`,
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="spill-bob"
                  style={{
                    animation: `spill-bob 1.5s ease-in-out ${i * 0.2}s infinite`,
                  }}
                >
                  <path d="M8 14V3M3.5 7.5 8 3l4.5 4.5" />
                </svg>
              </span>
            ))}

            {/* affordance hint, fades as soon as any edge opens */}
            <span
              className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-muted"
              style={{
                opacity: 1 - maxOpen,
                transition: dragging ? "none" : `opacity 400ms ${EASE}`,
              }}
            >
              drag a corner
            </span>

            {/* the little asterisks from the artwork, fading as the box grows */}
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/concept/right-asterik.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -left-14 top-[40%] hidden h-7 md:block"
              style={{ opacity: 1 - maxOpen }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
            <img
              src="/concept/right-asterik.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -left-14 top-[55%] hidden h-7 md:block"
              style={{ opacity: 1 - maxOpen }}
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
