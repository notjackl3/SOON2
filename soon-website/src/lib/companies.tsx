// Central registry of company → website links, plus a helper that turns any
// company name appearing in a free-text string (a speaker's `role`, a sponsor
// quote's `author`, etc.) into an underlined external link.
//
// Names are matched as WHOLE WORDS (word boundaries), so "Stan" won't match
// inside "Stanley" and "Polar" wouldn't match inside "Polarity". Only companies
// listed here get linked — anything whose URL we're unsure of is simply left as
// plain text until a URL is added below.

import type { ReactNode } from "react";

export interface Company {
  /** Exact text as it appears in the data (matched as a whole word). */
  name: string;
  url: string;
}

export const COMPANIES: Company[] = [
  // Speakers' companies (their `role` text) + given links
  { name: "Auto Agentic AI", url: "https://autoagentic.ai/" },
  { name: "Chatforce", url: "https://chatforce.com/" },
  { name: "Composio", url: "https://composio.dev/" },
  { name: "Google", url: "https://www.google.com/" },
  { name: "Cloudinary", url: "https://cloudinary.com/" },
  { name: "Uber", url: "https://www.uber.com/" },

  // Sponsor quote authors (logo cards link via each sponsor's own `url` field)
  { name: "Polarity", url: "https://www.polarity.so/" },
];

const URL_BY_NAME = new Map(COMPANIES.map((c) => [c.name, c.url]));

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Longest names first so multi-word companies ("Capital One") win over any
// shorter overlap. `\b` on both ends keeps matches to whole words.
const PATTERN = new RegExp(
  `\\b(${[...COMPANIES]
    .sort((a, b) => b.name.length - a.name.length)
    .map((c) => escapeRegExp(c.name))
    .join("|")})\\b`,
  "g",
);

/**
 * Splits `text` into plain segments + underlined external links for every known
 * company name it contains. `pointer-events-auto` lets the links stay clickable
 * even inside a `pointer-events-none` stage (e.g. the floating guests section).
 */
export function linkifyCompanies(text: string): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  PATTERN.lastIndex = 0;
  while ((m = PATTERN.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const name = m[0];
    out.push(
      <a
        key={m.index}
        href={URL_BY_NAME.get(name)!}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto underline underline-offset-2 transition-colors hover:text-ink"
      >
        {name}
      </a>,
    );
    last = m.index + name.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
