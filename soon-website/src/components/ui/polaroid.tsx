import Image from "next/image";
import type { CSSProperties } from "react";

type PolaroidProps = {
  /** Image path once picked. Leave empty to render an empty photo well. */
  src?: string;
  /** Alt text for the photo. */
  alt?: string;
  /** Handwritten-style caption under the photo. */
  caption?: string;
  /** Resting tilt in degrees (e.g. -5 leans left, 6 leans right). */
  rotate?: number;
  /** Fires when the photo finishes loading (used to time the string draw-in). */
  onLoad?: () => void;
  className?: string;
  style?: CSSProperties;
};

/**
 * A single polaroid photo frame: white card with a fat bottom lip and a slight
 * resting tilt. Flat (a thin `line` border, no drop shadow) to match the other
 * framed cards on the site. The photo well stays a fixed 4:5-ish ratio so an
 * image dropped in later fills it cleanly (`object-cover`). Until a `src` is
 * provided it shows a neutral placeholder well.
 */
export function Polaroid({
  src,
  alt = "",
  caption,
  rotate = 0,
  onLoad,
  className,
  style,
}: PolaroidProps) {
  return (
    <div
      className={`w-full select-none border border-line bg-white p-3 pb-0 ${className ?? ""}`}
      style={{ rotate: `${rotate}deg`, ...style }}
    >
      {/* photo well — fixed ratio so any picked image fills it cleanly */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-surface">
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 45vw, 300px"
            className="object-cover"
            onLoad={onLoad}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[repeating-linear-gradient(45deg,#f2f2f2_0px,#f2f2f2_12px,#ededed_12px,#ededed_24px)]" />
        )}
      </div>

      {/* caption lip — the classic thick polaroid bottom. Mixed type: the first
          word in Inter, the rest in Playfair italic. */}
      <div className="flex h-16 items-center justify-center px-2 text-lg leading-none text-ink-soft">
        {caption
          ? (() => {
              const [first, ...rest] = caption.split(" ");
              return (
                <span>
                  <span className="font-sans not-italic">{first}</span>
                  {rest.length > 0 && (
                    <span className="font-display italic"> {rest.join(" ")}</span>
                  )}
                </span>
              );
            })()
          : null}
      </div>
    </div>
  );
}
