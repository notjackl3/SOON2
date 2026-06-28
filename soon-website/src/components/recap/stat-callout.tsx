import { BoundingBox } from "@/components/bounding-box";
import { Highlight } from "@/components/highlight";

/**
 * A recap stat: big Playfair number stacked over an Inter label that sits on an
 * accent-green highlight (the Figma "Union" shape). The highlight grows in via
 * <Highlight> when the stat scrolls into view.
 */
export function StatCallout({
  value,
  label,
  align = "left",
  className,
}: {
  value: string;
  label: string;
  align?: "left" | "right";
  /** Positioning utilities applied to the wrapper (e.g. absolute placement). */
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col ${align === "right" ? "items-end" : "items-start"} ${className ?? ""}`}
    >
      <BoundingBox cornerSize="lg" className="z-10 px-3 pb-2 pt-0">
        <span className="mt-[-0.16em] block font-display text-[clamp(64px,13vw,200px)] leading-[0.8] tracking-tight text-black">
          {value}
        </span>
      </BoundingBox>
      {/* accent highlight, bleeding up under the number's baseline */}
      <Highlight
        trigger="in-view"
        className="mt-[-0.12em]"
        barClassName="-left-1 -right-1 -top-[0.3em] bottom-0"
      >
        <span className="px-1 font-sans text-[clamp(26px,6vw,80px)] font-medium leading-none tracking-tight text-ink">
          {label}
        </span>
      </Highlight>
    </div>
  );
}
