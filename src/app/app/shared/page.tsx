import type { Metadata } from "next";

import { ShareManager } from "@/components/app/share-manager";
import { requireUser } from "@/lib/auth";
import {
  getViewersOfMyWallet,
  getWalletsSharedWithMe,
} from "@/server/queries";

export const metadata: Metadata = { title: "Shared access" };
export const dynamic = "force-dynamic";

export default async function SharedPage() {
  const user = await requireUser();

  const [viewers, sharedWithMe] = await Promise.all([
    getViewersOfMyWallet(user.id),
    getWalletsSharedWithMe(user.id),
  ]);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-display text-2xl font-600 tracking-tight">
          Shared access
        </h1>
        <p className="mt-1 text-[0.8125rem] text-fg-subtle">
          Decide who can look at your ledger, and follow the ones shared with
          you.
        </p>
      </header>

      <ShareManager viewers={viewers} sharedWithMe={sharedWithMe} />
    </div>
  );
}
