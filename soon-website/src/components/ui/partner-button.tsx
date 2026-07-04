"use client";

import { Button } from "@/components/ui/button";
import { scrollToId } from "@/lib/lenis";

/**
 * Sponsors CTA. Scrolls down to the contact form (footer `#contact`) using the
 * page's Lenis smoothing so it matches the rest of the site's scroll feel.
 */
export function PartnerButton() {
  return (
    <Button
      className="py-3 text-[clamp(13px,1.4vw,20px)] tracking-tight"
      onClick={() => scrollToId("contact")}
    >
      Partner with us
    </Button>
  );
}
