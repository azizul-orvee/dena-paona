import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Eye,
  HandCoins,
  Lock,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Aurora } from "@/components/aurora";
import { Logo } from "@/components/brand";
import { LegalLinks } from "@/components/legal/legal-page";
import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Reveal } from "@/components/motion/primitives";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  if (await getCurrentUser()) redirect("/app");

  return (
    <div className="grain relative min-h-dvh overflow-x-hidden">
      <Aurora />

      <header className="relative z-20 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-8">
          <Logo markClassName="h-7 w-7 sm:h-8 sm:w-8" />
          <nav className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link
              href="/login"
              className="hidden h-10 items-center whitespace-nowrap rounded-full px-3 text-[0.875rem] min-[360px]:inline-flex font-medium text-fg-muted transition-colors hover:text-fg sm:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="group inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-linear-to-br from-brand-400 to-brand-600 px-4 text-[0.875rem] font-medium text-white shadow-[0_10px_30px_-14px_rgb(124_92_255/0.95)] transition-transform duration-200 hover:scale-[1.03] active:scale-95 sm:px-5"
            >
              Get started
              <ArrowRight className="hidden h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 min-[400px]:block" />
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <Hero />

        <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[0.75rem] font-medium text-fg-muted">
              <Sparkles className="h-3.5 w-3.5 text-accent-400" />
              Built for the way money actually moves between people
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h2 className="mt-6 max-w-2xl font-display text-[2rem] font-600 leading-[1.12] tracking-[-0.03em] sm:text-[2.75rem]">
              Two sides of one ledger.
              <span className="block text-fg-muted">
                Nothing else to think about.
              </span>
            </h2>
          </Reveal>

          <FeatureGrid />
        </section>

        <HowItWorks />

        <section className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8 sm:pb-32">
          <Reveal>
            <div className="glass relative overflow-hidden rounded-[2rem] px-6 py-14 text-center sm:px-14 sm:py-20">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-1/2 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, rgb(124 92 255 / 0.18), transparent 65%)",
                }}
              />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl font-display text-[1.75rem] font-600 leading-[1.15] tracking-[-0.03em] sm:text-[2.5rem]">
                  Stop keeping it all in your head.
                </h2>
                <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-fg-muted">
                  It takes about a minute to set up, and you&apos;ll never have
                  the awkward &ldquo;wait, how much was it?&rdquo; conversation
                  again.
                </p>
                <Link
                  href="/login"
                  className="group mt-9 inline-flex items-center gap-2 rounded-full bg-linear-to-br from-brand-400 to-brand-600 px-7 py-3.5 text-[0.9375rem] font-medium text-white shadow-[0_18px_44px_-16px_rgb(124_92_255/1)] transition-transform duration-200 hover:scale-[1.03] active:scale-95"
                >
                  Create your free account
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.75rem] text-fg-subtle">
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5" /> Sign in with Google
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> Private by default
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Wallet className="h-3.5 w-3.5" /> Free to use
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/6">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row sm:px-8">
          <Logo />
          <p className="flex items-center gap-1.5 text-[0.75rem] text-fg-subtle">
            <HandCoins className="h-3.5 w-3.5" />
            Dena-Paona — a quieter way to keep track.
          </p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
