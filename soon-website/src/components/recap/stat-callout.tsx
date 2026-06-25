/**
 * A recap stat: big Playfair number stacked over an Inter label that sits on an
 * accent-green highlight (the Figma "Union" shape, rebuilt as a `bg-accent`
 * div). Reuses the hero's highlight-behind-text pattern.
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
      <span className="relative z-10 font-display text-[clamp(64px,13vw,200px)] leading-[0.8] tracking-[-0.04em] text-black">
        {value}
      </span>
      <span className="relative -mt-[0.12em] inline-flex">
        {/* accent highlight, bleeding up under the number's baseline */}
        <span
          aria-hidden
          className="absolute -left-1 -right-1 -top-[0.3em] bottom-0 bg-accent"
        />
        <span className="relative px-1 font-sans text-[clamp(26px,6vw,80px)] font-medium leading-none tracking-tight text-ink">
          {label}
        </span>
      </span>
    </div>
  );
}
