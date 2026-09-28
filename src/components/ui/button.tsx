"use client";

import { motion, useReducedMotion } from "motion/react";
import { Loader2 } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { springSnappy } from "@/components/motion/primitives";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "paona" | "dena";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none " +
  "transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 overflow-hidden";

const variants: Record<Variant, string> = {
  primary:
    "bg-linear-to-br from-brand-400 to-brand-600 text-white shadow-[0_10px_30px_-12px_rgb(124_92_255/0.9)] hover:from-brand-300 hover:to-brand-500",
  secondary:
    "glass text-fg hover:bg-ink-700/70 border border-white/10",
  ghost: "text-fg-muted hover:text-fg hover:bg-white/5",
  danger:
    "bg-dena-500/15 text-dena-300 border border-dena-500/30 hover:bg-dena-500/25",
  paona:
    "bg-linear-to-br from-paona-400 to-paona-500 text-ink-950 font-600 shadow-[0_10px_30px_-12px_rgb(22_201_139/0.9)]",
  dena:
    "bg-linear-to-br from-dena-400 to-dena-500 text-white shadow-[0_10px_30px_-12px_rgb(242_69_106/0.9)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.9375rem]",
};

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Renders the sheen sweep on hover. */
  sheen?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      sheen = true,
      children,
      disabled,
      ...props
    },
    ref,
  ) {
    const reduce = useReducedMotion();

    return (
      <motion.button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        whileHover={reduce ? undefined : { scale: 1.025 }}
        whileTap={reduce ? undefined : { scale: 0.975 }}
        transition={springSnappy}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {sheen && !reduce ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/btn:translate-x-full"
          />
        ) : null}

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        <span className={cn("relative", loading && "opacity-90")}>
          {children}
        </span>
      </motion.button>
    );
  },
);
