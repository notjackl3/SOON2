import Image from "next/image";
import type { CSSProperties } from "react";

import type { MobileCard } from "./data";

const NAME =
  "font-display font-medium text-[#353535] text-[8.661px] leading-[8.042px] tracking-[0.1732px]";
const ROLE =
  "text-[5.917px] uppercase leading-none tracking-[-0.2367px] text-muted";

/** Small square team card for the mobile scatter layout. */
export function MobilePortrait({
  card,
  style,
}: {
  card: MobileCard;
  style?: CSSProperties;
}) {
  return (
    <div
      className="absolute flex h-[111px] w-[86px] items-start border-[0.5px] border-line bg-white px-[8px] pb-[9px] pt-[8px]"
      style={style}
    >
      <div className="flex w-[69px] flex-col gap-[7px]">
        <div className="relative aspect-square w-full bg-[#d9d9d9]">
          {card.image && (
            <Image
              src={card.image}
              alt={card.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex w-full flex-col gap-[2px]">
          <p className={`w-full break-words ${NAME}`}>{card.name}</p>
          <p className={`w-full break-words ${ROLE}`}>{card.role}</p>
        </div>
      </div>
    </div>
  );
}

/** Jack's wide founder card (photo left, name/role/bio) for mobile. */
export function MobileFounder({
  card,
  style,
}: {
  card: MobileCard;
  style?: CSSProperties;
}) {
  return (
    <div
      className="absolute h-[180px] w-[262px] border-[0.5px] border-line bg-white"
      style={style}
    >
      <div className="absolute left-[9px] top-[8px] h-[162px] w-[95px] bg-[#d9d9d9]">
        {card.image && (
          <Image
            src={card.image}
            alt={card.name}
            fill
            sizes="120px"
            className="object-cover"
          />
        )}
      </div>
      <p className="absolute left-[112px] top-[9px] w-[150px] font-display text-[16.807px] font-medium leading-[15.607px] tracking-[0.3361px] text-ink-soft">
        {card.name}
      </p>
      <p className="absolute right-[9px] top-[9px] text-[7.733px] uppercase tracking-[-0.3093px] text-muted">
        {card.role}
      </p>
      <p className="absolute left-[113px] top-[41px] w-[116px] whitespace-pre-wrap text-[6.467px] leading-[7.761px] tracking-[-0.2587px] text-muted">
        {card.bio}
      </p>
    </div>
  );
}
