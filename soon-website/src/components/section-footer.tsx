import Image from "next/image";

/** A labelled text input used in the contact form. */
function Field({
  label,
  type = "text",
  name,
}: {
  label: string;
  type?: string;
  name: string;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label
        htmlFor={name}
        className="text-sm uppercase text-muted"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="h-9 rounded-md border border-line bg-surface px-3 text-sm tracking-normal text-ink outline-none focus:border-ink/40"
      />
    </div>
  );
}

export default function SectionFooter() {
  return (
    // A <div role="contentinfo"> rather than <footer>: identical landmark
    // semantics, but some content blockers (e.g. in Firefox/Zen) hide the
    // literal <footer> tag via cosmetic filters, which made this disappear.
    <div role="contentinfo" className="w-full ">
      {/* ---- Contact section ---- */}
      <section className="mx-auto flex w-full max-w-360 flex-col gap-16 px-8 py-20 mt-12 md:px-34 lg:flex-row lg:items-center lg:gap-12">
        {/* Left: heading + copy */}
        <div className="flex flex-1 flex-col gap-12">
          <div className="flex flex-col gap-3">
            <p className="text-xl tracking-body text-ink-soft">
              Knock, knock
            </p>
            <h2 className="max-w-135.5 lg:text-[80px] text-5xl font-medium leading-none text-ink tracking-body">
              We&rsquo;d love to hear from{" "}
              <span className="relative inline-block font-display italic">
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.05em] bottom-[0.12em] top-[0.28em] z-0 bg-accent"
                />
                <span className="relative">you</span>
              </span>
              !
            </h2>
          </div>

          <div className="max-w-110.5 space-y-4 text-xl tracking-body text-ink-soft">
            <p>
              Not sure which pipeline or tier fits best? Our team will walk you
              through it&mdash;pricing, availability, and what works for your
              goals.
            </p>
            <p>Drop your details and we&rsquo;ll keep the lights on for you.</p>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element -- decorative inline SVG */}
          <img
            src="/footer/vector.svg"
            alt=""
            aria-hidden
            className="h-15 w-30"
          />
        </div>

        {/* Right: contact form */}
        <form className="flex flex-1 flex-col gap-8 rounded-[10px] border border-line bg-white px-7 py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-4">
            <Field label="Name" name="name" />
            <Field label="Company" name="company" />
          </div>

          <Field label="Email" name="email" type="email" />

          <div className="flex flex-col gap-1">
            <label
              htmlFor="info"
              className="text-sm uppercase text-muted"
            >
              Availability and Additional Information
            </label>
            <textarea
              id="info"
              name="info"
              className="h-34.75 resize-none rounded-md border border-line bg-surface p-3 text-sm tracking-normal text-ink outline-none focus:border-ink/40"
            />
          </div>

          <button
            type="submit"
            className="self-start rounded-[18px] border border-[#a8e618] bg-accent/30 px-8 py-2 text-sm uppercase text-ink transition-colors hover:bg-accent/50"
          >
            I&rsquo;m in
          </button>
        </form>
      </section>

      {/* ---- Footer bar ---- */}
      <div className="bg-surface">
        <div className="mx-auto flex w-full max-w-360 flex-col items-center justify-between gap-8 px-6 py-12 lg:flex-row lg:items-center lg:px-30">
          {/* Brand + copyright */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="SOON logo"
                width={60}
                height={60}
                className="size-15 object-contain"
              />
              <span className="text-4xl font-medium text-muted">
                SOON
              </span>
            </div>
            <p className="text-sm uppercase text-muted pl-4">
              &copy; 2026 SOON. All rights reserved.
            </p>
          </div>

          {/* Socials + tagline */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2.5">
                <a
                  href="https://instagram.com"
                  aria-label="Instagram"
                  className="transition-opacity hover:opacity-70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG icon */}
                  <img src="/footer/instagram.svg" alt="" className="size-4.5" />
                </a>
                <a
                  href="https://linkedin.com"
                  aria-label="LinkedIn"
                  className="transition-opacity hover:opacity-70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG icon */}
                  <img src="/footer/linkedin.svg" alt="" className="h-4.5 w-4.25" />
                </a>
              </div>
              <a
                href="mailto:uoft.soon@gmail.com"
                className="text-[11.66px] uppercase text-ink hover:underline"
              >
                UOFT.SOON@GMAIL.COM
              </a>
            </div>

            <div className="h-20.75 w-px bg-line" />

            <p className="w-22.5 text-[18.6px] uppercase leading-tight text-muted">
              We live here too
            </p>
          </div>
        </div>

        {/* Accent underbar */}
        <div className="h-5.25 w-full bg-accent" />
      </div>
    </div>
  );
}
