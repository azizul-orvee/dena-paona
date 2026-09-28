import type { Metadata } from "next";

import { KindPage } from "@/components/app/kind-page";
import { requireUser } from "@/lib/auth";
import { getEntries, getWalletTotals } from "@/server/queries";

export const metadata: Metadata = { title: "Paona" };
export const dynamic = "force-dynamic";

export default async function PaonaPage() {
  const user = await requireUser();
  const [entries, totals] = await Promise.all([
    getEntries(user.id, { kind: "paona" }),
    getWalletTotals(user.id),
  ]);

  return <KindPage kind="paona" entries={entries} totals={totals} />;
}
