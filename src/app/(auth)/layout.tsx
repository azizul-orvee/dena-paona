import Link from "next/link";

import { Aurora } from "@/components/aurora";
import { Logo } from "@/components/brand";
import { AuthAside } from "@/components/auth/auth-aside";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain relative min-h-dvh">
      <Aurora />

      <div className="mx-auto grid min-h-dvh w-full max-w-7xl lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col px-5 py-8 sm:px-10 lg:px-14">
          <Link
            href="/"
            className="inline-flex w-fit rounded-xl transition-opacity hover:opacity-80"
            aria-label="Dena-Paona home"
          >
            <Logo />
          </Link>

          <div className="flex flex-1 items-center py-10">
            <div className="w-full max-w-md">{children}</div>
          </div>

          <p className="text-[0.75rem] text-fg-subtle">
            Your ledger is private. Nobody sees it unless you share it.
          </p>
        </div>

        <AuthAside />
      </div>
    </div>
  );
}
