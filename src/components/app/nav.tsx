"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  LayoutDashboard,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/app", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/app/paona", label: "Paona", icon: ArrowDownLeft, exact: false },
  { href: "/app/dena", label: "Dena", icon: ArrowUpRight, exact: false },
  { href: "/app/shared", label: "Shared", icon: Users, exact: false },
] as const;

function useActiveHref() {
  const pathname = usePathname();
  const match = LINKS.filter((l) =>
    l.exact ? pathname === l.href : pathname.startsWith(l.href),
  ).sort((a, b) => b.href.length - a.href.length)[0];
  return match?.href ?? "/app";
}

/** Desktop rail. The active pill slides between items via a shared layoutId. */
export function SideNav() {
  const active = useActiveHref();
  const reduce = useReducedMotion();

  return (
    <nav aria-label="Primary" className="hidden lg:block">
      <ul className="space-y-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = active === href;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-200",
                  isActive
                    ? "text-fg"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-xl border border-white/10 bg-white/[0.06]"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 36 }
                    }
                  />
                ) : null}
                <Icon
                  className={cn(
                    "h-[17px] w-[17px] transition-transform duration-200",
                    !isActive && "group-hover:scale-110",
                  )}
                />
                <span className="font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Mobile tab bar, thumb-reachable, with the same sliding indicator. */
export function TabBar() {
  const active = useActiveHref();
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/8 bg-ink-950/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const isActive = active === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex flex-col items-center gap-1 px-2 pb-2.5 pt-3 text-[0.6875rem] font-medium transition-colors",
                  isActive ? "text-fg" : "text-fg-subtle",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute inset-x-4 top-0 h-[2px] rounded-full bg-linear-to-r from-brand-400 to-accent-400"
                    transition={
                      reduce
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 500, damping: 40 }
                    }
                  />
                ) : null}
                <motion.span
                  animate={reduce ? undefined : { scale: isActive ? 1.12 : 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 24 }}
                >
                  <Icon className="h-[19px] w-[19px]" />
                </motion.span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
