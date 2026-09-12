"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "./index";

/**
 * The shared dialog.
 *
 * Keyboard behaviour is the whole reason this exists once rather than per
 * feature: Escape closes, Tab is trapped inside, focus moves to the panel on
 * open and returns to whatever opened it on close, and the page behind cannot
 * scroll. Every modal on the site — the first-visit chooser, the correction
 * request, the share card — goes through it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  labelledBy?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    panel?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      restoreTo.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const width = size === "sm" ? "max-w-md" : size === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-6">
      <div
        className="fixed inset-0 bg-ink/55 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
        aria-describedby={description ? "modal-description" : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-panel border border-line bg-cream p-5 shadow-float outline-none animate-fade-up sm:rounded-panel sm:p-7",
          width
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3.5 top-3.5 inline-flex h-9 w-9 items-center justify-center rounded-pill text-ink-muted transition hover:bg-ink/5 hover:text-ink"
        >
          <X className="h-5 w-5" strokeWidth={2.4} />
        </button>
        {title ? (
          <h2 id={labelledBy} className="pr-10 text-h2">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p id="modal-description" className="mt-2 text-body text-ink-muted">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
