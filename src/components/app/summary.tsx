"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  PartyPopper,
  Sparkles,
} from "lucide-react";

import {
  AnimatedNumber,
  SpotlightCard,
  fadeUp,
  stagger,
} from "@/components/motion/primitives";
import { CURRENCY_SYMBOL, formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { WalletTotals } from "@/server/queries";

/**
 * Total paona and total dena, side by side. Each is a plain sum of what's
 * still open on that side — the two are never netted against each other.
 * `ownerLabel` switches the copy to third person for a shared wallet.
 */
export function TotalsGrid({
  totals,
  basePath = "/app",
  ownerLabel,
}: {
  totals: WalletTotals;
  basePath?: string;
  ownerLabel?: string;
}) {
  const cards = [
    {
      kind: "paona" as const,
      label: "Total paona",
      sublabel: `owed to ${ownerLabel ?? "you"}`,
      icon: ArrowDownLeft,
      value: totals.paonaOutstanding,
      count: totals.paonaCount,
      emptyIcon: Sparkles,
      emptyTitle: "Nothing to collect",
      emptyBody: ownerLabel
        ? `Nobody owes ${ownerLabel} anything right now.`
        : "Nobody owes you anything right now.",
      href: `${basePath}/paona`,
      accent: "text-paona-300",
      chip: "bg-paona-500/12 text-paona-300 ring-paona-500/25",
      border: "hover:border-paona-500/35",
    },
    {
      kind: "dena" as const,
      label: "Total dena",
      sublabel: ownerLabel ? `${ownerLabel} owes` : "you owe",
      icon: ArrowUpRight,
      value: totals.denaOutstanding,
      count: totals.denaCount,
      emptyIcon: PartyPopper,
      emptyTitle: "Debt-free",
      emptyBody: ownerLabel
        ? `${ownerLabel} doesn't owe anyone a single taka.`
        : "You don't owe anyone a single taka. Enjoy it.",
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
          emptyIcon: EmptyIcon,
          emptyTitle,
          emptyBody,
          href,
          accent,
          chip,
          border,
        }) => {
          const empty = value < 0.005;
          return (
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

                  {empty ? (
                    <div className="mt-5">
                      <p
                        className={cn(
                          "flex items-center gap-2 font-display text-[1.375rem] font-700 tracking-tight sm:text-[1.5rem]",
                          accent,
                        )}
                      >
                        <EmptyIcon className="h-5 w-5 shrink-0" />
                        {emptyTitle}
                      </p>
                      <p className="mt-2 text-[0.8125rem] text-fg-muted">
                        {emptyBody}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p
                        className={cn(
                          "mt-5 font-display text-[1.75rem] font-700 tracking-tight sm:text-[2rem]",
                          accent,
                        )}
                      >
                        <span className="mr-0.5 align-top text-[0.6em] font-500 opacity-70">
                          {CURRENCY_SYMBOL}
                        </span>
                        <AnimatedNumber value={value} format={formatAmount} />
                      </p>
                      <p className="mt-3 text-[0.75rem] text-fg-subtle">
                        {count} open {count === 1 ? "entry" : "entries"}
                      </p>
                    </>
                  )}
                </SpotlightCard>
              </Link>
            </motion.div>
          );
        },
      )}
    </motion.div>
  );
}
