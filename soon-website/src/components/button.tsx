import { type ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The site's accent pill button (hero "Reserve your room", sponsors "Partner
 * with us", footer "I'm in"). Forwards every native `<button>` prop; pass
 * `className` to tweak padding/size/rounding per use — `cn` merges it over the
 * base styles. `cursor-pointer` is set explicitly since Tailwind's preflight
 * gives buttons `cursor: default`.
 */
export function Button({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={cn(
        "cursor-pointer rounded-[26px] border-[1.5px] border-[#a8e618] bg-accent/30 px-7 py-2.5 text-[clamp(12px,1.5vw,15px)] uppercase text-ink transition-colors hover:bg-accent/50",
        className,
      )}
      {...props}
    />
  );
}
