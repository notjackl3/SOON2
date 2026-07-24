"use client";

import { ArrowRight, Check } from "lucide-react";
import { useState } from "react";

import { getSupabase } from "@/lib/supabase";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "error" | "submitting" | "done";

/**
 * Hero CTA: capture an email for the waitlist (Figma node 481-613). A rounded
 * `surface` bar with a lime arrow submit button. Validates the address and
 * inserts it into the `public.waitlist` table (see the matching migration in
 * supabase/migrations) via the anon client, then shows an inline confirmation.
 */
export function EmailCta() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    try {
      const { error } = await getSupabase().from("waitlist").insert({ email: trimmed });
      // 23505 = unique violation: the address is already on the list, which is
      // a success from the visitor's point of view.
      if (error && error.code !== "23505") throw error;
      setStatus("done");
    } catch (err) {
      console.error("[waitlist signup error]", err);
      setStatus("error");
    }
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
          disabled={status === "submitting"}
          aria-label="Join the waitlist"
          className="flex shrink-0 items-center justify-center border-l-2 border-line bg-accent px-4 text-ink transition-colors hover:bg-accent/80 disabled:opacity-60"
        >
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </button>
      </div>
      {/* Absolutely positioned so it never grows the CTA row (keeps the email
          bar and the Location badge top-aligned). A submit failure keeps a
          valid address in the box; a validation failure doesn't. */}
      {status === "error" && (
        <span className="absolute left-1 top-full mt-1.5 text-[13px] tracking-body text-[rgb(231,84,84)]">
          {EMAIL_RE.test(email.trim())
            ? "Something went wrong. Please try again."
            : "Please enter a valid email."}
        </span>
      )}
    </form>
  );
}
