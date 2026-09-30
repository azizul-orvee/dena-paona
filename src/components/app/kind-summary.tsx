"use client";

import { motion } from "motion/react";
import { PartyPopper, Sparkles } from "lucide-react";

import {
  AnimatedNumber,
  SpotlightCard,
  fadeUp,
  stagger,
} from "@/components/motion/primitives";
import { CURRENCY_SYMBOL, formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export function KindSummary({
  kind,
  outstanding,
  openCount,
  entryCount,
}: {
  kind: "dena" | "paona";
  outstanding: number;
  openCount: number;
  entryCount: number;
}) {
  const isPaona = kind === "paona";
  const accent = isPaona ? "text-paona-300" : "text-dena-300";
  const EmptyIcon = isPaona ? Sparkles : PartyPopper;

  const stats = [
    { label: "Open entries", value: openCount },
    { label: "Total records", value: entryCount },
  ];

  return (
    <SpotlightCard
      tint={kind}
      className="glass rounded-3xl p-6 sm:p-7"
    >
      <motion.div variants={stagger(0.07)} initial="hidden" animate="show">
        <motion.p
          variants={fadeUp}
          className="text-[0.8125rem] font-medium text-fg-muted"
        >
          {isPaona ? "Still to come in" : "Still to pay out"}
        </motion.p>

        {outstanding < 0.005 ? (
          <motion.div variants={fadeUp} className="mt-3">
            <p
              className={cn(
                "flex items-center gap-2.5 font-display text-[1.75rem] font-700 leading-tight tracking-tight sm:text-[2.25rem]",
                accent,
              )}
            >
              <EmptyIcon className="h-7 w-7 shrink-0" />
              {isPaona ? "All collected" : "Debt-free"}
            </p>
            <p className="mt-2 text-[0.875rem] text-fg-muted">
              {isPaona
                ? "Nobody owes a single taka right now."
                : "Not a single taka owed to anyone. Enjoy the feeling."}
            </p>
          </motion.div>
        ) : (
          <motion.p
            variants={fadeUp}
            className={cn(
              "mt-3 font-display text-[2.5rem] font-700 leading-none tracking-[-0.03em] sm:text-[3.25rem]",
              accent,
            )}
          >
            <span className="mr-0.5 align-top text-[0.55em] font-500 opacity-70">
              {CURRENCY_SYMBOL}
            </span>
            <AnimatedNumber value={outstanding} format={formatAmount} />
          </motion.p>
        )}

        <motion.dl
          variants={fadeUp}
          className="mt-6 grid grid-cols-2 gap-4 border-t border-white/8 pt-5"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[0.6875rem] uppercase tracking-wider text-fg-subtle">
                {stat.label}
              </dt>
              <dd className="tnum mt-1 font-display text-base font-600 sm:text-lg">
                <AnimatedNumber value={stat.value} />
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </SpotlightCard>
  );
}
