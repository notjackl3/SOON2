import Image from "next/image";
import type { CSSProperties } from "react";

import type { TeamMember } from "./data";

const CARD = "bg-white border-[0.87px] border-line";
const PAD = "pl-3.5 pr-3.25 pt-3.25 pb-3.5";
const NAME =
  "font-display text-sm font-medium leading-3.25 tracking-[0.28px] text-ink-soft";
const ROLE = "text-[9.565px] uppercase leading-none tracking-[-0.38px] text-muted";

/**
 * A team member card. Standard cards are a square photo over name + role; the
 * `bio` member (Jack) renders the wide founder layout (photo left, bio right)
 * and is the only card that spans multiple grid columns.
 */
export function Portrait({
  member,
  style,
}: {
  member: TeamMember;
  style?: CSSProperties;
}) {
  if (member.bio) {
    return (
      <div className={`${CARD} ${PAD} flex items-end gap-4`} style={style}>
        <div className="relative h-[152.954px] w-[195.857px] shrink-0 bg-[#d9d9d9]">
          {member.image && (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="200px"
              className="object-cover"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex items-center gap-5.5">
            <p className={`flex-1 ${NAME}`}>{member.name}</p>
            <p className={`${ROLE} text-right`}>{member.role}</p>
          </div>
          <p className="whitespace-pre-wrap text-[10px] leading-3 tracking-[-0.4px] text-muted">
            {member.bio}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${CARD} ${PAD} flex flex-col gap-3`} style={style}>
      <div className="relative aspect-square w-full bg-[#d9d9d9]">
        {member.image && (
          <Image
            src={member.image}
            alt={member.name}
            fill
            sizes="140px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex w-full flex-col gap-1">
        <p className={`w-full wrap-break-word ${NAME}`}>{member.name}</p>
        <p className={`w-full wrap-break-word ${ROLE}`}>{member.role}</p>
      </div>
    </div>
  );
}
