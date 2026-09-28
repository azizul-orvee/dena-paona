import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { KindPage } from "@/components/app/kind-page";
import { requireUser } from "@/lib/auth";
import {
  getAuthorisedWalletOwner,
  getEntries,
  getWalletTotals,
} from "@/server/queries";

export const metadata: Metadata = { title: "Paona" };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ ownerId: string }> };

export default async function SharedPaonaPage({ params }: Props) {
  const { ownerId } = await params;
  const viewer = await requireUser();

  const owner = await getAuthorisedWalletOwner(viewer.id, ownerId);
  if (!owner) notFound();

  const [entries, totals] = await Promise.all([
    getEntries(owner.id, { kind: "paona" }),
    getWalletTotals(owner.id),
  ]);

  return (
    <div className="space-y-5">
      <Link
        href={`/app/shared/${owner.id}`}
        className="inline-flex items-center gap-1.5 text-[0.8125rem] text-fg-subtle transition-colors hover:text-fg"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {owner.name.split(" ")[0]}&apos;s wallet
      </Link>
      <KindPage kind="paona" entries={entries} totals={totals} readOnly />
    </div>
  );
}
