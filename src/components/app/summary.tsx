"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

import {
  AnimatedNumber,
  EASE_OUT_EXPO,
  SpotlightCard,
  fadeUp,
  stagger,
} from "@/components/motion/primitives";
import { CURRENCY_SYMBOL, formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { WalletTotals } from "@/server/queries";

/** The one number that answers "where do I actually stand?" */
export function BalanceHero({
  totals,
  ownerLabel,
}: {
  totals: WalletTotals;
  ownerLabel?: string;
}) {
  const reduce = useReducedMotion();
  const net = totals.net;
  const positive = net > 0;
  const flat = Math.abs(net) < 0.005;

  // Third person when we're looking at someone else's shared wallet.
  const who = ownerLabel ?? "You";
  const tone = flat
    ? { text: "text-fg", glow: "rgb(124 92 255 / 0.18)", label: "All square" }
    : positive
      ? {
          text: "text-paona-300",
          glow: "rgb(22 201 139 / 0.20)",
          label: ownerLabel
            ? `${who} is owed overall`
            : "You're owed overall",
        }
      : {
          text: "text-dena-300",
          glow: "rgb(242 69 106 / 0.20)",
          label: ownerLabel ? `${who} owes overall` : "You owe overall",
        };

  return (
    <SpotlightCard
      tint={flat ? "brand" : positive ? "paona" : "dena"}
      className="glass rounded-[1.75rem] p-6 sm:p-8"
    >
      <motion.div
        variants={stagger(0.07)}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <motion.div variants={fadeUp} className="flex items-center gap-2.5">
          <Scale className="h-4 w-4 text-fg-subtle" />
          <p className="text-[0.8125rem] font-medium tracking-wide text-fg-muted">
            {ownerLabel ? `${ownerLabel} · net position` : "Net position"}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-4">
          <p
            className={cn(
              "font-display text-[2.75rem] font-700 leading-[0.95] tracking-[-0.03em] sm:text-[4rem]",
              tone.text,
            )}
            style={reduce ? undefined : { textShadow: `0 0 60px ${tone.glow}` }}
          >
            {flat ? null : (
              <span className="mr-1 font-500 opacity-80">
                {positive ? "+" : "−"}
              </span>
            )}
            <span className="mr-0.5 align-top text-[0.5em] font-500 opacity-70">
              {CURRENCY_SYMBOL}
            </span>
            <AnimatedNumber value={Math.abs(net)} format={formatAmount} />
          </p>
        </motion.div>

        <motion.p
          variants={fadeUp}
          className="mt-2.5 text-sm text-fg-muted"
        >
          {flat
            ? "Nothing outstanding in either direction."
            : `${tone.label} · across ${totals.denaCount + totals.paonaCount} open ${
                totals.denaCount + totals.paonaCount === 1 ? "entry" : "entries"
              }`}
        </motion.p>

        {/* Proportional bar: how much of the ledger leans each way */}
        <motion.div variants={fadeUp} className="mt-6">
          <BalanceBar
            paona={totals.paonaOutstanding}
            dena={totals.denaOutstanding}
          />
        </motion.div>
      </motion.div>
    </SpotlightCard>
  );
}

function BalanceBar({ paona, dena }: { paona: number; dena: number }) {
  const total = paona + dena;
  const paonaPct = total > 0 ? (paona / total) * 100 : 50;
  const reduce = useReducedMotion();

  return (
    <div>
      <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full bg-ink-700/70">
        <motion.div
          className="rounded-full bg-linear-to-r from-paona-500 to-paona-300"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${total > 0 ? paonaPct : 0}%` }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.25 }}
        />
        <motion.div
          className="rounded-full bg-linear-to-r from-dena-400 to-dena-500"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: `${total > 0 ? 100 - paonaPct : 0}%` }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: 0.3 }}
        />
      </div>
      <div className="mt-2.5 flex justify-between text-[0.75rem] text-fg-subtle">
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-paona-400" />
          Paona {Math.round(total > 0 ? paonaPct : 0)}%
        </span>
        <span className="flex items-center gap-1.5">
          Dena {Math.round(total > 0 ? 100 - paonaPct : 0)}%
          <span className="h-1.5 w-1.5 rounded-full bg-dena-400" />
        </span>
      </div>
    </div>
  );
}

/** The two side-by-side totals. Links through to the full list. */
export function TotalsGrid({
  totals,
  basePath = "/app",
}: {
  totals: WalletTotals;
  basePath?: string;
}) {
  const cards = [
    {
      kind: "paona" as const,
      label: "Paona",
      sublabel: "owed to you",
      icon: ArrowDownLeft,
      value: totals.paonaOutstanding,
      count: totals.paonaCount,
      settled: totals.paonaSettled,
      href: `${basePath}/paona`,
      accent: "text-paona-300",
      chip: "bg-paona-500/12 text-paona-300 ring-paona-500/25",
      border: "hover:border-paona-500/35",
    },
    {
      kind: "dena" as const,
      label: "Dena",
      sublabel: "you owe",
      icon: ArrowUpRight,
      value: totals.denaOutstanding,
      count: totals.denaCount,
      settled: totals.denaSettled,
      href: `${basePath}/dena`,
      accent: "text-dena-300",
      chip: "bg-dena-500/12 text-dena-300 ring-dena-500/25",
      border: "hover:border-dena-500/35",
    },
  ];

  return (
    <motion.div
      variants={stagger(0.08, 0.1)}
      initial="hidden"
      animate="show"
      className="grid gap-4 sm:grid-cols-2"
    >
      {cards.map(
        ({
          kind,
          label,
          sublabel,
          icon: Icon,
          value,
          count,
          settled,
          href,
          accent,
          chip,
          border,
        }) => (
          <motion.div key={kind} variants={fadeUp}>
            <Link href={href} className="block h-full rounded-3xl">
              <SpotlightCard
                tint={kind}
                className={cn(
                  "glass h-full rounded-3xl border border-white/8 p-5 transition-all duration-300 hover:-translate-y-0.5 sm:p-6",
                  border,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-base font-600">{label}</p>
                    <p className="text-[0.75rem] text-fg-subtle">{sublabel}</p>
                  </div>
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-xl ring-1",
                      chip,
                    )}
                  >
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                </div>

                <p
                  className={cn(
                    "mt-5 font-display text-[1.75rem] font-700 tracking-tight sm:text-[2rem]",
                    accent,
                  )}
                >
                  <span className="mr-0.5 text-[0.6em] align-top font-500 opacity-70">
                    {CURRENCY_SYMBOL}
                  </span>
                  <AnimatedNumber value={value} format={formatAmount} />
                </p>

                <div className="mt-3 flex items-center gap-2 text-[0.75rem] text-fg-subtle">
                  <span>
                    {count} open {count === 1 ? "entry" : "entries"}
                  </span>
                  {settled > 0 ? (
                    <>
                      <span className="h-0.5 w-0.5 rounded-full bg-fg-subtle" />
                      <span>
                        {CURRENCY_SYMBOL}
                        {formatAmount(settled)} settled
                      </span>
                    </>
                  ) : null}
                </div>
              </SpotlightCard>
            </Link>
          </motion.div>
        ),
      )}
    </motion.div>
  );
}
