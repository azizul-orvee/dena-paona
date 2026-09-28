"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { Reveal } from "@/components/motion/primitives";

const STEPS = [
  {
    n: "01",
    title: "Create your account",
    body: "One tap with your Google account. No password to remember.",
  },
  {
    n: "02",
    title: "Log what moved",
    body: "Add a dena or a paona in a few seconds — who, how much, and optionally why and when it's due.",
  },
  {
    n: "03",
    title: "Watch the balance settle",
    body: "Record part payments as they come in. Entries close themselves once they're square.",
  },
  {
    n: "04",
    title: "Let the right people look",
    body: "Grant read-only access by email. Revoke it any time, from the same screen.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.55"],
  });

  // The rail fills as the section scrolls past.
  const railScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={ref}
      className="relative mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-20"
    >
      <Reveal>
        <h2 className="max-w-xl font-display text-[2rem] font-600 leading-[1.12] tracking-[-0.03em] sm:text-[2.75rem]">
          Four steps, then it just runs.
        </h2>
      </Reveal>

      <div className="relative mt-14 pl-10 sm:pl-16">
        {/* Track */}
        <div
          aria-hidden
          className="absolute bottom-2 left-[13px] top-2 w-px bg-white/8 sm:left-[23px]"
        />
        {/* Progress fill */}
        <motion.div
          aria-hidden
          className="absolute bottom-2 left-[13px] top-2 w-px origin-top bg-linear-to-b from-brand-400 via-accent-400 to-transparent sm:left-[23px]"
          style={{ scaleY: reduce ? 1 : railScale }}
        />

        <ol className="space-y-11 sm:space-y-14">
          {STEPS.map((step, i) => (
            <li key={step.n} className="relative">
              <Reveal delay={i * 0.04}>
                <span
                  aria-hidden
                  className="absolute -left-10 top-1 grid h-7 w-7 place-items-center rounded-full border border-white/12 bg-ink-900 text-[0.625rem] font-700 text-brand-300 sm:-left-16 sm:h-12 sm:w-12 sm:text-[0.75rem]"
                >
                  {step.n}
                </span>
                <h3 className="font-display text-[1.125rem] font-600 tracking-tight sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-lg text-[0.9375rem] leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
