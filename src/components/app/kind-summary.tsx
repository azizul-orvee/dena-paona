"use client";

import { motion } from "motion/react";

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
  settled,
  openCount,
  entryCount,
}: {
  kind: "dena" | "paona";
  outstanding: number;
  settled: number;
  openCount: number;
  entryCount: number;
}) {
  const isPaona = kind === "paona";
  const accent = isPaona ? "text-paona-300" : "text-dena-300";

  const stats = [
    { label: "Settled so far", value: settled, money: true },
    { label: "Open entries", value: openCount, money: false },
    { label: "Total records", value: entryCount, money: false },
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

        <motion.dl
          variants={fadeUp}
          className="mt-6 grid grid-cols-3 gap-4 border-t border-white/8 pt-5"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[0.6875rem] uppercase tracking-wider text-fg-subtle">
                {stat.label}
              </dt>
              <dd className="tnum mt-1 font-display text-base font-600 sm:text-lg">
                {stat.money ? (
                  <>
                    <span className="text-[0.75em] opacity-70">
                      {CURRENCY_SYMBOL}
                    </span>
                    <AnimatedNumber value={stat.value} format={formatAmount} />
                  </>
                ) : (
                  <AnimatedNumber value={stat.value} />
                )}
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>
    </SpotlightCard>
  );
}
