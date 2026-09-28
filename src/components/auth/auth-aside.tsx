"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, ShieldCheck } from "lucide-react";

import { Mark } from "@/components/brand";
import { EASE_OUT_EXPO } from "@/components/motion/primitives";
import { formatMoney } from "@/lib/money";

const SAMPLE = [
  { name: "Rafi", kind: "paona" as const, amount: 4500, when: "2 days ago" },
  { name: "Ammu", kind: "dena" as const, amount: 12000, when: "last week" },
  { name: "Tanvir", kind: "paona" as const, amount: 800, when: "yesterday" },
];

/**
 * The marketing half of the auth screen: a slowly breathing stack of cards
 * that shows the product's shape before anyone signs in.
 */
export function AuthAside() {
  const reduce = useReducedMotion();

  return (
    <aside className="relative hidden items-center justify-center overflow-hidden p-14 lg:flex">
      <div className="absolute inset-y-8 left-0 w-px bg-linear-to-b from-transparent via-white/10 to-transparent" />

      <div className="relative w-full max-w-md">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
        >
          <div className="mb-9 flex items-center gap-3">
            <div className="relative">
              <Mark className="h-11 w-11" />
              {!reduce ? (
                <span className="pulse-ring absolute inset-0 rounded-full border border-brand-400/40" />
              ) : null}
            </div>
            <div>
              <p className="font-display text-lg font-600 tracking-tight">
                Every taka, remembered
              </p>
              <p className="text-sm text-fg-muted">
                So you never have to ask twice.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-3">
          {SAMPLE.map((item, i) => {
            const isPaona = item.kind === "paona";
            return (
              <motion.div
                key={item.name}
                initial={
                  reduce ? false : { opacity: 0, x: 34, filter: "blur(8px)" }
                }
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  ease: EASE_OUT_EXPO,
                  delay: 0.18 + i * 0.11,
                }}
                className="glass flex items-center gap-4 rounded-2xl px-4 py-3.5"
              >
                <span
                  className={
                    isPaona
                      ? "flex h-10 w-10 items-center justify-center rounded-xl bg-paona-500/15 text-paona-400"
                      : "flex h-10 w-10 items-center justify-center rounded-xl bg-dena-500/15 text-dena-400"
                  }
                >
                  {isPaona ? (
                    <ArrowDownLeft className="h-[18px] w-[18px]" />
                  ) : (
                    <ArrowUpRight className="h-[18px] w-[18px]" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-[0.75rem] text-fg-subtle">
                    {isPaona ? "owes you" : "you owe"} · {item.when}
                  </p>
                </div>

                <p
                  className={
                    isPaona
                      ? "tnum text-sm font-600 text-paona-300"
                      : "tnum text-sm font-600 text-dena-300"
                  }
                >
                  {isPaona ? "+" : "−"}
                  {formatMoney(item.amount)}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO, delay: 0.62 }}
          className="mt-8 flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.02] px-4 py-3.5"
        >
          <ShieldCheck className="mt-0.5 h-[18px] w-[18px] shrink-0 text-accent-400" />
          <p className="text-[0.8125rem] leading-relaxed text-fg-muted">
            Share a <span className="text-fg">read-only</span> view of your
            wallet with your partner or family. They can look; only you can
            edit.
          </p>
        </motion.div>
      </div>
    </aside>
  );
}
