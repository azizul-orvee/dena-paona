import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Aurora } from "@/components/aurora";
import { Logo } from "@/components/brand";
import { cn } from "@/lib/utils";

/** Where people reach the owner about privacy, deletion or the terms. */
export const CONTACT_EMAIL = "orvee16@gmail.com";

/** Shared shell for /privacy and /terms: plain, readable, no motion. */
export function LegalPage({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  /** Human-readable "last updated" date. */
  updated: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grain relative min-h-dvh overflow-x-hidden">
      <Aurora />

      <header className="relative z-20">
        <div className="mx-auto flex h-20 w-full max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex rounded-xl transition-opacity hover:opacity-80"
            aria-label="Dena-Paona home"
          >
            <Logo />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle transition-colors hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-5 pb-24 pt-6 sm:px-8 sm:pt-10">
        <h1 className="font-display text-[2rem] font-600 leading-[1.1] tracking-tight sm:text-[2.5rem]">
          {title}
        </h1>
        <p className="mt-2 text-[0.8125rem] text-fg-subtle">
          Last updated {updated}
        </p>
        <div className="mt-6 text-[0.9375rem] leading-relaxed text-fg-muted">
          {intro}
        </div>

        <div className="mt-10 space-y-9">{children}</div>

        <LegalFooter />
      </main>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-[1.125rem] font-600 tracking-tight text-fg">
        {title}
      </h2>
      <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-fg-muted [&_a]:text-brand-300 [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:font-600 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

/** Privacy + terms links, used on the legal pages, landing and login. */
export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Legal"
      className={cn("flex items-center gap-4 text-[0.75rem] text-fg-subtle", className)}
    >
      <Link href="/privacy" className="transition-colors hover:text-fg">
        Privacy
      </Link>
      <Link href="/terms" className="transition-colors hover:text-fg">
        Terms
      </Link>
    </nav>
  );
}

function LegalFooter() {
  return (
    <div className="mt-16 flex flex-col gap-3 border-t border-white/6 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[0.75rem] text-fg-subtle">
        Questions?{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-fg-muted underline underline-offset-2 hover:text-fg"
        >
          {CONTACT_EMAIL}
        </a>
      </p>
      <LegalLinks />
    </div>
  );
}
