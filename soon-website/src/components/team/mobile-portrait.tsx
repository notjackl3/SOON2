import Image from "next/image";
import type { CSSProperties } from "react";

import { Reveal } from "@/components/reveal";

import type { MobileCard } from "./data";

const NAME =
  "font-display font-medium text-[#353535] text-[8.661px] leading-[8.042px] tracking-[0.1732px]";
const ROLE =
  "text-[5.917px] uppercase leading-none tracking-[-0.2367px] text-muted";

/** Small square team card for the mobile scatter layout. */
export function MobilePortrait({
  card,
  style,
  delay = 0,
}: {
  card: MobileCard;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <Reveal
      className="absolute flex h-27.75 w-21.5 items-start border-[0.5px] border-line bg-white px-2 pt-2 pb-2.25"
      style={style}
      delay={delay}
      y={12}
    >
      <div className="flex w-17.25 flex-col gap-1.75">
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
        <div className="flex w-full flex-col gap-0.5">
          <p className={`w-full wrap-break-word ${NAME}`}>{card.name}</p>
          <p className={`w-full wrap-break-word ${ROLE}`}>{card.role}</p>
        </div>
      </div>
    </Reveal>
  );
}

/** Jack's wide founder card (photo left, name/role/bio) for mobile. */
export function MobileFounder({
  card,
  style,
  delay = 0,
}: {
  card: MobileCard;
  style?: CSSProperties;
  delay?: number;
}) {
  return (
    <Reveal
      className="absolute h-45 w-65.5 border-[0.5px] border-line bg-white"
      style={style}
      delay={delay}
      y={12}
    >
      <div className="absolute top-2 left-2.25 h-40.5 w-23.75 bg-[#d9d9d9]">
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
      <p className="absolute left-28 top-2.25 w-37.5 font-display text-[16.807px] font-medium leading-[15.607px] tracking-[0.3361px] text-ink-soft">
        {card.name}
      </p>
      <p className="absolute right-2.25 top-2.25 text-[7.733px] uppercase tracking-[-0.3093px] text-muted">
        {card.role}
      </p>
      <p className="absolute left-28.25 top-10.25 w-29 whitespace-pre-wrap text-[6.467px] leading-[7.761px] tracking-[-0.2587px] text-muted">
        {card.bio}
      </p>
    </Reveal>
  );
}
