"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Eye,
  LogOut,
  Mail,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { useActionState, useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/app/empty-state";
import { springSnappy } from "@/components/motion/primitives";
import { formatDate, hueFromString, initials } from "@/lib/utils";
import {
  grantAccessAction,
  leaveSharedWalletAction,
  revokeAccessAction,
} from "@/server/actions/shares";
import { idleState, type ActionState } from "@/server/actions/types";

type Viewer = {
  viewerId: string;
  viewerName: string;
  viewerEmail: string;
  grantedAt: Date;
};

type SharedWallet = {
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  sharedAt: Date;
};

export function ShareManager({
  viewers,
  sharedWithMe,
}: {
  viewers: Viewer[];
  sharedWithMe: SharedWallet[];
}) {
  return (
    <div className="space-y-10">
      <GrantForm />
      <ViewerList viewers={viewers} />
      <SharedWithMeList wallets={sharedWithMe} />
    </div>
  );
}

function GrantForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    grantAccessAction,
    idleState,
  );
  const { toast } = useToast();
  // Bumping the key clears the input after a successful grant.
  const formKey = state.status === "success" ? state.message : "pending";

  useEffect(() => {
    if (state.status === "success") {
      toast({
        title: state.message ?? "Access granted",
        description: "They'll see your wallet in read-only mode.",
        tone: "success",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <section className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-500/12 text-brand-300 ring-1 ring-inset ring-brand-500/25">
          <UserPlus className="h-[18px] w-[18px]" />
        </span>
        <div>
          <h2 className="font-display text-lg font-600 tracking-tight">
            Give someone view access
          </h2>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-fg-muted">
            Enter the email they sign in with. They&apos;ll be able to see your
            dena and paona, but never change anything.
          </p>
        </div>
      </div>

      <form
        key={formKey}
        action={formAction}
        className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start"
        noValidate
      >
        <div className="flex-1">
          <Field
            label="Their email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="off"
            placeholder="friend@example.com"
            defaultValue={
              state.status === "error" ? (state.values?.email ?? "") : ""
            }
            required
            leading={<Mail className="h-4 w-4" />}
            error={state.fieldErrors?.email}
          />
        </div>
        <div className="group/btn sm:pt-[1.7rem]">
          <Button type="submit" loading={pending} className="w-full sm:w-auto">
            Grant access
          </Button>
        </div>
      </form>
    </section>
  );
}

function ViewerList({ viewers }: { viewers: Viewer[] }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();
  const reduce = useReducedMotion();

  function revoke(viewer: Viewer) {
    const form = new FormData();
    form.set("viewerId", viewer.viewerId);
    startTransition(async () => {
      await revokeAccessAction(form);
      toast({
        title: "Access revoked",
        description: `${viewer.viewerName} can no longer see your wallet.`,
        tone: "info",
      });
    });
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <ShieldCheck className="h-4 w-4 text-accent-400" />
        <h2 className="font-display text-lg font-600 tracking-tight">
          People who can see your wallet
        </h2>
      </div>

      {viewers.length === 0 ? (
        <p className="glass rounded-2xl px-5 py-6 text-[0.875rem] text-fg-muted">
          Nobody yet. Your ledger is visible only to you.
        </p>
      ) : (
        <motion.ul layout className="space-y-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {viewers.map((viewer) => {
              const hue = hueFromString(viewer.viewerName.toLowerCase());
              return (
                <motion.li
                  key={viewer.viewerId}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -14, filter: "blur(4px)" }}
                  transition={springSnappy}
                  className="glass flex items-center gap-3.5 rounded-2xl p-4"
                  aria-busy={pending}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[0.75rem] font-700 ring-1 ring-inset ring-white/10"
                    style={{
                      background: `linear-gradient(140deg, hsl(${hue} 62% 22%), hsl(${(hue + 44) % 360} 58% 14%))`,
                      color: `hsl(${hue} 85% 82%)`,
                    }}
                    aria-hidden
                  >
                    {initials(viewer.viewerName)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.9375rem] font-medium">
                      {viewer.viewerName}
                    </p>
                    <p className="truncate text-[0.75rem] text-fg-subtle">
                      {viewer.viewerEmail} · since{" "}
                      {formatDate(viewer.grantedAt)}
                    </p>
                  </div>

                  <span className="hidden items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[0.6875rem] text-fg-muted ring-1 ring-inset ring-white/10 sm:inline-flex">
                    <Eye className="h-3 w-3" /> read-only
                  </span>

                  <motion.button
                    type="button"
                    onClick={() => revoke(viewer)}
                    aria-label={`Revoke ${viewer.viewerName}'s access`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="grid h-9 w-9 place-items-center rounded-xl text-fg-subtle transition-colors hover:bg-dena-500/15 hover:text-dena-300"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}

function SharedWithMeList({ wallets }: { wallets: SharedWallet[] }) {
  const { toast } = useToast();
  const [, startTransition] = useTransition();
  const reduce = useReducedMotion();

  function leave(wallet: SharedWallet) {
    const form = new FormData();
    form.set("ownerId", wallet.ownerId);
    startTransition(async () => {
      await leaveSharedWalletAction(form);
      toast({
        title: "Removed",
        description: `You no longer follow ${wallet.ownerName}'s wallet.`,
        tone: "info",
      });
    });
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <Eye className="h-4 w-4 text-brand-300" />
        <h2 className="font-display text-lg font-600 tracking-tight">
          Wallets shared with you
        </h2>
      </div>

      {wallets.length === 0 ? (
        <EmptyState
          title="No shared wallets yet"
          body="When someone gives you access to their ledger, it'll appear here for you to follow."
        />
      ) : (
        <motion.ul layout className="grid gap-3 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {wallets.map((wallet) => {
              const hue = hueFromString(wallet.ownerName.toLowerCase());
              return (
                <motion.li
                  key={wallet.ownerId}
                  layout
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={springSnappy}
                >
                  <div className="glass group relative flex h-full flex-col rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-[0.8125rem] font-700 ring-1 ring-inset ring-white/10"
                        style={{
                          background: `linear-gradient(140deg, hsl(${hue} 62% 22%), hsl(${(hue + 44) % 360} 58% 14%))`,
                          color: `hsl(${hue} 85% 82%)`,
                        }}
                        aria-hidden
                      >
                        {initials(wallet.ownerName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display text-[0.9375rem] font-600">
                          {wallet.ownerName}
                        </p>
                        <p className="text-[0.75rem] text-fg-subtle">
                          shared {formatDate(wallet.sharedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <Link
                        href={`/app/shared/${wallet.ownerId}`}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-[0.8125rem] font-medium transition-colors hover:bg-white/[0.09]"
                      >
                        Open wallet
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => leave(wallet)}
                        aria-label={`Stop following ${wallet.ownerName}'s wallet`}
                        title="Stop following"
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-fg-subtle transition-colors hover:bg-dena-500/15 hover:text-dena-300"
                      >
                        <LogOut className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}
    </section>
  );
}
