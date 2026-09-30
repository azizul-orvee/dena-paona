import type { Metadata } from "next";

import { TotalsGrid } from "@/components/app/summary";
import { Ledger } from "@/components/app/ledger";
import { SectionHeading } from "@/components/app/section-heading";
import { requireUser } from "@/lib/auth";
import { getEntries, getWalletTotals } from "@/server/queries";

export const metadata: Metadata = { title: "Home" };
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireUser();

  const [totals, recent] = await Promise.all([
    getWalletTotals(user.id),
    getEntries(user.id, { limit: 8 }),
  ]);

  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <header>
        <p className="text-[0.8125rem] text-fg-subtle">
          {greeting()}, {firstName}
        </p>
        <h1 className="mt-1 font-display text-2xl font-600 tracking-tight sm:text-[1.75rem]">
          Here&apos;s where you stand
        </h1>
      </header>

      <TotalsGrid totals={totals} />

      <section>
        <SectionHeading
          title="Recent activity"
          caption="Your latest entries, newest first"
        />
        <Ledger
          entries={recent}
          emptyTitle="No entries yet"
          emptyBody="Log the first bit of money you owe — or are owed — and your ledger starts filling in."
        />
      </section>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Up late";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
