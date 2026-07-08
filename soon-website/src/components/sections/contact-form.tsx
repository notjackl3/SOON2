"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getSupabase } from "@/lib/supabase";

type Fields = {
  name: string;
  company: string;
  email: string;
  info: string;
};

type FieldErrors = Partial<Record<keyof Fields, string>>;

type Status = "idle" | "submitting" | "done" | "error";

/** A labelled, controlled text input used in the contact form. */
function Field({
  label,
  type = "text",
  name,
  value,
  error,
  onChange,
}: {
  label: string;
  type?: string;
  name: keyof Fields;
  value: string;
  error?: string;
  onChange: (name: keyof Fields, value: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label htmlFor={name} className="text-sm uppercase text-muted">
        {label}
        {error ? <span className="ml-2 normal-case text-red-500">{error}</span> : null}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="h-9 rounded-md border border-line bg-surface px-3 text-sm tracking-normal text-ink outline-none focus:border-ink/40"
      />
    </div>
  );
}

/**
 * Contact form. Mirrors the old SOON sponsor page: posts {name, company, email,
 * availability} to the `notify-meeting` Supabase edge function, which stores the
 * request and emails uoft.soon@gmail.com via Resend. Client component because it
 * owns the form state + submit lifecycle.
 */
export default function ContactForm() {
  const [form, setForm] = useState<Fields>({ name: "", company: "", email: "", info: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  function set(name: keyof Fields, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validate(): FieldErrors {
    const e: FieldErrors = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.company.trim()) e.company = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.info.trim()) e.info = "Required";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setStatus("submitting");
    try {
      const { error } = await getSupabase().functions.invoke("notify-meeting", {
        body: {
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          availability: form.info.trim(),
        },
      });
      if (error) throw error;
      setStatus("done");
      setForm({ name: "", company: "", email: "", info: "" });
    } catch (err) {
      console.error("[sponsor meeting error]", err);
      setStatus("error");
    }
  }

  return (
    <Reveal
      as="form"
      delay={120}
      x={0}
      y={28}
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-1 flex-col gap-8 rounded-[10px] border border-line bg-white px-7 py-8"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-4">
        <Field label="Name" name="name" value={form.name} error={errors.name} onChange={set} />
        <Field label="Company" name="company" value={form.company} error={errors.company} onChange={set} />
      </div>

      <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={set} />

      <div className="flex flex-col gap-1">
        <label htmlFor="info" className="text-sm uppercase text-muted">
          Availability and Additional Information
          {errors.info ? <span className="ml-2 normal-case text-red-500">{errors.info}</span> : null}
        </label>
        <textarea
          id="info"
          name="info"
          value={form.info}
          onChange={(e) => set("info", e.target.value)}
          className="h-34.75 resize-none rounded-md border border-line bg-surface p-3 text-sm tracking-normal text-ink outline-none focus:border-ink/40"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={status === "submitting"}
          className="self-start rounded-[18px] border px-8 py-2 text-sm disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "I’m in"}
        </Button>
        {status === "done" ? (
          <p className="text-sm text-ink-soft">Thanks &mdash; we&rsquo;ll be in touch.</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-red-500">Something went wrong. Please try again or email us directly.</p>
        ) : null}
      </div>
    </Reveal>
  );
}
