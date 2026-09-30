# Status — last updated 2026-10-01

## Current state
Works end-to-end locally: Google sign-in (verified with the owner's real account), ledger CRUD, part payments, totals, read-only sharing by email, sign-out. Development now runs on a **local Postgres**; Neon is production only. Typecheck, lint and `next build` pass. Deployed on Vercel at https://dena-paona-final.vercel.app (owner set it up); Google sign-in there was failing on 2026-10-01, most likely env vars / Google client config — see Next up. All work is committed and pushed to `origin/main`. Production DB is on migration `2_entry_address`.

## ✅ Recently done
- Sign-in failures now explain themselves: the login banner shows the HTTP status and, via `/api/health`, which setup check failed (database, `BETTER_AUTH_URL`, secret, Google vars). Open `https://dena-paona-final.vercel.app/api/health` directly to see the same.
- Public `/privacy` and `/terms` pages (needed to publish the Google OAuth app), linked from the landing footer and the login page. Contact email is `CONTACT_EMAIL` in `src/components/legal/legal-page.tsx`.
- Entries: optional address (`2_entry_address` migration, applied locally and to production), phone validated, WhatsApp button + tappable phone on each card; shared viewers see all details and start on the "All" filter.
- Local dev database: Homebrew `postgresql@17`, db `dena_paona_dev`; `src/lib/prisma.ts` picks the Neon or node-postgres adapter by host; seed is local-only.
- Auth is **Google-only** via Better Auth (`src/lib/better-auth.ts`, `src/components/auth/login-form.tsx`); magic-link email sign-in was built then removed at the owner's request.
- Moved from Drizzle to Prisma 7 across the whole app (`prisma/schema.prisma`, `src/lib/prisma.ts`, `src/server/*`).
- Additive DB migration `prisma/migrations/1_better_auth` (email/auth columns + sessions/accounts/verifications/rate_limits); existing tables kept.
- `src/proxy.ts` gate for `/app/*` plus server-side `requireUser()`.
- Sharing switched from phone number to email.
- Project documentation system (`AGENTS.md`, `CLAUDE.md`, `docs/ai/`).

## 🚧 In progress
- Nothing mid-way.

## ⏭️ Next up
1. Get production sign-in working (check `/api/health` on the live site first): Vercel `BETTER_AUTH_URL` = `https://dena-paona-final.vercel.app` (no trailing slash), `DATABASE_URL` = Neon, redeploy. Google client: origin `https://dena-paona-final.vercel.app`, redirect `https://dena-paona-final.vercel.app/api/auth/callback/google`.
2. Publish the Google OAuth app: fill Branding (home page, `/privacy`, `/terms`, authorized domain `dena-paona-final.vercel.app`, emails), then Audience → Publish app.
3. Profile screen to edit name and (optional) phone — there's no UI for either today.
4. In-app "delete my account" (the privacy policy currently promises deletion on email request within 30 days).

## 🐛 Known issues
- "Add entry" button: the `+` icon renders above the label instead of beside it. Cause: `Button` wraps children in an inline `<span>` and Tailwind makes SVGs `display:block`; fix by wrapping icon + text in `inline-flex` (done that way in `login-form.tsx`).
- Seeded `rahim@example.com` can't sign in (Google-only); only "Ayesha" can, via `SEED_EMAIL=<your Google email> npm run seed`.
- Leftover `drizzle.__drizzle_migrations` table in the production Neon DB (unused; drop only if the owner asks).
- Once during local testing a signed-in user was bounced to `/login` while `.env.local` was being edited and the dev server reloaded env; not reproducible afterwards.
- `requireUser()` redirects to `/login` without `?next=`; only `src/proxy.ts` preserves the return path.

## ⚠️ Watch out
- WhatsApp links assume BD numbers when there's no country code (`01…` → `880…`); foreign numbers need `+<code>`.
- **Hard rules (AGENTS.md):** no `git commit`/`git push` unless explicitly asked; production DB is read-only.
- `DATABASE_URL` in `.env.local` = local dev DB (`localhost`). The production Neon URL sits in `PROD_DATABASE_URL`, which nothing reads — don't use it unless asked.
- Local Postgres must be running (`brew services start postgresql@17`) or every page errors with a connection failure.
- Sign-in must stay Google-only (owner's firm decision).
- In the Claude Code sandbox, `next build`, Prisma CLI and Neon scripts need the sandbox disabled.
- Prisma is pinned to 7.x on purpose (npm `latest` is an 8.0 RC; Better Auth supports `^7`).
- Create new migrations against the local DB (`npm run db:migrate:dev` is fine there). Never run `migrate dev`/`reset` against Neon. The existing migrations were generated with `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`.
