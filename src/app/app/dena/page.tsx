import type { Metadata } from "next";

import { KindPage } from "@/components/app/kind-page";
import { requireUser } from "@/lib/auth";
import { getEntries, getWalletTotals } from "@/server/queries";

export const metadata: Metadata = { title: "Dena" };
export const dynamic = "force-dynamic";

export default async function DenaPage() {
  const user = await requireUser();
  const [entries, totals] = await Promise.all([
    getEntries(user.id, { kind: "dena" }),
    getWalletTotals(user.id),
  ]);

  return <KindPage kind="dena" entries={entries} totals={totals} />;
}
