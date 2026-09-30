"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { EASE_OUT_EXPO, SplitHeadline } from "@/components/motion/primitives";
import { authClient } from "@/lib/auth-client";

type Props = {
  callbackURL: string;
  googleEnabled: boolean;
  initialError: string | null;
};

export function LoginForm({ callbackURL, googleEnabled, initialError }: Props) {
  const [error, setError] = useState<string | null>(initialError);
  const [problems, setProblems] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  async function signInWithGoogle() {
    setError(null);
    setProblems([]);
    setPending(true);
    const { error: oauthError } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
      errorCallbackURL: "/login",
    });
    // On success the browser is already navigating to Google.
    if (oauthError) {
      setPending(false);
      setError(
        `Couldn't start Google sign-in (${oauthError.status}${oauthError.message ? `: ${oauthError.message}` : ""}).`,
      );
      setProblems(await findSetupProblems());
    }
  }

  return (
    <div>
      <h1 className="font-display text-[2rem] font-600 leading-[1.1] tracking-tight sm:text-[2.35rem]">
        <SplitHeadline text="Welcome to your ledger." />
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO, delay: 0.25 }}
        className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted"
      >
        Sign in or create your account with Google.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO, delay: 0.32 }}
        className="mt-8"
      >
        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="mb-5 overflow-hidden rounded-xl border border-dena-500/25 bg-dena-500/10 px-4 py-3 text-[0.8125rem] leading-relaxed text-dena-300"
            >
              {error}
              {problems.length > 0 ? (
                <span className="mt-2 block">
                  <span className="block font-medium">Setup problem found:</span>
                  <span className="mt-1 block space-y-1">
                    {problems.map((p) => (
                      <span key={p} className="block">
                        • {p}
                      </span>
                    ))}
                  </span>
                </span>
              ) : null}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Button
          type="button"
          variant="secondary"
          size="lg"
          sheen={false}
          loading={pending}
          disabled={!googleEnabled || pending}
          onClick={signInWithGoogle}
          className="w-full"
          title={googleEnabled ? undefined : "Google sign-in isn't configured yet"}
        >
          <span className="inline-flex items-center gap-2.5">
            {pending ? null : <GoogleMark />}
            {pending ? "Opening Google…" : "Continue with Google"}
          </span>
        </Button>

        <p className="mt-4 text-center text-[0.75rem] leading-relaxed text-fg-subtle">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-fg">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-fg">
            Privacy Policy
          </Link>
          .
        </p>

        {!googleEnabled ? (
          <p className="mt-3 text-[0.75rem] text-fg-subtle">
            Google sign-in isn&apos;t configured on this server yet.
          </p>
        ) : null}
      </motion.div>
    </div>
  );
}

/**
 * Asks /api/health which part of the setup is broken (database, env vars),
 * so a failed sign-in says why instead of a generic error.
 */
async function findSetupProblems(): Promise<string[]> {
  try {
    const res = await fetch("/api/health", { cache: "no-store" });
    const body = (await res.json()) as {
      checks: Record<string, { ok: boolean; detail: string }>;
    };
    return Object.values(body.checks)
      .filter((c) => !c.ok)
      .map((c) => c.detail);
  } catch {
    return ["The server didn't answer the health check — see Vercel → Logs."];
  }
}

/** Google's "G", as its sign-in branding guidelines ask for. */
function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-[18px] w-[18px]" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}
