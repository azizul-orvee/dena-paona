import Link from "next/link";

import { Aurora } from "@/components/aurora";
import { Logo } from "@/components/brand";
import { SideNav, TabBar } from "@/components/app/nav";
import { UserMenu } from "@/components/app/user-menu";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="grain relative min-h-dvh">
      <Aurora intensity="subtle" />

      <header className="sticky top-0 z-30 border-b border-white/6 bg-ink-950/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-8">
          <Link
            href="/app"
            className="rounded-xl transition-opacity hover:opacity-80"
            aria-label="Dena-Paona overview"
          >
            <Logo markClassName="h-7 w-7 sm:h-8 sm:w-8" />
          </Link>
          <UserMenu name={user.name} email={user.email} />
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 pb-40 pt-7 sm:px-8 lg:grid-cols-[200px_1fr] lg:pb-16">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <SideNav />
        </aside>

        <main className="min-w-0">{children}</main>
      </div>

      <TabBar />
    </div>
  );
}
