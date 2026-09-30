# Changelog

All changes to this project, newest first. Every AI tool and human must add an entry here after each change.

## 2026-10-01 — Plain totals instead of a net "overview"; no "Settled so far"
**Type:** feature
**Tool:** Claude Code
**What changed:**
- `src/components/app/summary.tsx`: removed `BalanceHero` (net position number + paona/dena % bar). `TotalsGrid` now shows "Total paona" / "Total dena" (open amounts, never netted), dropped the "৳… settled" line, takes `ownerLabel` for shared wallets, and shows a zero state instead of ৳0 — "Debt-free" (party-popper icon) for dena, "Nothing to collect" for paona
- `src/components/app/kind-summary.tsx`: removed the "Settled so far" stat (now just Open entries + Total records); same zero-state message on the Dena/Paona pages ("Debt-free" / "All collected")
- `src/app/app/page.tsx`: dropped the net hero and the "By person" net strip; nav label and page title "Overview" → "Home" (`src/components/app/nav.tsx`)
- `src/app/app/shared/[ownerId]/page.tsx`: same totals cards, third-person copy
- Removed `src/components/app/people-strip.tsx` and `getPeopleSummary`; `WalletTotals` in `src/server/queries.ts` lost `net`, `denaSettled`, `paonaSettled` (query no longer sums settled amounts)
**Why:** Owner found the netting confusing (dena ৳2,500 + paona ৳2,000 to the same person showed up as a single "you owe ৳500" figure) and asked for plain totals, no "Settled so far", and a nice message when there's no dena.
**Notes / gotchas:** Verified in the browser with a local test session for seeded Rahim + two "Claude Test Jahid" entries (dena 2500, paona 2000 → cards show both totals separately), and with Rahim's dena temporarily settled to see the "Debt-free" state on Home and `/app/dena`. Cleanup: restored Rahim's seeded dena to open, deleted the test entries and test session from the local DB (verified 0 left). Production not touched.

## 2026-10-01 — Sign-in errors say what's wrong (`/api/health`)
**Type:** feature
**Tool:** Claude Code
**What changed:**
- New `src/app/api/health/route.ts`: checks `DATABASE_URL` (set, valid `postgresql://` URL, not localhost when the site isn't local, and a real read `select 1 from users limit 1` with an 8s timeout), `BETTER_AUTH_URL` (exactly equals the site's origin from `x-forwarded-host`/`-proto`), `BETTER_AUTH_SECRET` (≥32 chars), Google vars (set, client id shape). DB errors are unpacked from Prisma's `code`/`meta`/`cause` and mapped to hints (ECONNREFUSED, ENOTFOUND, 28P01, 3D000, timeout, missing tables). Returns 503 and logs `[health] setup problem` on failure
- `src/components/auth/login-form.tsx`: failed "Continue with Google" shows the HTTP status/message and a "Setup problem found" list from `/api/health`
**Why:** Production sign-in failed with "Couldn't reach Google just now" and gave no clue; owner asked for the error to show when it's a database issue.
**Notes / gotchas:** Tested locally: healthy → 200 all ok; faked production host headers → flags localhost `DATABASE_URL` and wrong `BETTER_AUTH_URL`; stopped local Postgres → banner shows "Couldn't start Google sign-in (500)" + "code ECONNREFUSED — nothing is accepting connections…". Postgres restarted afterwards. No production requests made.

