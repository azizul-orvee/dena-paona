"use client";

import { AnimatePresence, motion } from "motion/react";
import { LogOut, Mail } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { logoutAction } from "@/server/actions/auth";
import { initials } from "@/lib/utils";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        whileTap={{ scale: 0.95 }}
        className="flex h-10 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] p-1 transition-colors hover:bg-white/[0.08] sm:pr-3"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-brand-400 to-accent-500 text-[0.75rem] font-700 text-ink-950">
          {initials(name)}
        </span>
        <span className="hidden max-w-28 truncate text-[0.8125rem] font-medium sm:block">
          {name.split(" ")[0]}
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass-strong absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(15rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl p-1.5"
          >
            <div className="px-3 py-2.5">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[0.75rem] text-fg-subtle">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate">{email}</span>
              </p>
            </div>

            <div className="my-1 h-px bg-white/8" />

            <form action={logoutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.8125rem] text-fg-muted transition-colors hover:bg-dena-500/10 hover:text-dena-300"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
