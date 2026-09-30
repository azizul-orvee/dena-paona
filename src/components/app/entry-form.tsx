"use client";

import { motion } from "motion/react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { springSnappy } from "@/components/motion/primitives";
import { CURRENCY_SYMBOL, formatMoney, round2, toNumber } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  createEntryAction,
  recordPaymentAction,
  updateEntryAction,
} from "@/server/actions/entries";
import { idleState, type ActionState } from "@/server/actions/types";
import type { EntryRow } from "@/server/queries";

export type EntryKind = "dena" | "paona";

export function EntryFormModal({
  open,
  onClose,
  entry,
  defaultKind = "paona",
}: {
  open: boolean;
  onClose: () => void;
  /** Present when editing; absent when creating. */
  entry?: EntryRow | null;
  defaultKind?: EntryKind;
}) {
  const editing = Boolean(entry);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    editing ? updateEntryAction : createEntryAction,
    idleState,
  );
  const [kind, setKind] = useState<EntryKind>(entry?.kind ?? defaultKind);
  const { toast } = useToast();

  // Reset the toggle each time the modal opens, adjusting state during render
  // rather than in an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setKind(entry?.kind ?? defaultKind);
  }

  useEffect(() => {
    if (state.status === "success") {
      toast({ title: state.message ?? "Saved", tone: "success" });
      onClose();
    }
    // Only react to a completed submission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const fieldErrors = state.fieldErrors ?? {};
  // Prefer what the user just typed over the stored value when a submit
  // bounced, so nothing has to be re-entered.
  const sent = state.status === "error" ? (state.values ?? {}) : {};

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Edit entry" : "New entry"}
      description={
        editing
          ? "Update the details of this record."
          : "Log money that moved — or is about to."
      }
    >
      <form action={formAction} className="space-y-4" noValidate>
        {editing ? (
          <input type="hidden" name="entryId" value={entry!.id} />
        ) : null}
        <input type="hidden" name="kind" value={kind} />

        <KindToggle value={kind} onChange={setKind} />

        <Field
          label={kind === "paona" ? "Who owes you?" : "Who do you owe?"}
          name="personName"
          defaultValue={sent.personName ?? entry?.personName ?? ""}
          placeholder="e.g. Rafi bhai"
          autoComplete="off"
          required
          error={fieldErrors.personName}
        />

        <Field
          label="Amount"
          name="amount"
          type="text"
          inputMode="decimal"
          defaultValue={sent.amount ?? entry?.amount ?? ""}
          placeholder="1500"
          required
          leading={
            <span className="text-[0.9375rem] font-500">{CURRENCY_SYMBOL}</span>
          }
          error={fieldErrors.amount}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone (optional)"
            name="personPhone"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            defaultValue={sent.personPhone ?? entry?.personPhone ?? ""}
            placeholder="01712345678"
            hint="Adds a WhatsApp button to the entry."
            error={fieldErrors.personPhone}
          />
          <Field
            label="Due date"
            name="dueDate"
            type="date"
            defaultValue={sent.dueDate ?? entry?.dueDate ?? ""}
            error={fieldErrors.dueDate}
          />
        </div>

        <Field
          label="Address (optional)"
          name="personAddress"
          autoComplete="off"
          defaultValue={sent.personAddress ?? entry?.personAddress ?? ""}
          placeholder="e.g. House 12, Road 5, Dhanmondi"
          maxLength={200}
          error={fieldErrors.personAddress}
        />

        <Textarea
          label="Note"
          name="note"
          defaultValue={sent.note ?? entry?.note ?? ""}
          placeholder="What was it for?"
          maxLength={500}
          error={fieldErrors.note}
        />

        {state.status === "error" && state.message ? (
          <p
            role="alert"
            className="rounded-xl border border-dena-500/25 bg-dena-500/10 px-4 py-3 text-[0.8125rem] text-dena-300"
          >
            {state.message}
          </p>
        ) : null}

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
            sheen={false}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={pending}
            variant={kind === "paona" ? "paona" : "dena"}
            className="flex-1"
          >
            {editing ? "Save changes" : `Add ${kind}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Segmented control with a spring-driven sliding thumb. */
function KindToggle({
  value,
  onChange,
}: {
  value: EntryKind;
  onChange: (k: EntryKind) => void;
}) {
  const options = [
    {
      key: "paona" as const,
      label: "Paona",
      caption: "they owe me",
      icon: ArrowDownLeft,
    },
    {
      key: "dena" as const,
      label: "Dena",
      caption: "I owe them",
      icon: ArrowUpRight,
    },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Entry type"
      className="relative grid grid-cols-2 gap-1 rounded-2xl border border-white/8 bg-ink-850/70 p-1"
    >
      {options.map(({ key, label, caption, icon: Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(key)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
              active
                ? key === "paona"
                  ? "text-paona-300"
                  : "text-dena-300"
                : "text-fg-subtle hover:text-fg-muted",
            )}
          >
            {active ? (
              <motion.span
                layoutId="kind-thumb"
                transition={springSnappy}
                className={cn(
                  "absolute inset-0 -z-10 rounded-xl ring-1 ring-inset",
                  key === "paona"
                    ? "bg-paona-500/12 ring-paona-500/25"
                    : "bg-dena-500/12 ring-dena-500/25",
                )}
              />
            ) : null}
            <Icon className="h-4 w-4" />
            <span className="flex flex-col items-start leading-tight">
              {label}
              <span className="text-[0.6875rem] font-400 opacity-70">
                {caption}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Part-payment capture. */
export function PaymentModal({
  entry,
  onClose,
}: {
  entry: EntryRow | null;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    recordPaymentAction,
    idleState,
  );
  const { toast } = useToast();

  useEffect(() => {
    if (state.status === "success") {
      toast({ title: state.message ?? "Payment recorded", tone: "success" });
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const outstanding = entry
    ? round2(toNumber(entry.amount) - toNumber(entry.amountPaid))
    : 0;

  return (
    <Modal
      open={Boolean(entry)}
      onClose={onClose}
      title="Record a payment"
      description={
        entry
          ? `${entry.personName} · ${formatMoney(outstanding)} outstanding`
          : undefined
      }
      className="sm:max-w-md"
    >
      {entry ? (
        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="entryId" value={entry.id} />

          <Field
            label="Amount received"
            name="amount"
            type="text"
            inputMode="decimal"
            defaultValue={state.values?.amount ?? ""}
            placeholder={outstanding.toFixed(2)}
            required
            leading={
              <span className="text-[0.9375rem] font-500">
                {CURRENCY_SYMBOL}
              </span>
            }
            hint="Leave the rest outstanding, or pay it off in full."
            error={state.fieldErrors?.amount}
          />

          {state.status === "error" && state.message ? (
            <p
              role="alert"
              className="rounded-xl border border-dena-500/25 bg-dena-500/10 px-4 py-3 text-[0.8125rem] text-dena-300"
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              sheen={false}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={pending}
              variant="paona"
              className="flex-1"
            >
              Record
            </Button>
          </div>
        </form>
      ) : null}
    </Modal>
  );
}
