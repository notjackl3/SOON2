import Image from "next/image";

import type { Corner } from "@/data/guests";
import { linkifyCompanies } from "@/lib/companies";

/** Square centered exactly on the picture corner (matches the line anchors). */
const CORNER_POS: Record<Corner, string> = {
  tl: "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  tr: "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  bl: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  br: "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
};

/**
 * Presentational profile card ("vista"): photo + corner squares + name + role.
 * Static content — the section translates the whole card for the float effect.
 * Reused as-is in the mobile static grid.
 */
export function Vista({
  name,
  role,
  image,
  corners,
}: {
  name: string;
  role: string;
  image: string;
  corners: Corner[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative aspect-square w-full border border-line bg-surface">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(min-width: 768px) 220px, 45vw"
          className="object-cover"
        />
        {corners.map((corner) => (
          <span
            key={corner}
            aria-hidden
            className={`absolute size-1.5 border border-line bg-white ${CORNER_POS[corner]}`}
          />
        ))}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-[15.9px] font-semibold tracking-[0.02em] text-ink-soft">
          {name}
        </p>
        <p className="text-[11px] uppercase leading-snug tracking-body text-muted">
          {linkifyCompanies(role)}
        </p>
      </div>
    </div>
  );
}
