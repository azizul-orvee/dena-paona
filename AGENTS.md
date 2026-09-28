# AGENTS.md — Dena-Paona

> Start here. This file is the entry point for any AI assistant or developer working on this project.

## What this is
A calm, private ledger for money between friends and family. Each entry is a **dena** (money you owe) or a **paona** (money you're owed); users record part payments, see a net position, and can grant other users a **read-only** view of their wallet. Built for Bangladeshi users (amounts in ৳ BDT).

## Read these next
1. `docs/ai/STATUS.md` — where things stand right now and what's next (read first)
2. `docs/ai/CHANGELOG.md` — history of every change (read the latest entries)
3. `docs/ai/PROJECT.md` — stack, setup, commands, env vars, deploy
4. `docs/ai/ARCHITECTURE.md` — code map, routes, data models, data flow
5. `docs/ai/DECISIONS.md` — why things are the way they are

## Quick facts
- **Stack:** Next.js 16 App Router (Turbopack, Server Actions), React 19, TypeScript, Tailwind CSS v4, Motion, Prisma 7 + Postgres (Neon in production, local Postgres in dev), Better Auth (Google OAuth only)
- **Run locally:** `brew services start postgresql@17` → `npm install` → `cp .env.example .env.local` (fill it) → `npm run db:migrate` → `npm run dev`
- **Deploy:** Vercel (not yet deployed — see STATUS). Repo: `github.com/azizul-orvee/dena-paona`, branch `main`
- **Package manager:** npm

## Conventions
- Server Components by default; `"use client"` only for interactive pieces (forms, menus, motion).
- Data reads live in `src/server/queries.ts`; mutations are Server Actions in `src/server/actions/*.ts`. Never touch the DB from client components.
- Import the DB client only from `@/lib/prisma` (lazy, `server-only`). The generated client is at `src/generated/prisma` (gitignored, rebuilt by `postinstall`).
- Every mutation starts with `const user = await requireUser()` and scopes writes by `ownerId: user.id` — never trust an id from the request body for ownership.
- Shared-wallet pages must go through `getAuthorisedWalletOwner()` in `src/server/queries.ts`.
- Reuse UI primitives: `src/components/ui/{button,field,modal,toast}.tsx`, motion tokens in `src/components/motion/primitives.tsx`. Colour tokens (`brand-*`, `dena-*`, `paona-*`, `ink-*`, `fg-*`) are in `src/app/globals.css`.
- Money: Postgres `numeric(14,2)`; format with helpers in `src/lib/money.ts`.
- DB column names are snake_case; Prisma fields are camelCase with `@map`.

## Don't touch without asking
- **Auth is Google-only by the owner's explicit decision.** Do not add email/password, magic-link or any other sign-up path.
- `prisma/migrations/` — never edit applied migrations; add a new one.
- The share authorisation gate (`getAuthorisedWalletOwner`) and `ownerId` scoping in actions.
- Production env config / Google OAuth client settings.

## 🚫 Hard rules (MANDATORY for every AI tool)
1. **No `git commit` and no `git push` unless the user explicitly asks in that message.** Commit permission is not push permission. Read-only git (`status`, `log`, `diff`) is fine. Leave finished work uncommitted.
2. **Production database is read-only.** No writes, migrations, schema pushes, seeds, or resets against production unless the user explicitly asks. Check which DB `DATABASE_URL` points to before any DB command; if it's production or unclear, stop and ask. Develop and test on a dev/local DB. If any record in production is created or changed during development/testing, delete/restore it before finishing, verify, and log the cleanup in the changelog.
   - **Dev DB:** local Postgres `localhost:5432/dena_paona_dev` (Homebrew `postgresql@17`) — this is what `DATABASE_URL` in `.env.local` points at. Safe to migrate/seed/reset.
   - **Production DB:** Neon (endpoint `ep-spring-bar-b3tb68e9`, db `neondb`). Its URL is parked in `.env.local` as `PROD_DATABASE_URL`, which nothing reads. Never use it without the owner's explicit request.

## ⚠️ Environment gotcha (Claude Code sandbox)
In the Claude Code sandbox, `next build`, every Prisma CLI command, and any script that talks to Neon fail with misleading errors (`EPERM`, `fetch failed`). Run them with the sandbox disabled. The dev server is unaffected.

## 📝 Documentation rules (MANDATORY for every AI tool)
This project documents itself. Whatever tool you are (Claude Code, Cursor, Copilot, Codex, etc.):
1. **Before working:** read `docs/ai/STATUS.md` and the latest entries in `docs/ai/CHANGELOG.md`.
2. **After ANY change, before finishing:**
   - Add a dated entry at the TOP of `docs/ai/CHANGELOG.md` (format below).
   - Update `docs/ai/STATUS.md` (done / in progress / next / known issues).
   - Update `ARCHITECTURE.md` if structure changed, `PROJECT.md` if stack/commands/env/deploy changed, `DECISIONS.md` if you made a non-obvious choice.
3. Be specific, include file paths, never write secrets (env var names only).
4. Documenting a change never includes committing it (see Hard rules). If the user asks to commit, docs go in the same commit as the code they describe.

Changelog entry format:

    ## YYYY-MM-DD — Short title
    **Type:** feature | fix | refactor | style | content | config | deps | deploy | docs
    **Tool:** <which AI/human>
    **What changed:**
    - <change with `file/path`>
    **Why:** <reason>
    **Notes / gotchas:** <optional, include any test-data cleanup done>
