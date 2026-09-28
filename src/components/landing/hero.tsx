"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

import {
  AnimatedNumber,
  EASE_OUT_EXPO,
  Magnetic,
  SplitHeadline,
} from "@/components/motion/primitives";
import { CURRENCY_SYMBOL, formatAmount, formatMoney } from "@/lib/money";

const DEMO_ENTRIES = [
  { name: "Rafi", kind: "paona", amount: 4500, note: "cricket tickets" },
  { name: "Ammu", kind: "dena", amount: 2400, note: "rickshaw fund" },
  { name: "Nusrat", kind: "paona", amount: 2300, note: "dinner at Star" },
  { name: "Shakib", kind: "dena", amount: 950, note: "coffee run" },
] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Gentle parallax: the card stack drifts slower than the copy.
  const cardY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);
  const cardOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);

  return (
    <section
      ref={ref}
      className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 pb-10 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-24"
    >
      <motion.div style={{ y: copyY }}>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[0.75rem] font-medium text-fg-muted"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-400" />
          </span>
          দেনা-পাওনা · dues &amp; receivables
        </motion.p>

        <h1 className="mt-6 font-display text-[2.6rem] font-700 leading-[1.02] tracking-[-0.04em] sm:text-[3.75rem] lg:text-[4.1rem]">
          <SplitHeadline text="Know exactly" />
          <span className="block">
            <SplitHeadline text="who owes" delay={0.14} />{" "}
            <span className="text-gradient">
              <SplitHeadline text="whom." delay={0.26} />
            </span>
          </span>
        </h1>

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.42 }}
          className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-fg-muted"
        >
          Dena-Paona is a private ledger for the money that moves between
          friends and family. Log what you owe, what you&apos;re owed, and let
          the people you trust look in — without ever handing over control.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.52 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Magnetic strength={0.2}>
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-linear-to-br from-brand-400 to-brand-600 px-6 py-3.5 text-[0.9375rem] font-medium text-white shadow-[0_18px_44px_-16px_rgb(124_92_255/1)] transition-transform duration-200 hover:scale-[1.02] active:scale-95"
            >
              Start your ledger
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </Magnetic>

          <Link
            href="/login"
            className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3.5 text-[0.9375rem] font-medium text-fg-muted transition-colors hover:bg-white/[0.07] hover:text-fg"
          >
            I already have an account
          </Link>
        </motion.div>
      </motion.div>

      {/* Product preview */}
      <motion.div
        style={{ y: cardY, opacity: cardOpacity }}
        className="relative"
      >
        <DemoWallet />
      </motion.div>
    </section>
  );
}

function DemoWallet() {
  const reduce = useReducedMotion();
  const paona = DEMO_ENTRIES.filter((e) => e.kind === "paona").reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const dena = DEMO_ENTRIES.filter((e) => e.kind === "dena").reduce(
    (sum, e) => sum + e.amount,
    0,
  );
  const net = paona - dena;

  return (
    <motion.div
      initial={
        reduce
          ? false
          : { opacity: 0, y: 40, rotateX: 10, filter: "blur(14px)" }
      }
      animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
      transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.25 }}
      className="glass-strong relative rounded-[1.75rem] p-5 sm:p-6"
      style={{ perspective: 1200 }}
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-[1.75rem] opacity-60"
        style={{
          background:
            "linear-gradient(140deg, rgb(124 92 255 / 0.25), transparent 40%, rgb(35 213 200 / 0.18))",
          maskImage:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: 1,
        }}
      />

      <p className="text-[0.75rem] font-medium text-fg-muted">Net position</p>
      <p
        className={
          net >= 0
            ? "mt-2 font-display text-[2.5rem] font-700 leading-none tracking-[-0.03em] text-paona-300"
            : "mt-2 font-display text-[2.5rem] font-700 leading-none tracking-[-0.03em] text-dena-300"
        }
      >
        {net < 0 ? "\u2212" : "+"}
        <span className="mx-0.5 align-top text-[0.5em] font-500 opacity-70">
          {CURRENCY_SYMBOL}
        </span>
        <AnimatedNumber value={Math.abs(net)} format={formatAmount} />
      </p>

      <div className="mt-5 flex h-2 gap-1 overflow-hidden rounded-full bg-ink-700/70">
        <motion.div
          className="rounded-full bg-linear-to-r from-paona-500 to-paona-300"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${(paona / (paona + dena)) * 100}%` }}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.7 }}
        />
        <motion.div
          className="rounded-full bg-linear-to-r from-dena-400 to-dena-500"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${(dena / (paona + dena)) * 100}%` }}
          transition={{ duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.78 }}
        />
      </div>

      <div className="mt-5 space-y-2">
        {DEMO_ENTRIES.map((entry, i) => {
          const isPaona = entry.kind === "paona";
          return (
            <motion.div
              key={entry.name}
              initial={reduce ? false : { opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.7,
                ease: EASE_OUT_EXPO,
                delay: 0.6 + i * 0.09,
              }}
              className="flex items-center gap-3 rounded-2xl border border-white/6 bg-white/[0.025] px-3.5 py-3"
            >
              <span
                className={
                  isPaona
                    ? "grid h-8 w-8 place-items-center rounded-lg bg-paona-500/15 text-paona-400"
                    : "grid h-8 w-8 place-items-center rounded-lg bg-dena-500/15 text-dena-400"
                }
              >
                {isPaona ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[0.875rem] font-medium">
                  {entry.name}
                </p>
                <p className="truncate text-[0.6875rem] text-fg-subtle">
                  {entry.note}
                </p>
              </div>
              <p
                className={
                  isPaona
                    ? "tnum text-[0.875rem] font-600 text-paona-300"
                    : "tnum text-[0.875rem] font-600 text-dena-300"
                }
              >
                {isPaona ? "+" : "−"}
                {formatMoney(entry.amount)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
