import Link from "next/link";

import { Aurora } from "@/components/aurora";
import { Mark } from "@/components/brand";

export default function NotFound() {
  return (
    <div className="grain relative grid min-h-dvh place-items-center px-5">
      <Aurora />
      <div className="text-center">
        <Mark className="mx-auto h-14 w-14 opacity-80" />
        <h1 className="mt-7 font-display text-[2rem] font-600 tracking-tight">
          Nothing here
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[0.9375rem] leading-relaxed text-fg-muted">
          This page doesn&apos;t exist — or it belongs to a wallet that
          hasn&apos;t been shared with you.
        </p>
        <Link
          href="/app"
          className="mt-8 inline-flex rounded-full bg-linear-to-br from-brand-400 to-brand-600 px-6 py-3 text-[0.9375rem] font-medium text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          Back to your wallet
        </Link>
      </div>
    </div>
  );
}
