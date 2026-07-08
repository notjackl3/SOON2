"use client";

import { useState } from "react";
import Image from "next/image";

import { scrollToId } from "@/lib/lenis";

/** Intercept an in-page anchor so it glides via Lenis instead of jumping. Keeps
 *  the href intact for right-click/open-in-tab, no-JS, and URL-hash semantics. */
function smoothTo(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  scrollToId(href.slice(1));
}

const LINKS = [
  { label: "About", href: "#soon" },
  { label: "Recap", href: "#recap" },
  { label: "Sponsors", href: "#sponsors" },
  { label: "Team", href: "#team" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute inset-x-0 top-0 z-50 w-full tracking-body">
      <div className="relative flex items-center px-6 pb-4 pt-8 md:px-0">
        {/* Logo — sits in the left gutter (mobile: in flow; desktop: pinned to
            the gutter so it doesn't shift the evenly-spread links). Centered
            within the same top-8/bottom-4 content band as the links (via my-auto)
            so it lines up with the link text despite the asymmetric padding. */}
        <a
          href="#top"
          onClick={(e) => smoothTo(e, "#top")}
          aria-label="Back to top"
          className="z-50 shrink-0 md:absolute md:left-8 md:bottom-4 md:top-8 md:my-auto md:h-9 md:w-9"
        >
          <Image
            src="/logo.png"
            alt="SOON"
            width={1080}
            height={1080}
            priority
            className="h-9 w-9"
          />
        </a>

        {/* Desktop links — aligned to the same content box as the sections
            (max-w-360 + px-34), spread evenly so the first entry lands on the
            section's left margin and FAQ sits a margin's width from the right. */}
        <nav className="mx-auto hidden w-full max-w-360 items-center justify-between px-8 md:flex md:px-34">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => smoothTo(e, link.href)}
              className="hover:opacity-70"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 ml-auto flex size-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-px w-6 bg-current transition-transform duration-200 ${
              open ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-current transition-transform duration-200 ${
              open ? "translate-y-[-3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown panel */}
      <div
        className={`overflow-hidden bg-white/95 backdrop-blur transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-96 border-y border-line" : "max-h-0"
        }`}
      >
        <div className="flex flex-col px-6 py-2">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => {
                smoothTo(e, link.href);
                setOpen(false);
              }}
              className="border-b border-line/60 py-3 text-ink last:border-b-0 hover:opacity-70"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
