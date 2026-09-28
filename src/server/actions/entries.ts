"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney, round2, toNumber } from "@/lib/money";
import { entrySchema, paymentSchema } from "@/lib/validation";
import {
  fieldErrorsFrom,
  valuesFrom,
  type ActionState,
} from "@/server/actions/types";

function revalidateWallet() {
  revalidatePath("/app");
  revalidatePath("/app/dena");
  revalidatePath("/app/paona");
  revalidatePath("/app/shared");
}

/** "YYYY-MM-DD" → the Date Prisma expects for a `date` column (UTC midnight). */
function toDbDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00Z`) : null;
}

const ENTRY_FIELDS = [
  "personName",
  "personPhone",
  "amount",
  "note",
  "dueDate",
  "kind",
];

export async function createEntryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = entrySchema.safeParse({
    kind: formData.get("kind"),
    personName: formData.get("personName"),
    personPhone: formData.get("personPhone") ?? undefined,
    amount: formData.get("amount"),
    note: formData.get("note") ?? undefined,
    dueDate: formData.get("dueDate") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: valuesFrom(formData, ENTRY_FIELDS),
    };
  }

  const v = parsed.data;

  await prisma.entry.create({
    data: {
      ownerId: user.id,
      kind: v.kind,
      personName: v.personName,
      personPhone: v.personPhone,
      amount: v.amount,
      note: v.note,
      dueDate: toDbDate(v.dueDate),
    },
  });

  revalidateWallet();
  return {
    status: "success",
    message:
      v.kind === "dena"
        ? `Added a dena of ${formatMoney(v.amount)} to ${v.personName}.`
        : `Added a paona of ${formatMoney(v.amount)} from ${v.personName}.`,
  };
}

export async function updateEntryAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const id = String(formData.get("entryId") ?? "");
  if (!id) return { status: "error", message: "Missing entry." };

  const parsed = entrySchema.safeParse({
    kind: formData.get("kind"),
    personName: formData.get("personName"),
    personPhone: formData.get("personPhone") ?? undefined,
    amount: formData.get("amount"),
    note: formData.get("note") ?? undefined,
    dueDate: formData.get("dueDate") ?? undefined,
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: valuesFrom(formData, ENTRY_FIELDS),
    };
  }

  const v = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.entry.findFirst({
      where: { id, ownerId: user.id },
      select: { amountPaid: true, settledAt: true },
    });
    if (!current) return false;

    await tx.entry.update({
      where: { id },
      data: {
        kind: v.kind,
        personName: v.personName,
        personPhone: v.personPhone,
        amount: v.amount,
        note: v.note,
        dueDate: toDbDate(v.dueDate),
        // Re-open the entry if the amount was raised above what's been paid.
        settledAt: current.amountPaid.gte(v.amount) ? current.settledAt : null,
      },
    });
    return true;
  });

  if (!updated) {
    return { status: "error", message: "That entry no longer exists." };
  }

  revalidateWallet();
  return { status: "success", message: "Entry updated." };
}

export async function deleteEntryAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("entryId") ?? "");
  if (!id) return;

  await prisma.entry.deleteMany({ where: { id, ownerId: user.id } });

  revalidateWallet();
}

/** Full settle / un-settle toggle. */
export async function toggleSettledAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("entryId") ?? "");
  if (!id) return;

  const row = await prisma.entry.findFirst({
    where: { id, ownerId: user.id },
    select: { amount: true, settledAt: true },
  });

  if (!row) return;

  const nowSettled = row.settledAt === null;

  await prisma.entry.updateMany({
    where: { id, ownerId: user.id },
    data: {
      settledAt: nowSettled ? new Date() : null,
      amountPaid: nowSettled ? row.amount : 0,
    },
  });

  revalidateWallet();
}

/** Records a part payment; auto-settles once the full amount is covered. */
export async function recordPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = paymentSchema.safeParse({
    entryId: formData.get("entryId"),
    amount: formData.get("amount"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: fieldErrorsFrom(parsed.error),
      values: valuesFrom(formData, ["amount"]),
    };
  }

  const { entryId, amount } = parsed.data;

  const row = await prisma.entry.findFirst({
    where: { id: entryId, ownerId: user.id },
    select: { amount: true, amountPaid: true },
  });

  if (!row) return { status: "error", message: "That entry no longer exists." };

  const total = toNumber(row.amount.toString());
  const already = toNumber(row.amountPaid.toString());
  const remaining = round2(total - already);

  if (remaining <= 0) {
    return { status: "error", message: "This one is already fully settled." };
  }

  const payment = Number(amount);
  if (payment > remaining) {
    return {
      status: "error",
      fieldErrors: {
        amount: `Only ${formatMoney(remaining)} is outstanding.`,
      },
      values: valuesFrom(formData, ["amount"]),
    };
  }

  const nextPaid = round2(already + payment);
  const fullyPaid = nextPaid >= total;

  await prisma.entry.updateMany({
    where: { id: entryId, ownerId: user.id },
    data: {
      amountPaid: nextPaid.toFixed(2),
      settledAt: fullyPaid ? new Date() : null,
    },
  });

  revalidateWallet();
  return {
    status: "success",
    message: fullyPaid
      ? "Settled in full. Nice."
      : `Recorded. ${formatMoney(round2(total - nextPaid))} still outstanding.`,
  };
}