## 2026-10-01 — Privacy Policy and Terms pages
**Type:** content
**Tool:** Claude Code
**What changed:**
- New public pages `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`, sharing `src/components/legal/legal-page.tsx` (`LegalPage`, `LegalSection`, `LegalLinks`, `CONTACT_EMAIL`)
- Privacy policy covers exactly what the app stores (Google name/email/picture; entries incl. optional phone/address/note; session IP + user agent; rate-limit counters), who sees it (you, people you share with, Vercel/Neon), Google API Limited Use statement, deletion by email within 30 days
- Terms: not a bank / no money moves, user responsible for records and third-party details, acceptable use, as-is, Bangladesh law
- Links: landing footer (`src/app/page.tsx`) and a consent line under "Continue with Google" (`src/components/auth/login-form.tsx`)
- Docs: live URL `https://dena-paona-final.vercel.app` recorded in `PROJECT.md` / `STATUS.md`
**Why:** Google requires a home page, privacy policy and terms link before the OAuth app can be published for public sign-up.
**Notes / gotchas:** `CONTACT_EMAIL` is the owner's Gmail and is shown publicly on both pages — change it in one place if they want a different address. Pages are static and outside the `/app` proxy gate. The policy promises no ads/analytics; if analytics are added later, update `/privacy`.

## 2026-10-01 — Production DB migrated to `2_entry_address`
**Type:** deploy
**Tool:** Claude Code
**What changed:**
- Ran `npm run db:migrate:prod` against production Neon (`ep-spring-bar-b3tb68e9`, `neondb`): applied `2_entry_address` (adds nullable `entries.person_address`)
**Why:** Owner explicitly asked to update the production database, then commit and push.
**Notes / gotchas:** Additive, nullable column — no existing rows changed. Verified afterwards with `prisma migrate diff` against production: no drift. No data was written.

## 2026-10-01 — `npm run db:migrate:prod` for production migrations
**Type:** config
**Tool:** Claude Code
**What changed:**
- New `scripts/migrate-prod.mjs` + `db:migrate:prod` script in `package.json`: loads `PROD_DATABASE_URL` from `.env.local`, refuses non-Neon hosts, runs `prisma migrate status`, and runs `prisma migrate deploy` only after the user types `yes`
- `docs/ai/PROJECT.md`, `docs/ai/STATUS.md`: replaced the old `DATABASE_URL="$PROD_DATABASE_URL" …` instruction, which never worked from a shell
**Why:** Owner needed a working way to apply migrations to production.
**Notes / gotchas:** Tested with "no" as the answer: read-only `migrate status` against production reported `2_entry_address` pending; nothing was applied. Works because shell env vars take priority over `.env.local` in `prisma.config.ts`.

## 2026-10-01 — Entry address, WhatsApp button, full detail for shared viewers
**Type:** feature
**Tool:** Claude Code
**What changed:**
- New nullable column `entries.person_address varchar(200)`: `prisma/schema.prisma` (`personAddress`), migration `prisma/migrations/2_entry_address` (applied to the **local** DB only; no drift)
- `src/lib/validation.ts`: name + amount stay required; phone optional but must look like a phone number (`+?` and 6–15 digits after stripping spaces, dashes, brackets, dots); address optional, max 200
- `src/server/actions/entries.ts`, `src/server/queries.ts` (`EntryRow.personAddress`, raw SQL select): save/read the address
- `src/components/app/entry-form.tsx`: "Phone (optional)" with a WhatsApp hint, new "Address (optional)" field
- `src/components/app/entry-card.tsx`: contact row with tappable phone (`tel:`), green WhatsApp button (`wa.me`, new tab) and address; full note on hover. Shown to shared viewers too
- `src/lib/utils.ts`: `whatsappUrl()` (BD `01…` → `8801…`)
- `src/components/app/ledger.tsx`: search also matches phone and address; read-only (shared) ledgers default to the "All" filter so settled entries are visible
**Why:** Owner asked for name + amount as required, phone + address optional, a WhatsApp button from the phone, and for shared viewers to see everything.
**Notes / gotchas:** Verified in the browser at mobile width with local test sessions for seeded Ayesha (owner) and Rahim (viewer): empty submit → name + amount errors only; `abc123` phone rejected; `017 1234-5678` saved and linked to `https://wa.me/8801712345678`; Rahim saw phone, WhatsApp, address and settled entries with no edit controls. Cleanup: deleted the test entry "Claude Test Karim" and both test sessions from the local DB (verified 0 left). Production was not touched. **Production still needs `2_entry_address` applied before this code deploys.**

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
