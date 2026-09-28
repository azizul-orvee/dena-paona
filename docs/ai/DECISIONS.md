# Decisions

Why things are the way they are. Newest first.

## 2026-09-28 — Local Postgres for development; Neon is production only
**Context:** There was a single Neon database used for both development and (future) production, and it holds the owner's real account. The project's Hard rules forbid dev/test writes to production.
**Decision:** Dev runs on a local Postgres 17 (Homebrew service, db `dena_paona_dev`). `src/lib/prisma.ts` uses `PrismaNeon` for `*.neon.tech` hosts and `PrismaPg` for anything else. The Neon URL is parked in `.env.local` as `PROD_DATABASE_URL`, which no code reads.
**Alternatives considered:** A Neon dev branch (needs Neon console/API access from the owner; the owner preferred a local DB). Docker Postgres (Docker isn't installed). Using the Neon driver's WebSocket proxy locally (extra moving part).
**Consequences:** Local Postgres must be running for `npm run dev`. Dev and prod use different driver adapters, so small driver behaviour differences are possible (both support interactive transactions). Production migrations are a deliberate, owner-requested step.

## 2026-09-28 — Google is the only way to sign in
**Context:** Better Auth was set up with Google OAuth plus magic-link email (Resend). The owner found email sign-in didn't work for them (no Resend key configured, so links only printed to the dev terminal).
**Decision:** Remove email sign-in entirely. Google OAuth is the only way to create an account or sign in. Email/password is also disabled (Better Auth default).
**Alternatives considered:** Keep magic link and configure Resend — rejected by the owner.
**Consequences:** No email provider to maintain. Anyone without a Google account can't use the app. Seed/demo accounts need real Google emails. Don't reintroduce other sign-up paths without asking.

## 2026-09-28 — Email is the account handle; phone optional; legacy users deleted
**Context:** Old accounts were phone + password with no email; Google identifies users by email, and sharing looked people up by phone.
**Decision:** `users.email` is required and unique and is also the sharing handle. `phone` became optional. The 3 existing users (demo/test data) were deleted rather than migrated, with the owner's OK.
**Alternatives considered:** A "claim your old account" flow (phone + old password) or manually backfilling emails — unnecessary with no real users.
**Consequences:** No UI to set phone yet. Sharing lookup is case-insensitive on email.

## 2026-09-28 — Prisma 7 instead of Drizzle, pinned to 7.x
**Context:** The app was built on Drizzle; the owner asked for Prisma across the whole site.
**Decision:** Prisma 7.10 with the `prisma-client` generator (output `src/generated/prisma`) and `prisma.config.ts`. Pinned to `^7`.
**Alternatives considered:** Keep Drizzle with Better Auth's Drizzle adapter (would have been less work).
**Consequences:** npm's `latest` tag for `prisma` points at an 8.0 RC, and Better Auth's peer range is `^7` — don't upgrade blindly.

## 2026-09-28 — Baseline migration instead of recreating tables
**Context:** Tables were created by drizzle-kit; Prisma had no migration history.
**Decision:** Introspect the DB, write `0_init` from the schema, mark it applied (`prisma migrate resolve --applied 0_init`), then add `1_better_auth` generated with `prisma migrate diff --from-config-datasource --to-schema … --script`.
**Alternatives considered:** `prisma db push` / reset — would drop or recreate tables.
**Consequences:** `users`, `entries`, `wallet_shares` and their FKs were never recreated. The CHECK constraint lives only in migration SQL.

## 2026-09-28 — Neon WebSocket adapter, not HTTP
**Context:** Prisma 7 requires a driver adapter; `PrismaNeonHttp` has no interactive transactions.
**Decision:** `PrismaNeon` (WebSocket pool) in `src/lib/prisma.ts`.
**Consequences:** Transactions work (used by Better Auth and `updateEntryAction`). Client is created lazily so builds need no DB.

## 2026-09-28 — Raw SQL for totals and entry ordering
**Context:** Totals need conditional sums in one query; the ledger orders "open first, then newest", which Prisma's `orderBy` can't express.
**Decision:** `prisma.$queryRaw` in `getWalletTotals` and `getEntries` (`src/server/queries.ts`), casting numerics to text.
**Consequences:** Those two queries aren't type-checked against the schema — update them by hand if columns change.

## 2026-09-28 — Two-layer route protection
**Context:** Need server-side protection, not just client-side.
**Decision:** `src/proxy.ts` does a fast cookie-presence check and keeps `?next=`; the real check is `requireUser()` (DB session validation) in the `/app` layout and every server action.
**Consequences:** A forged or stale cookie passes the proxy but is stopped by `requireUser()`.

## 2026-09-28 — Rate-limit counters in the database
**Context:** On Vercel, in-memory counters reset per serverless instance.
**Decision:** Better Auth `rateLimit.storage = "database"` (`rate_limits` table), enabled in dev too.
**Consequences:** One extra DB write per auth request.
