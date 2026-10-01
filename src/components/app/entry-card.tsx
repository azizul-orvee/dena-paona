"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarClock,
  Check,
  HandCoins,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  RotateCcw,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useTransition } from "react";

import { springSnappy } from "@/components/motion/primitives";
import { useToast } from "@/components/ui/toast";
import { formatMoney, round2, toNumber } from "@/lib/money";
import {
  cn,
  hueFromString,
  initials,
  isOverdue,
  relativeDay,
  whatsappUrl,
} from "@/lib/utils";
import {
  deleteEntryAction,
  toggleSettledAction,
} from "@/server/actions/entries";
import type { EntryRow } from "@/server/queries";

export function EntryCard({
  entry,
  readOnly = false,
  onEdit,
  onRecordPayment,
}: {
  entry: EntryRow;
  readOnly?: boolean;
  onEdit?: (entry: EntryRow) => void;
  onRecordPayment?: (entry: EntryRow) => void;
}) {
  const reduce = useReducedMotion();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const isPaona = entry.kind === "paona";
  const settled = entry.settledAt !== null;
  const total = toNumber(entry.amount);
  const paid = toNumber(entry.amountPaid);
  const outstanding = round2(total - paid);
  const progress = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const overdue = isOverdue(entry.dueDate, entry.settledAt);
  const hue = hueFromString(entry.personName.toLowerCase());

  const accent = isPaona ? "paona" : "dena";
  const whatsapp = whatsappUrl(entry.personPhone);

  function runToggle() {
    const form = new FormData();
    form.set("entryId", entry.id);
    startTransition(async () => {
      await toggleSettledAction(form);
      toast({
        title: settled ? "Reopened" : "Marked as settled",
        description: settled
          ? `${entry.personName} · ${formatMoney(total)} is outstanding again.`
          : `${entry.personName} · ${formatMoney(total)} cleared.`,
        tone: settled ? "info" : "success",
      });
    });
  }

  function runDelete() {
    const form = new FormData();
    form.set("entryId", entry.id);
    startTransition(async () => {
      await deleteEntryAction(form);
      toast({
        title: "Entry deleted",
        description: `${entry.personName} · ${formatMoney(total)}`,
        tone: "info",
      });
    });
  }

  const actions = (
    <>
      {!settled && onRecordPayment ? (
        <IconButton
          label={`Record a payment for ${entry.personName}`}
          onClick={() => onRecordPayment(entry)}
          accent={accent}
        >
          <HandCoins className="h-[15px] w-[15px]" />
        </IconButton>
      ) : null}

      {onEdit ? (
        <IconButton
          label={`Edit entry for ${entry.personName}`}
          onClick={() => onEdit(entry)}
        >
          <Pencil className="h-[15px] w-[15px]" />
        </IconButton>
      ) : null}

      <IconButton
        label={
          settled
            ? `Reopen entry for ${entry.personName}`
            : `Mark entry for ${entry.personName} as settled`
        }
        onClick={runToggle}
        accent={settled ? undefined : "paona"}
      >
        {settled ? (
          <RotateCcw className="h-[15px] w-[15px]" />
        ) : (
          <Check className="h-[15px] w-[15px]" />
        )}
      </IconButton>

      <IconButton
        label={`Delete entry for ${entry.personName}`}
        onClick={runDelete}
        accent="dena"
      >
        <Trash2 className="h-[15px] w-[15px]" />
      </IconButton>
    </>
  );

  return (
    <motion.article
      layout
      layoutId={`entry-${entry.id}`}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.96, x: -12, filter: "blur(4px)" }
      }
      transition={springSnappy}
      className={cn(
        "group glass relative overflow-hidden rounded-2xl transition-opacity",
        settled && "opacity-60 hover:opacity-90",
        pending && "pointer-events-none opacity-50",
      )}
    >
      {/* Left accent rail */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px]",
          isPaona
            ? "bg-linear-to-b from-paona-300 to-paona-500"
            : "bg-linear-to-b from-dena-300 to-dena-500",
          settled && "opacity-40",
        )}
      />

      <div className="flex items-start gap-3.5 p-4 pl-5 sm:gap-4 sm:p-5 sm:pl-6 lg:pb-5">
        {/* Avatar */}
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[0.8125rem] font-700 ring-1 ring-inset ring-white/10"
          style={{
            background: `linear-gradient(140deg, hsl(${hue} 62% 22%), hsl(${(hue + 44) % 360} 58% 14%))`,
            color: `hsl(${hue} 85% 82%)`,
          }}
          aria-hidden
        >
          {initials(entry.personName)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3
              className={cn(
                "truncate font-display text-[0.9375rem] font-600",
                settled && "line-through decoration-fg-subtle/60",
              )}
            >
              {entry.personName}
            </h3>

            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ring-1 ring-inset",
                isPaona
                  ? "bg-paona-500/10 text-paona-300 ring-paona-500/20"
                  : "bg-dena-500/10 text-dena-300 ring-dena-500/20",
              )}
            >
              {isPaona ? (
                <ArrowDownLeft className="h-3 w-3" />
              ) : (
                <ArrowUpRight className="h-3 w-3" />
              )}
              {isPaona ? "owes you" : "you owe"}
            </span>

            {settled ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/6 px-2 py-0.5 text-[0.6875rem] text-fg-muted ring-1 ring-inset ring-white/10">
                <Check className="h-3 w-3" /> settled
              </span>
            ) : overdue ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warn-400/12 px-2 py-0.5 text-[0.6875rem] text-warn-400 ring-1 ring-inset ring-warn-400/25">
                <CalendarClock className="h-3 w-3" /> overdue
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.75rem] text-fg-subtle">
            {entry.dueDate ? (
              <span className="inline-flex items-center gap-1">
                <CalendarClock className="h-3 w-3" />
                due {relativeDay(entry.dueDate)}
              </span>
            ) : null}
            {entry.note ? (
              <span className="inline-flex min-w-0 items-center gap-1">
                <StickyNote className="h-3 w-3 shrink-0" />
                <span className="truncate" title={entry.note}>
                  {entry.note}
                </span>
              </span>
            ) : null}
            {!entry.dueDate && !entry.note ? (
              <span>added {relativeDay(entry.createdAt)}</span>
            ) : null}
          </div>

          {/* Contact details — shown to shared viewers too */}
          {entry.personPhone || entry.personAddress ? (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[0.75rem]">
              {entry.personPhone ? (
                <a
                  href={`tel:${entry.personPhone}`}
                  aria-label={`Call ${entry.personName}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-fg-muted ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10 hover:text-fg"
                >
                  <Phone className="h-3 w-3" />
                  <span className="tnum">{entry.personPhone}</span>
                </a>
              ) : null}
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Message ${entry.personName} on WhatsApp`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366]/12 px-2.5 py-1 font-medium text-[#4ade80] ring-1 ring-inset ring-[#25D366]/30 transition-colors hover:bg-[#25D366]/20"
                >
                  <MessageCircle className="h-3 w-3" />
                  WhatsApp
                </a>
              ) : null}
              {entry.personAddress ? (
                <span className="inline-flex min-w-0 max-w-full items-center gap-1 px-1 text-fg-subtle">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate" title={entry.personAddress}>
                    {entry.personAddress}
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Part-payment progress */}
          {!settled && paid > 0 ? (
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    isPaona
                      ? "bg-linear-to-r from-paona-500 to-paona-300"
                      : "bg-linear-to-r from-dena-500 to-dena-300",
                  )}
                  initial={reduce ? false : { width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <p className="mt-1.5 text-[0.6875rem] text-fg-subtle">
                {formatMoney(paid)} of {formatMoney(total)} received
              </p>
            </div>
          ) : null}
        </div>

        {/* Amount, plus the desktop hover actions */}
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p
            className={cn(
              "tnum font-display text-base font-700 tracking-tight sm:text-lg",
              settled
                ? "text-fg-subtle line-through"
                : isPaona
                  ? "text-paona-300"
                  : "text-dena-300",
            )}
          >
            {formatMoney(settled ? total : outstanding)}
          </p>

          {!readOnly ? (
            <div className="hidden opacity-0 transition-opacity duration-200 group-focus-within:opacity-100 group-hover:opacity-100 lg:flex">
              {actions}
            </div>
          ) : null}
        </div>
      </div>

      {/* Below 1024px there isn't room beside the amount, so the actions get
          their own row and stay permanently visible (no hover on touch). */}
      {!readOnly ? (
        <div className="flex justify-end gap-1 border-t border-white/6 px-2 py-1 lg:hidden">
          {actions}
        </div>
      ) : null}
    </motion.article>
  );
}

function IconButton({
  children,
  label,
  onClick,
  accent,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: "paona" | "dena";
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      transition={springSnappy}
      className={cn(
        "grid h-10 w-10 place-items-center rounded-xl text-fg-subtle transition-colors lg:h-8 lg:w-8 lg:rounded-lg",
        accent === "paona" && "hover:bg-paona-500/15 hover:text-paona-300",
        accent === "dena" && "hover:bg-dena-500/15 hover:text-dena-300",
        !accent && "hover:bg-white/8 hover:text-fg",
      )}
    >
      {children}
    </motion.button>
  );
}
