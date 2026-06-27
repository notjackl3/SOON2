import DotField from "@/components/DotField";
import { MobileFounder, MobilePortrait } from "@/components/team/mobile-portrait";
import { Portrait } from "@/components/team/portrait";
import { ScaledStage } from "@/components/team/scaled-stage";
import {
  CELL_W,
  MOBILE_CARDS,
  MOBILE_CONTENT_TOP,
  MOBILE_JACK,
  MOBILE_STAGE_H,
  MOBILE_STAGE_W,
  MOBILE_TITLE,
  TEAM_COLS,
  TEAM_GROUPS,
} from "@/components/team/data";

const DESKTOP_W = 1440;
const DESKTOP_H = 967;

/**
 * "Who we are" team section. Both layouts scale proportionally to the width
 * (no breakpoints within each); they swap at `md`: a 7-column desktop grid
 * (Jack spans 4) and a scattered mobile layout. Title is the shared SVG.
 */
export default function SectionTeam() {
  return (
    <section className="relative w-full overflow-hidden bg-white">
      {/* Animated dot field (bottom), desktop only. Masked so the dots fade
          out toward the edges into the white background. */}
      <div
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 45%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 50%, black 45%, transparent 100%)",
        }}
      >
        <DotField
          dotRadius={3}
          dotSpacing={17}
          gradientFrom="rgba(205, 206, 216, 0.9)"
          gradientTo="rgba(205, 206, 216, 0.5)"
          glowColor="transparent"
        />
      </div>

      {/* Decorative SVG above the dots — it's transparent (only its shapes
          paint), so the dots show through the gaps. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
      <img
        src="/team/background.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full md:block"
      />

      {/* Desktop (md+) — fills width, scales up/down */}
      <ScaledStage
        width={DESKTOP_W}
        height={DESKTOP_H}
        className="hidden md:block"
      >
        <div className="absolute left-0 top-0 flex w-242.75 flex-col gap-3 py-3.25">
          {TEAM_GROUPS.map((group, gi) => (
            <div key={gi} className="flex flex-col">
              {group.map((row, ri) => (
                <div
                  key={ri}
                  className="grid"
                  style={{
                    gridTemplateColumns: `repeat(${TEAM_COLS}, ${CELL_W}px)`,
                  }}
                >
                  {row.map((m) => (
                    <Portrait
                      key={m.name}
                      member={m}
                      style={{
                        gridColumn: m.span
                          ? `${m.col + 1} / span ${m.span}`
                          : `${m.col + 1}`,
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/team/who-we-are.svg"
          alt="Who we are"
          className="pointer-events-none absolute"
          style={{ left: 836.68, top: 369.66, width: 518.597 }}
        />
      </ScaledStage>

      {/* Mobile (<md) — scattered cards, fills the width (no margins) */}
      <ScaledStage
        width={MOBILE_STAGE_W}
        height={MOBILE_STAGE_H}
        className="md:hidden"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img
          src="/team/background-mobile.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        />
        <div className="absolute left-0 right-0" style={{ top: MOBILE_CONTENT_TOP }}>
          <MobileFounder
            card={MOBILE_JACK.card}
            style={{ left: MOBILE_JACK.x, top: MOBILE_JACK.y }}
          />
          {MOBILE_CARDS.map((p, i) => (
            <MobilePortrait key={i} card={p.card} style={{ left: p.x, top: p.y }} />
          ))}
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
          <img
            src="/team/who-we-are.svg"
            alt="Who we are"
            className="pointer-events-none absolute"
            style={{ left: MOBILE_TITLE.x, top: MOBILE_TITLE.y, width: MOBILE_TITLE.w }}
          />
        </div>
      </ScaledStage>
    </section>
  );
}
