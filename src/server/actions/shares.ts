"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shareSchema } from "@/lib/validation";
import { valuesFrom, type ActionState } from "@/server/actions/types";

/**
 * Grants another registered user read-only access to the signed-in user's
 * wallet. Access is looked up by email, which is the account handle.
 */
export async function grantAccessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const owner = await requireUser();

  const parsed = shareSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: {
        email: parsed.error.issues[0]?.message ?? "Invalid email",
      },
      values: valuesFrom(formData, ["email"]),
    };
  }

  const { email } = parsed.data;

  if (email === owner.email.toLowerCase()) {
    return {
      status: "error",
      fieldErrors: { email: "That's your own email." },
      values: valuesFrom(formData, ["email"]),
    };
  }

  const viewer = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
    select: { id: true, name: true },
  });

  if (!viewer) {
    return {
      status: "error",
      fieldErrors: {
        email: "No Dena-Paona account uses that email yet.",
      },
      values: valuesFrom(formData, ["email"]),
    };
  }

  const existing = await prisma.walletShare.findUnique({
    where: { ownerId_viewerId: { ownerId: owner.id, viewerId: viewer.id } },
    select: { id: true },
  });

  if (existing) {
    return {
      status: "error",
      fieldErrors: { email: `${viewer.name} already has access.` },
      values: valuesFrom(formData, ["email"]),
    };
  }

  await prisma.walletShare.create({
    data: { ownerId: owner.id, viewerId: viewer.id },
  });

  revalidatePath("/app/shared");
  return {
    status: "success",
    message: `${viewer.name} can now view your wallet.`,
  };
}

/** Owner revokes a grant they previously gave. */
export async function revokeAccessAction(formData: FormData) {
  const owner = await requireUser();
  const viewerId = String(formData.get("viewerId") ?? "");
  if (!viewerId) return;

  await prisma.walletShare.deleteMany({
    where: { ownerId: owner.id, viewerId },
  });

  revalidatePath("/app/shared");
}

/** Viewer removes a wallet someone shared with them. */
export async function leaveSharedWalletAction(formData: FormData) {
  const viewer = await requireUser();
  const ownerId = String(formData.get("ownerId") ?? "");
  if (!ownerId) return;

  await prisma.walletShare.deleteMany({
    where: { ownerId, viewerId: viewer.id },
  });

  revalidatePath("/app/shared");
}
