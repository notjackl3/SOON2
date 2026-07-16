"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Reusable modal built on Radix Dialog (portal, focus trap, Esc-to-close,
 * scroll lock, focus restore — all handled by Radix). Styled to the SOON
 * brand: white card with a thin `line` border and the four corner squares
 * (same motif as <BoundingBox> / the guest vistas) over a translucent scrim.
 */

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;

const CORNER_POS = [
  "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
  "right-0 top-0 translate-x-1/2 -translate-y-1/2",
  "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
  "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
];

/**
 * The framed modal panel. Render inside a <Dialog>; provide a <DialogTitle>
 * somewhere in `children` for accessibility (wrap it in <VisuallyHidden> if it
 * shouldn't show). `className` sizes the panel (default max-w).
 */
export function DialogPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-[330px] -translate-x-1/2 -translate-y-1/2",
          "border border-line bg-white",
          "focus:outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className,
        )}
      >
        {children}
        {/* Corner squares centered on the panel corners. */}
        {CORNER_POS.map((pos) => (
          <span
            key={pos}
            aria-hidden
            className={cn(
              "pointer-events-none absolute size-[9.5px] border border-line bg-white",
              pos,
            )}
          />
        ))}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
