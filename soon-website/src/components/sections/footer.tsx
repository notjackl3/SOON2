import Image from "next/image";

import ContactForm from "@/components/sections/contact-form";
import { Highlight } from "@/components/ui/highlight";
import { Reveal } from "@/components/ui/reveal";

export default function SectionFooter() {
  return (
    // A <div role="contentinfo"> rather than <footer>: identical landmark
    // semantics, but some content blockers (e.g. in Firefox/Zen) hide the
    // literal <footer> tag via cosmetic filters, which made this disappear.
    <div role="contentinfo" className="w-full ">
      {/* ---- Contact section ---- */}
      <section id="contact" className="mx-auto flex w-full max-w-360 flex-col gap-16 px-8 py-20 mt-12 md:px-34 lg:flex-row lg:items-center lg:gap-12">
        {/* Left: heading + copy */}
        <div className="flex flex-1 flex-col gap-12">
          <Reveal className="flex flex-col gap-3">
            <p className="text-body tracking-body text-ink-soft">
              Knock, knock
            </p>
            <h2 className="max-w-135.5 text-h2 font-medium leading-none text-ink tracking-body">
              We&rsquo;d love to hear from{" "}
              <Highlight
                trigger="in-view"
                className="font-display italic"
                barClassName="inset-x-[-0.05em] bottom-[0.12em] top-[0.28em] z-0"
              >
                you
              </Highlight>
              !
            </h2>
          </Reveal>

          <Reveal delay={130} className="max-w-110.5 space-y-4 text-body tracking-body text-ink-soft">
            <p>
              Questions, feedback, or just want to book a coffee chat and say hi? Whether you&rsquo;re a
              hacker, a sponsor, or simply curious about SOON, our team is here to help.
            </p>
            <p>Drop your details and we&rsquo;ll get back to you soon.</p>
          </Reveal>

          <Reveal delay={200}>
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative inline SVG */}
            <img
              src="/footer/vector.svg"
              alt=""
              aria-hidden
              className="h-15 w-30"
            />
          </Reveal>
        </div>

        {/* Right: contact form */}
        <ContactForm />
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
              <span className="text-4xl font-medium text-muted tracking-body">
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
                  href="https://www.instagram.com/soon.hackathon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="transition-opacity hover:opacity-70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG icon */}
                  <img src="/footer/instagram.svg" alt="" className="size-4.5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/huu-an-duc-le/"
                  target="_blank"
                  rel="noopener noreferrer"
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
