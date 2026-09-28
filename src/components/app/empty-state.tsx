"use client";

import { motion, useReducedMotion } from "motion/react";

import { Mark } from "@/components/brand";
import { EASE_OUT_EXPO } from "@/components/motion/primitives";

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
      className="glass flex flex-col items-center rounded-3xl px-6 py-14 text-center"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -7, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        <Mark className="h-14 w-14 opacity-90" />
        <div
          aria-hidden
          className="absolute -inset-8 -z-10 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, rgb(124 92 255 / 0.22), transparent 70%)",
          }}
        />
      </motion.div>

      <h3 className="mt-6 font-display text-lg font-600 tracking-tight">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-[0.875rem] leading-relaxed text-fg-muted">
        {body}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </motion.div>
  );
}
