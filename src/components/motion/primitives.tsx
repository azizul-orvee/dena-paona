"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Transition,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/* ─────────────────────────── Shared easing language ────────────────────── */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.22, 0.61, 0.36, 1] as const;

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.8,
};

export const springGentle: Transition = {
  type: "spring",
  stiffness: 180,
  damping: 26,
  mass: 1,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

export const stagger = (staggerChildren = 0.06, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/* ───────────────────────────── Scroll reveal ───────────────────────────── */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-12% 0px -8% 0px" });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(8px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : reduce
            ? undefined
            : { opacity: 0, y, filter: "blur(8px)" }
      }
      transition={{ duration: 0.75, ease: EASE_OUT_EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────── Odometer-style number counter ─────────────────── */

export function AnimatedNumber({
  value,
  format,
  className,
  duration = 1.1,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, {
    stiffness: 70,
    damping: 22,
    restDelta: 0.01,
    duration,
  });
  const [animated, setAnimated] = useState("0");

  useEffect(() => {
    if (!reduce && inView) mv.set(value);
  }, [inView, value, mv, reduce]);

  // Subscribing to the spring is an external-system subscription, so the
  // setState lives in the callback rather than in the effect body.
  useEffect(() => {
    if (reduce) return;
    return spring.on("change", (latest) => {
      // Round to money precision so the spring settles on 12,950 rather than
      // drifting to 12,949.9996 and rendering as "12,950.00".
      const snapped = Math.round(latest * 100) / 100;
      setAnimated(format ? format(snapped) : String(Math.round(snapped)));
    });
  }, [spring, format, reduce]);

  // Reduced motion (and the very first paint) render the true value straight
  // away instead of counting up to it.
  const settled = format ? format(value) : String(Math.round(value));
  const display = reduce || !inView ? settled : animated;

  return (
    <span ref={ref} className={cn("tnum tabular-nums", className)}>
      {display}
    </span>
  );
}

/* ──────────────────── Magnetic / tilt interactive wrapper ──────────────── */

export function Magnetic({
  children,
  className,
  strength = 0.28,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  as?: "div" | "span";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, springSnappy);
  const sy = useSpring(y, springSnappy);

  const MotionTag = Tag === "span" ? motion.span : motion.div;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <MotionTag
      ref={ref as never}
      className={className}
      style={{ x: sx, y: sy }}
      onPointerMove={(e: React.PointerEvent) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
        y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </MotionTag>
  );
}

/* ───────────────── Pointer-tracking spotlight for glass cards ──────────── */

export function SpotlightCard({
  children,
  className,
  tint = "brand",
}: {
  children: React.ReactNode;
  className?: string;
  tint?: "brand" | "paona" | "dena";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const opacity = useMotionValue(0);

  const tints: Record<string, string> = {
    brand: "124 92 255",
    paona: "22 201 139",
    dena: "242 69 106",
  };

  const background = useTransform(
    [mx, my],
    ([px, py]) =>
      `radial-gradient(420px circle at ${px}% ${py}%, rgb(${tints[tint]} / 0.16), transparent 62%)`,
  );

  return (
    <div
      ref={ref}
      className={cn("group relative overflow-hidden", className)}
      onPointerMove={(e) => {
        if (reduce) return;
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        mx.set(((e.clientX - rect.left) / rect.width) * 100);
        my.set(((e.clientY - rect.top) / rect.height) * 100);
        opacity.set(1);
      }}
      onPointerLeave={() => opacity.set(0)}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background, opacity }}
        transition={{ duration: 0.3 }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

/* ─────────────────────────── Animated route shell ──────────────────────── */

export function PageTransition({
  children,
  routeKey,
}: {
  children: React.ReactNode;
  routeKey: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
        transition={{ duration: 0.34, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────────────────── Word-by-word headline ───────────────────────── */

export function SplitHeadline({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={cn("inline-block", className)}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className={cn("inline-block", wordClassName)}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: 0.85,
              ease: EASE_OUT_EXPO,
              delay: delay + i * 0.055,
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
