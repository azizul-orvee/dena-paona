# Changelog

All changes to this project, newest first. Every AI tool and human must add an entry here after each change.

## 2026-09-28 — Local Postgres dev database; Neon is production only
**Type:** config
**Tool:** Claude Code
**What changed:**
- Installed Homebrew `postgresql@17` (service started), created database `dena_paona_dev`, applied `prisma/migrations/0_init` + `1_better_auth` to it (no drift; CHECK constraint present)
- Added dependency `@prisma/adapter-pg`; `src/lib/prisma.ts` now selects `PrismaNeon` for `*.neon.tech` hosts and `PrismaPg` otherwise
- `.env.local`: `DATABASE_URL` → local DB; previous Neon URL moved to `PROD_DATABASE_URL` (unused by code)
- `scripts/seed.mjs`: switched from the Neon HTTP driver to `pg`, refuses Neon hosts, `SEED_EMAIL` sets "Ayesha" to your Google email; seeded the local DB
- `.env.example`, `README.md`, `AGENTS.md`, `CLAUDE.md`, `docs/ai/*` updated for the dev/prod split
**Why:** Owner asked for a separate dev DB so development stops touching the real (production) database.
**Notes / gotchas:** Verified: signed-out `/app` → 307 `/login`; `POST /api/auth/sign-in/social` wrote its OAuth state + rate-limit rows to the local DB. **Production (Neon) was not read or written during this change.** Seed guard tested with a fake Neon URL (refused, exit 1).

## 2026-09-28 — Docs updated for new project-memory rules (git + production DB)
**Type:** docs
**Tool:** Claude Code
**What changed:**
- `AGENTS.md`: added **Hard rules** — no commit/push unless explicitly asked; production DB is read-only (check `DATABASE_URL` first, develop on a dev DB, clean up any test data). Noted that the project currently has only one Neon DB. Dropped the old "commit docs with code" rule in favour of "documenting never includes committing".
- `CLAUDE.md`: points Claude Code at the Hard rules.
- `docs/ai/STATUS.md`, `docs/ai/PROJECT.md`: creating a separate dev database is now the top Next-up item; the current DB is flagged as production.
**Why:** The project-memory skill was updated with these rules; the owner asked for the docs to match.
**Notes / gotchas:** Retroactive record of DB writes made earlier today on the (only) Neon DB, all during the auth work below:
- Deleted the 3 pre-existing users (Ayesha Siddiqua, Rahim Uddin, Tahmid Chowdhury — demo/test accounts) plus their 8 entries and 1 share, **with the owner's explicit approval**; not restorable.
- Applied migrations `0_init` (marked applied, no DDL) and `1_better_auth` — owner-approved schema change.
- Test data created then deleted: user `tester@example.com` with 1 entry and its session/verification rows; 3 magic-link verification rows for `ratelimit@example.com`; 4 `rate_limits` rows. Verified afterwards: 0 users / 0 entries / 0 sessions / 0 accounts.
- Refused sign-up test for `someone@example.com` created nothing (verified).
- Remaining data is real: the owner's own Google account (created by the owner signing in).

## 2026-09-28 — Project documentation initialized
**Type:** docs
**Tool:** Claude Code
**What changed:**
- Created `AGENTS.md`, `CLAUDE.md`, and `docs/ai/` (`PROJECT.md`, `ARCHITECTURE.md`, `STATUS.md`, `CHANGELOG.md`, `DECISIONS.md`)
**Why:** So any session or AI tool can understand and continue the project without re-explaining
**Notes / gotchas:** Project state at this point: Next.js 16 + Prisma 7 + Better Auth (Google-only), working locally, not deployed. Git history is a single commit (`760598a first`) that already contains all the work below; entries below were reconstructed from the Claude Code session that did it.

