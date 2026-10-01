"use client";

import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputBase =
  "peer w-full rounded-2xl border border-white/10 bg-ink-850/80 px-4 text-base text-fg sm:text-sm " +
  "placeholder:text-fg-subtle/70 outline-none transition-all duration-200 " +
  "hover:border-white/20 focus:border-brand-400/70 focus:bg-ink-800 " +
  "focus:shadow-[0_0_0_4px_rgb(124_92_255/0.14)] disabled:opacity-50";

export type FieldProps = React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string | null;
  hint?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  function Field(
    { label, error, hint, leading, trailing, className, id, ...props },
    ref,
  ) {
    const autoId = React.useId();
    const fieldId = id ?? autoId;
    const describedBy = error
      ? `${fieldId}-error`
      : hint
        ? `${fieldId}-hint`
        : undefined;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className="block text-[0.78rem] font-medium tracking-wide text-fg-muted"
        >
          {label}
        </label>

        <div className="relative">
          {leading ? (
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle">
              {leading}
            </span>
          ) : null}

          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              inputBase,
              "h-12",
              leading && "pl-11",
              trailing && "pr-11",
              error &&
                "border-dena-500/60 focus:border-dena-500 focus:shadow-[0_0_0_4px_rgb(242_69_106/0.14)]",
              className,
            )}
            {...props}
          />

          {trailing ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {trailing}
            </span>
          ) : null}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.p
              key="err"
              id={`${fieldId}-error`}
              role="alert"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[0.75rem] text-dena-300"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <p id={`${fieldId}-hint`} className="text-[0.75rem] text-fg-subtle">
              {hint}
            </p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea"> & { label: string; error?: string | null }
>(function Textarea({ label, error, className, id, ...props }, ref) {
  const autoId = React.useId();
  const fieldId = id ?? autoId;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-[0.78rem] font-medium tracking-wide text-fg-muted"
      >
        {label}
      </label>
      <textarea
        ref={ref}
        id={fieldId}
        rows={3}
        aria-invalid={error ? true : undefined}
        className={cn(inputBase, "resize-none py-3", className)}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-[0.75rem] text-dena-300">
          {error}
        </p>
      ) : null}
    </div>
  );
});
