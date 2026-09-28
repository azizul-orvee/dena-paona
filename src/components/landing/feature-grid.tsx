"use client";

import {
  ArrowLeftRight,
  BellRing,
  Eye,
  PieChart,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { Reveal, SpotlightCard } from "@/components/motion/primitives";

const FEATURES = [
  {
    icon: ArrowLeftRight,
    title: "Dena and paona, side by side",
    body: "Two clean columns instead of one confusing pile. Every entry knows which direction the money is going.",
    tint: "brand" as const,
  },
  {
    icon: PieChart,
    title: "One number that matters",
    body: "Your net position, updated the moment anything changes — so you always know if you're up or down.",
    tint: "paona" as const,
  },
  {
    icon: Wallet,
    title: "Settle in parts",
    body: "Got half back? Record it. The balance adjusts and the entry closes itself once it's fully paid.",
    tint: "paona" as const,
  },
  {
    icon: Eye,
    title: "Share, don't hand over",
    body: "Give your partner or family a read-only window into your wallet. They can see everything; only you can change it.",
    tint: "brand" as const,
  },
  {
    icon: BellRing,
    title: "Due dates that speak up",
    body: "Anything past its date is flagged, so the gentle reminder comes from the app instead of from you.",
    tint: "dena" as const,
  },
  {
    icon: ShieldCheck,
    title: "Yours alone by default",
    body: "Google sign-in and a private ledger. Nothing is visible to anyone until you say so.",
    tint: "brand" as const,
  },
];

export function FeatureGrid() {
  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, body, tint }, i) => (
        <Reveal key={title} delay={Math.min(i * 0.05, 0.3)}>
          <SpotlightCard
            tint={tint}
            className="glass h-full rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
          >
            <span
              className={
                tint === "paona"
                  ? "grid h-10 w-10 place-items-center rounded-xl bg-paona-500/12 text-paona-300 ring-1 ring-inset ring-paona-500/25"
                  : tint === "dena"
                    ? "grid h-10 w-10 place-items-center rounded-xl bg-dena-500/12 text-dena-300 ring-1 ring-inset ring-dena-500/25"
                    : "grid h-10 w-10 place-items-center rounded-xl bg-brand-500/12 text-brand-300 ring-1 ring-inset ring-brand-500/25"
              }
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>

            <h3 className="mt-5 font-display text-[1.0625rem] font-600 leading-snug tracking-tight">
              {title}
            </h3>
            <p className="mt-2 text-[0.875rem] leading-relaxed text-fg-muted">
              {body}
            </p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}
