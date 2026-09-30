import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/money";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type EntryRow = {
  id: string;
  kind: "dena" | "paona";
  personName: string;
  personPhone: string | null;
  personAddress: string | null;
  amount: string;
  amountPaid: string;
  note: string | null;
  dueDate: string | null;
  settledAt: Date | null;
  createdAt: Date;
};

export type WalletTotals = {
  denaOutstanding: number;
  paonaOutstanding: number;
  denaSettled: number;
  paonaSettled: number;
  denaCount: number;
  paonaCount: number;
  net: number;
};

/**
 * One round trip for every headline figure. `outstanding` is amount minus what
 * has already been paid, counted only on entries that aren't settled.
 */
export async function getWalletTotals(ownerId: string): Promise<WalletTotals> {
  const rows = await prisma.$queryRaw<
    Array<{
      kind: "dena" | "paona";
      outstanding: string;
      settled_sum: string;
      open_count: number;
    }>
  >`
    select
      kind,
      coalesce(sum(case when settled_at is null then amount - amount_paid else 0 end), 0)::text as outstanding,
      coalesce(sum(case when settled_at is not null then amount else 0 end), 0)::text as settled_sum,
      (count(*) filter (where settled_at is null))::int as open_count
    from entries
    where owner_id = ${ownerId}::uuid
    group by kind`;

  const totals: WalletTotals = {
    denaOutstanding: 0,
    paonaOutstanding: 0,
    denaSettled: 0,
    paonaSettled: 0,
    denaCount: 0,
    paonaCount: 0,
    net: 0,
  };

  for (const row of rows) {
    if (row.kind === "dena") {
      totals.denaOutstanding = toNumber(row.outstanding);
      totals.denaSettled = toNumber(row.settled_sum);
      totals.denaCount = Number(row.open_count);
    } else {
      totals.paonaOutstanding = toNumber(row.outstanding);
      totals.paonaSettled = toNumber(row.settled_sum);
      totals.paonaCount = Number(row.open_count);
    }
  }

  totals.net = totals.paonaOutstanding - totals.denaOutstanding;
  return totals;
}

export async function getEntries(
  ownerId: string,
  options: { kind?: "dena" | "paona"; limit?: number; openOnly?: boolean } = {},
): Promise<EntryRow[]> {
  const conditions = [Prisma.sql`owner_id = ${ownerId}::uuid`];
  if (options.kind) {
    conditions.push(Prisma.sql`kind = ${options.kind}::entry_kind`);
  }
  if (options.openOnly) conditions.push(Prisma.sql`settled_at is null`);

  // Raw SQL because Prisma can't order by an expression, and the ledger wants
  // open items first, then the most recently created.
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      kind: "dena" | "paona";
      person_name: string;
      person_phone: string | null;
      person_address: string | null;
      amount: string;
      amount_paid: string;
      note: string | null;
      due_date: string | null;
      settled_at: Date | null;
      created_at: Date;
    }>
  >`
    select
      id, kind, person_name, person_phone, person_address,
      amount::text as amount, amount_paid::text as amount_paid,
      note, to_char(due_date, 'YYYY-MM-DD') as due_date,
      settled_at, created_at
    from entries
    where ${Prisma.join(conditions, " and ")}
    order by settled_at is not null, created_at desc
    ${options.limit ? Prisma.sql`limit ${options.limit}` : Prisma.empty}`;

  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    personName: row.person_name,
    personPhone: row.person_phone,
    personAddress: row.person_address,
    amount: row.amount,
    amountPaid: row.amount_paid,
    note: row.note,
    dueDate: row.due_date,
    settledAt: row.settled_at,
    createdAt: row.created_at,
  }));
}

/** Per-counterparty rollup used by the "people" view. */
export async function getPeopleSummary(ownerId: string) {
  const rows = await prisma.entry.groupBy({
    by: ["personName", "kind"],
    where: { ownerId, settledAt: null },
    _sum: { amount: true, amountPaid: true },
    _count: { _all: true },
  });

  const map = new Map<
    string,
    { name: string; dena: number; paona: number; openCount: number }
  >();

  for (const row of rows) {
    const key = row.personName.toLowerCase();
    const current =
      map.get(key) ?? { name: row.personName, dena: 0, paona: 0, openCount: 0 };
    const outstanding =
      toNumber(row._sum.amount?.toString()) -
      toNumber(row._sum.amountPaid?.toString());
    if (row.kind === "dena") current.dena += outstanding;
    else current.paona += outstanding;
    current.openCount += row._count._all;
    map.set(key, current);
  }

  return [...map.values()]
    .map((p) => ({ ...p, net: p.paona - p.dena }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net));
}

/** Wallets this user has been given read access to. */
export async function getWalletsSharedWithMe(viewerId: string) {
  const shares = await prisma.walletShare.findMany({
    where: { viewerId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  return shares.map((share) => ({
    ownerId: share.owner.id,
    ownerName: share.owner.name,
    ownerEmail: share.owner.email,
    sharedAt: share.createdAt,
  }));
}

/** People this user has granted access to. */
export async function getViewersOfMyWallet(ownerId: string) {
  const shares = await prisma.walletShare.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      viewer: { select: { id: true, name: true, email: true } },
    },
  });

  return shares.map((share) => ({
    viewerId: share.viewer.id,
    viewerName: share.viewer.name,
    viewerEmail: share.viewer.email,
    grantedAt: share.createdAt,
  }));
}

/**
 * Authorises a read of someone else's wallet. Returns the owner only when a
 * share row actually exists — every shared-wallet page must go through this.
 */
export async function getAuthorisedWalletOwner(
  viewerId: string,
  ownerId: string,
) {
  // The id comes from the URL; a malformed one is simply "not shared with you".
  if (!UUID_RE.test(ownerId)) return null;

  const share = await prisma.walletShare.findUnique({
    where: { ownerId_viewerId: { ownerId, viewerId } },
    select: {
      createdAt: true,
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  if (!share) return null;
  return { ...share.owner, sharedAt: share.createdAt };
}
