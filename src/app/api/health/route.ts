import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Check = { ok: boolean; detail: string };

/**
 * Setup diagnostics for sign-in: is each env var present and well-formed, and
 * can we reach the database? Read-only, never returns secret
 * values, and deliberately bypasses Better Auth so it writes nothing.
 * The database check is a single read (`select 1 from users limit 1`).
 * The login page calls this to explain a failed "Continue with Google".
 */
export async function GET(request: NextRequest) {
  const checks: Record<string, Check> = {
    database: await checkDatabase(isLocal(request)),
    authUrl: checkAuthUrl(request),
    authSecret: checkSecret(),
    google: checkGoogle(),
  };

  const ok = Object.values(checks).every((c) => c.ok);
  if (!ok) console.error("[health] setup problem", checks);
  return NextResponse.json(
    { ok, checks },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}

async function checkDatabase(siteIsLocal: boolean): Promise<Check> {
  const raw = process.env.DATABASE_URL;
  if (!raw) return { ok: false, detail: "DATABASE_URL is not set." };

  let host: string;
  try {
    const url = new URL(raw.trim());
    if (!/^postgres(ql)?:$/.test(url.protocol)) {
      return {
        ok: false,
        detail: `DATABASE_URL must start with postgresql:// (it starts with "${url.protocol}").`,
      };
    }
    host = url.hostname;
  } catch {
    return {
      ok: false,
      detail:
        "DATABASE_URL isn't a valid URL. Paste only the postgresql://… part — no psql, quotes or spaces.",
    };
  }

  if (!siteIsLocal && (host === "localhost" || host === "127.0.0.1")) {
    return {
      ok: false,
      detail: "DATABASE_URL points at localhost. On Vercel it must be the Neon URL.",
    };
  }

  try {
    // Touches a real table so missing migrations show up too.
    await withTimeout(prisma.$queryRaw`select 1 from users limit 1`, 8000);
    return { ok: true, detail: `Connected (${host.split(".")[0]}).` };
  } catch (error) {
    const reason = clean(error);
    const hint = DB_HINTS.find(([pattern]) => pattern.test(reason))?.[1];
    return {
      ok: false,
      detail: `Can't connect to the database: ${reason}${hint ? ` — ${hint}` : ""}`,
    };
  }
}

/** Plain-English next steps for the database errors people actually hit. */
const DB_HINTS: Array<[RegExp, string]> = [
  [/ECONNREFUSED/, "nothing is accepting connections at that host/port."],
  [/ENOTFOUND|EAI_AGAIN/, "that host doesn't exist; re-copy the URL from Neon → Connect."],
  [/28P01|password authentication failed/i, "wrong username or password; re-copy the URL from Neon (or reset the password there)."],
  [/3D000|does not exist/i, "that database name doesn't exist; Neon's default is neondb."],
  [/timed out|ETIMEDOUT/i, "the database didn't answer; check Neon isn't suspended or over its limits."],
  [/42P01|relation .* does not exist/i, "tables are missing; run npm run db:migrate:prod."],
];

function checkAuthUrl(request: NextRequest): Check {
  const raw = process.env.BETTER_AUTH_URL;
  if (!raw) return { ok: false, detail: "BETTER_AUTH_URL is not set." };

  let configured: URL;
  try {
    configured = new URL(raw.trim());
  } catch {
    return { ok: false, detail: `BETTER_AUTH_URL isn't a valid URL: "${raw}".` };
  }

  // Vercel sits behind a proxy, so trust the forwarded host/proto it sets.
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  const actual = `${proto}://${host}`;

  if (configured.origin !== actual) {
    return {
      ok: false,
      detail: `BETTER_AUTH_URL is "${raw}" but this site is ${actual}. Set it to exactly ${actual}.`,
    };
  }
  if (raw.trim() !== configured.origin) {
    return {
      ok: false,
      detail: `BETTER_AUTH_URL has extra characters: "${raw}". Use exactly ${configured.origin}.`,
    };
  }
  return { ok: true, detail: `Matches ${actual}.` };
}

function checkSecret(): Check {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return { ok: false, detail: "BETTER_AUTH_SECRET is not set." };
  if (secret.length < 32) {
    return {
      ok: false,
      detail: "BETTER_AUTH_SECRET is too short. Generate one with: openssl rand -base64 32",
    };
  }
  return { ok: true, detail: "Set." };
}

function checkGoogle(): Check {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!id || !secret) {
    return { ok: false, detail: "GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not set." };
  }
  if (!id.endsWith(".apps.googleusercontent.com")) {
    return {
      ok: false,
      detail: "GOOGLE_CLIENT_ID should end in .apps.googleusercontent.com — check for quotes or a swapped value.",
    };
  }
  return { ok: true, detail: "Set." };
}

function isLocal(request: NextRequest) {
  const host = request.headers.get("host") ?? request.nextUrl.host;
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host);
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out after ${ms / 1000}s`)), ms),
    ),
  ]);
}

/**
 * Readable error text without anything that looks like a connection string.
 * Prisma's message is often just "Invalid `prisma.$queryRaw()` invocation:";
 * the real reason (refused, bad password, unknown host…) sits in `code`,
 * `meta` or the `cause` chain, so gather those too.
 */
function clean(error: unknown) {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 4; depth++) {
    if (current instanceof Error) {
      const e = current as Error & { code?: unknown; meta?: unknown };
      parts.push(e.message);
      if (typeof e.code === "string") parts.push(`code ${e.code}`);
      if (e.meta) parts.push(JSON.stringify(e.meta));
      current = e.cause;
    } else {
      parts.push(typeof current === "string" ? current : JSON.stringify(current));
      break;
    }
  }

  const text = parts
    .flatMap((p) => p.split("\n"))
    .map((line) => line.trim())
    .filter((line) => line && !/^Invalid `prisma\./.test(line))
    .join(" · ");

  return (text || "unknown error")
    .replace(/postgres(ql)?:\/\/\S+/gi, "[database url]")
    .replace(/"password":"[^"]*"/gi, '"password":"[hidden]"')
    .slice(0, 300);
}