## 2026-09-28 — Google-only sign-in (magic link removed)
**Type:** feature
**Tool:** Claude Code
**What changed:**
- Removed the magic-link plugin, its hooks and client plugin from `src/lib/better-auth.ts` and `src/lib/auth-client.ts`
- Deleted `src/lib/email/` (sender + template) and `src/lib/rate-limit.ts`; uninstalled `resend`
- `src/components/auth/login-form.tsx` is now just "Continue with Google" + error banner; `src/app/(auth)/login/page.tsx` keeps only `access_denied` + fallback messages
- Removed `RESEND_API_KEY` / `EMAIL_FROM` from `.env.example` and `.env.local`; updated landing copy, README and `scripts/seed.mjs`
**Why:** Owner's decision after email sign-in didn't work for them: "No Google, no accounts."
**Notes / gotchas:** Verified `/api/auth/sign-in/magic-link` → 404 and email/password sign-up → `EMAIL_PASSWORD_SIGN_UP_DISABLED`. Owner's Google sign-in succeeded (user + `google` account row created).

## 2026-09-28 — Better Auth sign-in, route protection, login UI
**Type:** feature
**Tool:** Claude Code
**What changed:**
- `src/lib/better-auth.ts` (Prisma adapter, uuid ids, 30-day DB sessions, Google provider, account linking trusting Google, DB-backed rate limit, `onAPIError → /login`, `nextCookies()`)
- `src/app/api/auth/[...all]/route.ts` handler; `src/lib/auth-client.ts`
- `src/lib/auth.ts` rewritten: `getCurrentUser()` / `requireUser()` now use `auth.api.getSession`; deleted the `jose` JWT session (`src/lib/session.ts`)
- `src/proxy.ts`: redirects `/app/*` without a session cookie to `/login?next=…`
- New `/login` (`src/components/auth/login-form.tsx`), `/register` now redirects to `/login`; removed `src/components/auth/auth-form.tsx`
- `logoutAction` in `src/server/actions/auth.ts` calls `auth.api.signOut`; user menu shows email instead of phone
- Initially also shipped magic-link sign-in via Resend (removed the same day, see above)
**Why:** Replace home-grown phone + password auth with Google sign-in
**Notes / gotchas:** Generated a fresh `BETTER_AUTH_SECRET`; old `dp_session` cookies are invalid.

## 2026-09-28 — Drizzle → Prisma across the app; sharing by email
**Type:** refactor
**Tool:** Claude Code
**What changed:**
- `src/lib/prisma.ts` (lazy client, `PrismaNeon` WebSocket adapter); `prisma.config.ts`
- Ported `src/server/queries.ts`, `src/server/actions/entries.ts`, `src/server/actions/shares.ts` to Prisma (raw SQL kept for totals and entry ordering)
- Sharing looks users up by email (case-insensitive): `shares.ts`, `share-manager.tsx`, `src/lib/validation.ts` (`emailSchema`)
- Removed `src/db/`, `drizzle/`, `drizzle.config.ts`; uninstalled `drizzle-orm`, `drizzle-kit`, `bcryptjs`, `jose`; new `db:*` scripts and `postinstall: prisma generate`
- `scripts/seed.mjs` rewritten for email accounts; README updated
**Why:** Owner asked for Prisma for the entire site; phone is no longer an identity
**Notes / gotchas:** `getAuthorisedWalletOwner` now rejects malformed uuids (was a 500).

## 2026-09-28 — Prisma schema + Better Auth DB migration
**Type:** config
**Tool:** Claude Code
**What changed:**
- `prisma/schema.prisma` built by introspecting the live DB, mapped to the same table/column/constraint names
- `prisma/migrations/0_init` baseline (matches the Drizzle-created tables exactly, marked applied with `prisma migrate resolve`), CHECK `wallet_shares_no_self` added by hand
- `prisma/migrations/1_better_auth`: `users` + `email` (unique, NOT NULL), `email_verified`, `image`, `updated_at`; `phone` nullable; `password_hash` dropped; new `sessions`, `accounts`, `verifications`, `rate_limits`
- Deleted the 3 existing (demo/test) users and their 8 entries + 1 share first, with the owner's approval
**Why:** Better Auth needs email-based users and its own tables; keep existing tables and foreign keys intact
**Notes / gotchas:** Verified afterwards: FKs from `entries`/`wallet_shares` to `users.id` unchanged, no drift between schema and DB.

## Before 2026-09-28 — Original build
**Type:** feature
**Tool:** unknown (reconstructed)
**What changed:**
- Next.js 16 app with Drizzle ORM on Neon, phone + password accounts (bcrypt, `jose` JWT cookie), dena/paona ledger, part payments, read-only wallet sharing by phone, landing page, generated icons
**Why:** Initial product
