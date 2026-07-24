"use client";

import { Button } from "@/components/ui/button";

const PARTNER_DECK_URL =
  "https://drive.google.com/file/d/1I4tjvupyuDLaB_-wHHJ-KTHO05il1GdL/view?usp=sharing";

/**
 * Sponsors CTA. Opens the partnership deck (Google Drive) in a new tab.
 */
export function PartnerButton() {
  return (
    <Button
      className="py-3 text-[clamp(13px,1.4vw,20px)] tracking-tight"
      onClick={() =>
        window.open(PARTNER_DECK_URL, "_blank", "noopener,noreferrer")
      }
    >
      Partner with us
    </Button>
  );
}
