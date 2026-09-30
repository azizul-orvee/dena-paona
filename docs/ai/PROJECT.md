# Project Overview — Dena-Paona

## Purpose
A private ledger for informal money between friends and family. দেনা (*dena*) = money you owe; পাওনা (*paona*) = money you're owed. The primary user action is **logging an entry** (who, how much, optional note and due date), then recording part payments until it settles. Users can grant another registered user **read-only** access to their wallet, by email.

## Owner / client
Personal project of Azizul Hakim (GitHub: `azizul-orvee`). Audience: people in Bangladesh (currency ৳ BDT, locale `en-BD`).

## Tech stack
| Layer | Tech |
|---|---|
| Framework | Next.js 16.3 (App Router, Server Actions, Turbopack), React 19 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS v4 (CSS-first `@theme` tokens in `src/app/globals.css`), self-hosted Inter + Sora fonts |
| Motion | `motion` v13 (Framer Motion) |
| Database / ORM | Prisma 7.10 on Postgres — production: Neon (`@prisma/adapter-neon`, WebSocket pool); dev: local Postgres 17 via Homebrew (`@prisma/adapter-pg`) |
| Auth | Better Auth 1.7 — **Google OAuth only**, DB sessions |
| Validation | Zod 4 |
| Icons | lucide-react |
| Hosting | Vercel (planned) |
| Analytics / payments | None |

## Getting started
```bash
brew install postgresql@17 && brew services start postgresql@17
createdb dena_paona_dev          # the local dev database
npm install                      # also runs `prisma generate` (postinstall)
cp .env.example .env.local       # then fill in every variable
npm run db:migrate               # applies prisma/migrations/ to the local DB
SEED_EMAIL=you@gmail.com npm run seed   # optional demo data (local only)
npm run dev                      # http://localhost:3000
```

## Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Next dev server (Turbopack) |
| `npm run build` / `npm start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | `prisma generate` → `src/generated/prisma` |
| `npm run db:migrate` | `prisma migrate deploy` (apply checked-in migrations) |
| `npm run db:migrate:dev` | `prisma migrate dev` (create a new migration in dev) |
| `npm run db:migrate:prod` | `scripts/migrate-prod.mjs`: shows pending migrations on **production** (from `PROD_DATABASE_URL`), applies only after typing `yes`. Owner-run / owner-approved only |
| `npm run db:studio` | Prisma Studio DB browser |
| `npm run seed` | Demo data into the local DB (`scripts/seed.mjs`); `SEED_EMAIL=` makes "Ayesha" your Google account; refuses Neon hosts |
| `npm run icons` | Regenerate logo / favicons / PWA icons (`scripts/generate-icons.mjs`) |

## Environment variables (names only — never values)
| Name | Purpose | Where set |
|---|---|---|
| `DATABASE_URL` | DB for the app and Prisma. Local: `postgresql://<mac-user>@localhost:5432/dena_paona_dev`. Vercel: the Neon (direct) URL | `.env.local`, Vercel |
| `PROD_DATABASE_URL` | Local only, optional: production Neon URL parked so it isn't lost. **Nothing reads it** — used only deliberately, e.g. `DATABASE_URL="$PROD_DATABASE_URL" npx prisma migrate deploy` | `.env.local` |
| `DIRECT_URL` | Optional: direct URL for migrations if `DATABASE_URL` is the pooled one | `.env.local`, Vercel |
| `BETTER_AUTH_SECRET` | Signs session cookies (`openssl rand -base64 32`) | `.env.local`, Vercel |
| `BETTER_AUTH_URL` | App's public URL (`http://localhost:3000` locally) | `.env.local`, Vercel |
| `GOOGLE_CLIENT_ID` | Google OAuth client | `.env.local`, Vercel |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `.env.local`, Vercel |
| `NEXT_PUBLIC_SITE_URL` | Optional: canonical URL for metadata (`src/app/layout.tsx`) | Vercel |

`.env.example` documents each one with where to get it. If the Google pair is missing, the login button is disabled and nobody can sign in.

## Deployment
Deployed on Vercel at `https://dena-paona-final.vercel.app` (Vercel project set up by the owner; env vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for Production and Preview). Pushing to `main` deploys. Before any deploy that changes the schema, apply migrations to production — only when the owner asks: `npm run db:migrate:prod` (outside the Claude Code sandbox). Google OAuth client needs origin `https://dena-paona-final.vercel.app` and redirect URI `https://dena-paona-final.vercel.app/api/auth/callback/google`; publishing the consent screen needs the `/privacy` and `/terms` pages.

## External accounts / dashboards
- **GitHub:** `github.com/azizul-orvee/dena-paona`
- **Neon (production):** project database `neondb`, endpoint `ep-spring-bar-b3tb68e9` (ap-southeast-1). Holds the owner's real account; migrations `0_init`, `1_better_auth` and `2_entry_address` applied (last one on 2026-10-01, owner-requested).
- **Local dev DB:** Homebrew `postgresql@17` service, database `dena_paona_dev`, trust auth for the Mac user (no password). The Neon project also has a `neon_auth` schema (Neon's own hosted auth) that this app does not use.
- **Google Cloud Console:** OAuth client (Web application) with redirect URI `http://localhost:3000/api/auth/callback/google`. Consent screen is in **Testing** mode.
- **Vercel:** TODO: confirm with user.
