"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Hero CTA: capture an email for the waitlist (Figma node 481-613). A rounded
 * `surface` bar with a lime arrow submit button. Applications aren't open yet,
 * so this validates the address and shows an inline confirmation — wiring it to
 * a store/edge function is a one-line change at the marked hook.
 */
export function EmailCta() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setStatus("error");
      return;
    }
    // TODO(waitlist): POST `email` to a backend / Supabase edge function here.
    setStatus("done");
  };

  if (status === "done") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-2 rounded-md border-2 border-line bg-surface px-4 py-2.5 text-[15px] tracking-body text-ink-soft"
      >
        <Check className="size-4 shrink-0 text-ink" strokeWidth={2.5} />
        You&rsquo;re all set! We&rsquo;ll be in touch SOON.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="relative flex w-full max-w-sm flex-col"
    >
      <div className="flex items-stretch overflow-hidden rounded-md border-2 border-line bg-surface transition-colors focus-within:border-muted">
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          placeholder="Enter your email, we'll contact you SOON."
          aria-label="Email address"
          aria-invalid={status === "error"}
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-[15px] tracking-body text-ink placeholder:text-line focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Join the waitlist"
          className="flex shrink-0 items-center justify-center border-l-2 border-line bg-accent px-4 text-ink transition-colors hover:bg-accent/80"
        >
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
      {/* Absolutely positioned so it never grows the CTA row (keeps the email
          bar and the Location badge top-aligned). */}
      {status === "error" && (
        <span className="absolute left-1 top-full mt-1.5 text-[13px] tracking-body text-[rgb(231,84,84)]">
          Please enter a valid email.
        </span>
      )}
    </form>
  );
}
