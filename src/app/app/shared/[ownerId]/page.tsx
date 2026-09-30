import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye } from "lucide-react";

import { TotalsGrid } from "@/components/app/summary";
import { Ledger } from "@/components/app/ledger";
import { SectionHeading } from "@/components/app/section-heading";
import { requireUser } from "@/lib/auth";
import {
  getAuthorisedWalletOwner,
  getEntries,
  getWalletTotals,
} from "@/server/queries";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ ownerId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ownerId } = await params;
  const viewer = await requireUser();
  const owner = await getAuthorisedWalletOwner(viewer.id, ownerId);
  return { title: owner ? `${owner.name}'s wallet` : "Wallet" };
}

export default async function SharedWalletPage({ params }: Props) {
  const { ownerId } = await params;
  const viewer = await requireUser();

  // The only gate: a share row must exist. No row, no page.
  const owner = await getAuthorisedWalletOwner(viewer.id, ownerId);
  if (!owner) notFound();

  const [totals, entries] = await Promise.all([
    getWalletTotals(owner.id),
    getEntries(owner.id),
  ]);

  const firstName = owner.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/app/shared"
          className="inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to shared
        </Link>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-600 tracking-tight">
            {firstName}&apos;s wallet
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/12 px-2.5 py-1 text-[0.6875rem] font-medium text-brand-300 ring-1 ring-inset ring-brand-500/25">
            <Eye className="h-3 w-3" />
            read-only
          </span>
        </div>
        <p className="mt-1 text-[0.8125rem] text-fg-subtle">
          Shared with you by {owner.name} · {owner.email}
        </p>
      </div>

      <TotalsGrid
        totals={totals}
        basePath={`/app/shared/${owner.id}`}
        ownerLabel={firstName}
      />

      <section>
        <SectionHeading
          title="All entries"
          caption={`Everything in ${firstName}'s ledger`}
        />
        <Ledger entries={entries} readOnly showAddButton={false} />
      </section>
    </div>
  );
}
