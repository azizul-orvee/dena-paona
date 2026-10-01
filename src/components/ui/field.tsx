"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, X } from "lucide-react";
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

/**
 * Date picker that looks the same everywhere. Native date inputs show an
 * empty box plus a browser chevron on Android and can't take a placeholder,
 * so this draws its own calendar icon, placeholder and clear button. The real
 * input still fills the box, so a tap anywhere opens the native picker.
 */
export function DateField({
  label,
  name,
  defaultValue = "",
  placeholder = "No due date",
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string | null;
}) {
  const fieldId = React.useId();
  const [value, setValue] = React.useState(defaultValue);
  const display = value
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(`${value}T00:00:00`))
    : null;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={fieldId}
        className="block text-[0.78rem] font-medium tracking-wide text-fg-muted"
      >
        {label}
      </label>

      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-fg-subtle" />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-11 right-12 flex items-center truncate text-base sm:text-sm",
            display ? "text-fg" : "text-fg-subtle/70",
          )}
        >
          {display ?? placeholder}
        </span>

        {/* The real input: transparent text, but it owns taps and the value */}
        <input
          id={fieldId}
          name={name}
          type="date"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          className={cn(
            inputBase,
            "date-input h-12 appearance-none pl-11 text-transparent",
            error &&
              "border-dena-500/60 focus:border-dena-500 focus:shadow-[0_0_0_4px_rgb(242_69_106/0.14)]",
          )}
        />

        {value ? (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear due date"
            className="absolute right-1.5 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-fg-subtle transition-colors hover:bg-white/8 hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-[0.75rem] text-dena-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
