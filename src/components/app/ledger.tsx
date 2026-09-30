"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { EntryCard } from "@/components/app/entry-card";
import { EntryFormModal, PaymentModal } from "@/components/app/entry-form";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { springSnappy } from "@/components/motion/primitives";
import { toNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { EntryRow } from "@/server/queries";

type StatusFilter = "open" | "settled" | "all";
type SortKey = "recent" | "amount" | "due";

const STATUS_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: "open", label: "Open" },
  { key: "settled", label: "Settled" },
  { key: "all", label: "All" },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: "recent", label: "Newest" },
  { key: "amount", label: "Largest" },
  { key: "due", label: "Due soonest" },
];

export function Ledger({
  entries,
  defaultKind = "paona",
  readOnly = false,
  emptyTitle,
  emptyBody,
  showAddButton = true,
}: {
  entries: EntryRow[];
  defaultKind?: "dena" | "paona";
  readOnly?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
  showAddButton?: boolean;
}) {
  const reduce = useReducedMotion();
  // Viewers of a shared wallet start on "All" so nothing is hidden from them.
  const [status, setStatus] = useState<StatusFilter>(readOnly ? "all" : "open");
  const [sort, setSort] = useState<SortKey>("recent");
  const [query, setQuery] = useState("");
  const [showSort, setShowSort] = useState(false);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<EntryRow | null>(null);
  const [paying, setPaying] = useState<EntryRow | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = entries.filter((e) => {
      if (status === "open" && e.settledAt !== null) return false;
      if (status === "settled" && e.settledAt === null) return false;
      if (!q) return true;
      return (
        e.personName.toLowerCase().includes(q) ||
        (e.note?.toLowerCase().includes(q) ?? false) ||
        (e.personPhone?.includes(q) ?? false) ||
        (e.personAddress?.toLowerCase().includes(q) ?? false)
      );
    });

    const sorted = [...filtered];
    if (sort === "amount") {
      sorted.sort(
        (a, b) =>
          toNumber(b.amount) -
          toNumber(b.amountPaid) -
          (toNumber(a.amount) - toNumber(a.amountPaid)),
      );
    } else if (sort === "due") {
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    }
    return sorted;
  }, [entries, status, sort, query]);

  const hasAnyEntries = entries.length > 0;

  return (
    <div>
      {/* Controls */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div
          role="tablist"
          aria-label="Filter by status"
          className="relative flex gap-0.5 rounded-full border border-white/8 bg-ink-850/60 p-1"
        >
          {STATUS_OPTIONS.map(({ key, label }) => {
            const active = status === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setStatus(key)}
                className={cn(
                  "relative z-10 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors duration-200",
                  active ? "text-fg" : "text-fg-subtle hover:text-fg-muted",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="status-thumb"
                    transition={reduce ? { duration: 0 } : springSnappy}
                    className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/8"
                  />
                ) : null}
                {label}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-40 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, note…"
            aria-label="Search entries"
            className="h-10 w-full rounded-full border border-white/8 bg-ink-850/60 pl-10 pr-4 text-[0.8125rem] outline-none transition-all placeholder:text-fg-subtle/70 hover:border-white/15 focus:border-brand-400/60 focus:shadow-[0_0_0_4px_rgb(124_92_255/0.12)]"
          />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSort((v) => !v)}
            aria-expanded={showSort}
            aria-label="Sort entries"
            className="flex h-10 items-center gap-2 rounded-full border border-white/8 bg-ink-850/60 px-3.5 text-[0.8125rem] text-fg-muted transition-colors hover:border-white/15 hover:text-fg"
          >
            <SlidersHorizontal className="h-[15px] w-[15px]" />
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find((s) => s.key === sort)?.label}
            </span>
          </button>

          <AnimatePresence>
            {showSort ? (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.97 }}
                transition={springSnappy}
                className="glass-strong absolute right-0 top-[calc(100%+0.4rem)] z-30 w-44 origin-top-right rounded-2xl p-1.5"
              >
                {SORT_OPTIONS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSort(key);
                      setShowSort(false);
                    }}
                    className={cn(
                      "block w-full rounded-xl px-3 py-2 text-left text-[0.8125rem] transition-colors",
                      sort === key
                        ? "bg-white/8 text-fg"
                        : "text-fg-muted hover:bg-white/5 hover:text-fg",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {!readOnly && showAddButton ? (
          <div className="group/btn hidden lg:block">
            <Button size="sm" onClick={() => setCreating(true)} className="h-10">
              <Plus className="h-4 w-4" />
              Add entry
            </Button>
          </div>
        ) : null}
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState
          title={
            hasAnyEntries
              ? "Nothing matches those filters"
              : (emptyTitle ?? "Your ledger is empty")
          }
          body={
            hasAnyEntries
              ? "Try a different status, or clear the search."
              : (emptyBody ??
                "Add the first thing you owe or are owed and it'll show up here.")
          }
          action={
            !readOnly && !hasAnyEntries ? (
              <div className="group/btn">
                <Button onClick={() => setCreating(true)}>
                  <Plus className="h-4 w-4" />
                  Add your first entry
                </Button>
              </div>
            ) : null
          }
        />
      ) : (
        <motion.div layout className="space-y-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                readOnly={readOnly}
                onEdit={setEditing}
                onRecordPayment={setPaying}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Floating action button, phones only */}
      {!readOnly && showAddButton ? (
        <motion.button
          type="button"
          onClick={() => setCreating(true)}
          aria-label="Add entry"
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 340, damping: 22, delay: 0.4 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-20 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-linear-to-br from-brand-400 to-brand-600 shadow-[0_16px_40px_-12px_rgb(124_92_255/0.95)] lg:hidden"
        >
          <Plus className="h-6 w-6 text-white" />
        </motion.button>
      ) : null}

      {!readOnly ? (
        <>
          <EntryFormModal
            open={creating}
            onClose={() => setCreating(false)}
            defaultKind={defaultKind}
          />
          {/* Keyed per entry so one form's error state never bleeds into the next */}
          <EntryFormModal
            key={`edit-${editing?.id ?? "none"}`}
            open={Boolean(editing)}
            onClose={() => setEditing(null)}
            entry={editing}
          />
          <PaymentModal
            key={`pay-${paying?.id ?? "none"}`}
            entry={paying}
            onClose={() => setPaying(null)}
          />
        </>
      ) : null}
    </div>
  );
}
