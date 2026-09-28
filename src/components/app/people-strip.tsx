"use client";

import { motion, useReducedMotion } from "motion/react";

import { formatMoney } from "@/lib/money";
import { cn, hueFromString, initials } from "@/lib/utils";

type Person = {
  name: string;
  dena: number;
  paona: number;
  net: number;
  openCount: number;
};

/**
 * Horizontally scrollable rollup — who you're net up or down with.
 */
export function PeopleStrip({ people }: { people: Person[] }) {
  const reduce = useReducedMotion();

  return (
    <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-3">
        {people.map((person, i) => {
          const positive = person.net > 0;
          const flat = Math.abs(person.net) < 0.005;
          const hue = hueFromString(person.name.toLowerCase());

          return (
            <motion.div
              key={person.name}
              initial={
                reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                delay: Math.min(i * 0.05, 0.4),
              }}
              whileHover={reduce ? undefined : { y: -3 }}
              className="glass w-[13.5rem] shrink-0 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="grid h-9 w-9 place-items-center rounded-xl text-[0.75rem] font-700 ring-1 ring-inset ring-white/10"
                  style={{
                    background: `linear-gradient(140deg, hsl(${hue} 62% 22%), hsl(${(hue + 44) % 360} 58% 14%))`,
                    color: `hsl(${hue} 85% 82%)`,
                  }}
                  aria-hidden
                >
                  {initials(person.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.875rem] font-medium">
                    {person.name}
                  </p>
                  <p className="text-[0.6875rem] text-fg-subtle">
                    {person.openCount} open
                  </p>
                </div>
              </div>

              <p
                className={cn(
                  "tnum mt-3.5 font-display text-lg font-700 tracking-tight",
                  flat
                    ? "text-fg-muted"
                    : positive
                      ? "text-paona-300"
                      : "text-dena-300",
                )}
              >
                {flat ? "" : positive ? "+" : "−"}
                {formatMoney(Math.abs(person.net))}
              </p>
              <p className="mt-0.5 text-[0.6875rem] text-fg-subtle">
                {flat
                  ? "all square"
                  : positive
                    ? "owes you, net"
                    : "you owe, net"}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
