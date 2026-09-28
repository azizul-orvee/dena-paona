import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import { Ledger } from "@/components/app/ledger";
import { KindSummary } from "@/components/app/kind-summary";
import type { EntryRow, WalletTotals } from "@/server/queries";

/**
 * Shared shell for the two single-kind pages so dena and paona stay
 * structurally identical and only the language and colour change.
 */
export function KindPage({
  kind,
  entries,
  totals,
  readOnly = false,
}: {
  kind: "dena" | "paona";
  entries: EntryRow[];
  totals: WalletTotals;
  readOnly?: boolean;
}) {
  const isPaona = kind === "paona";

  const copy = isPaona
    ? {
        title: "Paona",
        subtitle: "Money people owe you",
        Icon: ArrowDownLeft,
        emptyTitle: "No paona yet",
        emptyBody:
          "When you lend something out or cover a bill for someone, add it here so it doesn't quietly disappear.",
      }
    : {
        title: "Dena",
        subtitle: "Money you owe",
        Icon: ArrowUpRight,
        emptyTitle: "No dena yet",
        emptyBody:
          "Nothing outstanding on your side. Add anything you've borrowed so you can clear it on time.",
      };

  const outstanding = isPaona ? totals.paonaOutstanding : totals.denaOutstanding;
  const settled = isPaona ? totals.paonaSettled : totals.denaSettled;
  const openCount = isPaona ? totals.paonaCount : totals.denaCount;

  return (
    <div className="space-y-7">
      <header className="flex items-center gap-3.5">
        <span
          className={
            isPaona
              ? "grid h-11 w-11 place-items-center rounded-2xl bg-paona-500/12 text-paona-300 ring-1 ring-inset ring-paona-500/25"
              : "grid h-11 w-11 place-items-center rounded-2xl bg-dena-500/12 text-dena-300 ring-1 ring-inset ring-dena-500/25"
          }
        >
          <copy.Icon className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-600 tracking-tight">
            {copy.title}
          </h1>
          <p className="text-[0.8125rem] text-fg-subtle">{copy.subtitle}</p>
        </div>
      </header>

      <KindSummary
        kind={kind}
        outstanding={outstanding}
        settled={settled}
        openCount={openCount}
        entryCount={entries.length}
      />

      <Ledger
        entries={entries}
        defaultKind={kind}
        readOnly={readOnly}
        emptyTitle={copy.emptyTitle}
        emptyBody={copy.emptyBody}
      />
    </div>
  );
}
