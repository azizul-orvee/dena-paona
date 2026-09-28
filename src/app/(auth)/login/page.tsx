import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { googleEnabled } from "@/lib/better-auth";

export const metadata: Metadata = { title: "Sign in" };

/** Error codes that arrive as ?error=… from Better Auth redirects. */
const ERROR_MESSAGES: Record<string, string> = {
  access_denied:
    "Google sign-in was cancelled. Try again whenever you're ready.",
};

const FALLBACK_ERROR = "Something went wrong signing you in. Please try again.";

/** Only same-site paths, so ?next= can't bounce people to another domain. */
function safeNext(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/app";
  }
  return value;
}

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, next } = await searchParams;
  const callbackURL = safeNext(next);

  if (await getCurrentUser()) redirect(callbackURL);

  return (
    <LoginForm
      callbackURL={callbackURL}
      googleEnabled={googleEnabled}
      initialError={error ? (ERROR_MESSAGES[error] ?? FALLBACK_ERROR) : null}
    />
  );
}
