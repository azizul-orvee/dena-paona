# Architecture

## Folder map
```
prisma/
├── schema.prisma          ← data model (source of truth)
└── migrations/            ← checked-in SQL: 0_init (baseline), 1_better_auth, 2_entry_address
prisma.config.ts           ← Prisma CLI config (loads .env.local, migration URL)
scripts/
├── seed.mjs               ← local-only demo data via raw SQL (`pg`); refuses Neon hosts
└── generate-icons.mjs     ← generates logo SVG, PNGs, .ico, and the React mark's path data
src/
├── proxy.ts               ← Next 16 proxy (ex-middleware): cookie check on /app/*
├── app/
│   ├── page.tsx           ← landing page (redirects signed-in users to /app)
│   ├── (auth)/            ← split-screen auth layout; /login, /register (redirect)
│   ├── privacy/, terms/   ← public legal pages (shell: src/components/legal/legal-page.tsx)
│   ├── app/               ← the authenticated product (layout calls requireUser)
│   ├── api/auth/[...all]/ ← Better Auth route handler
│   └── fonts/, icon.svg, manifest.ts, error.tsx, not-found.tsx
├── components/
│   ├── app/               ← product UI: ledger, entry cards/forms, summaries, nav, share manager, user menu
│   ├── auth/              ← login-form (Google button), auth-aside (marketing panel)
│   ├── landing/           ← hero, feature grid, how-it-works
│   ├── motion/            ← shared easing, springs, Reveal, AnimatedNumber, SplitHeadline…
│   └── ui/                ← button, field, modal, toast
├── generated/prisma/      ← generated Prisma client (gitignored)
├── lib/
│   ├── better-auth.ts     ← Better Auth server config (the `auth` instance)
│   ├── auth.ts            ← getCurrentUser() / requireUser() — the server-side gate
│   ├── auth-client.ts     ← browser auth client (Google sign-in)
│   ├── prisma.ts          ← lazy Prisma client; Neon adapter for *.neon.tech, node-postgres otherwise
│   ├── money.ts, validation.ts (Zod), utils.ts
└── server/
    ├── queries.ts         ← all read paths, incl. share authorisation gate
    └── actions/           ← server actions: auth (sign-out), entries, shares, types
```

## Pages / routes
| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Landing page; signed-in users → `/app` |
| `/login` | `src/app/(auth)/login/page.tsx` | "Continue with Google"; shows `?error=` messages; honours `?next=` (same-site paths only) |
| `/register` | `src/app/(auth)/register/page.tsx` | Redirects to `/login` (old links) |
| `/api/health` | `src/app/api/health/route.ts` | Public setup diagnostics JSON: DB reachable (`select 1 from users`), `BETTER_AUTH_URL` matches the site, secret length, Google vars. No secrets returned, no writes. 503 + `console.error` when something fails |
| `/privacy` | `src/app/privacy/page.tsx` | Public Privacy Policy (linked from Google's consent screen, landing footer, login) |
| `/terms` | `src/app/terms/page.tsx` | Public Terms of Service (same) |
| `/app` | `src/app/app/page.tsx` | Overview: net position, totals, by-person strip, recent entries |
| `/app/dena`, `/app/paona` | `src/app/app/{dena,paona}/page.tsx` | One side of the ledger (`KindPage`) |
| `/app/shared` | `src/app/app/shared/page.tsx` | Grant/revoke read access by email; wallets shared with me |
| `/app/shared/[ownerId]` (+ `/dena`, `/paona`) | `src/app/app/shared/[ownerId]/…` | Read-only view of another user's wallet |
| `/api/auth/*` | `src/app/api/auth/[...all]/route.ts` | Better Auth: Google OAuth start/callback, session, sign-out |

## Data models
Schema: `prisma/schema.prisma`. All ids are Postgres `uuid` (`gen_random_uuid()`).
- **User** (`users`) — `name`, `email` (unique, required: the account + sharing handle), `emailVerified`, `image`, `phone` (optional, unique, currently no UI to set it), timestamps.
- **Session** (`sessions`), **Account** (`accounts`, one row per linked provider — `google`), **Verification** (`verifications`, OAuth state), **RateLimit** (`rate_limits`) — Better Auth tables, all cascade-deleted with the user.
- **Entry** (`entries`) — `ownerId → users`, `kind` enum `entry_kind` (`dena`|`paona`), `personName` (required), `personPhone?` (validated `+?\d{6,15}` after stripping spaces/dashes; drives the WhatsApp link), `personAddress?` (`varchar(200)`), `amount` (required)/`amountPaid` `numeric(14,2)`, `note?`, `dueDate?` (`date`), `settledAt?`. An entry is open while `settledAt` is null.
- **WalletShare** (`wallet_shares`) — `ownerId → users`, `viewerId → users`; unique `(owner_id, viewer_id)`; DB CHECK `wallet_shares_no_self` (owner ≠ viewer), which exists only in migration SQL because Prisma can't express it.

## Data flow
- **Sign-in:** `/login` → `authClient.signIn.social({ provider: "google" })` → Google → `/api/auth/callback/google` → Better Auth creates/links the user + `accounts` row, creates a `sessions` row and cookie → redirect to `?next=` (default `/app`). Errors come back as `/login?error=…` (`access_denied` = cancelled).
- **Protected request:** `src/proxy.ts` redirects to `/login?next=…` if there's no session cookie (fast, optimistic) → `src/app/app/layout.tsx` calls `requireUser()` which validates the session against the DB via `auth.api.getSession` (the real check; cached per request with React `cache`).
- **Mutation:** client form → server action in `src/server/actions/` → `requireUser()` → Zod validation (`src/lib/validation.ts`) → Prisma write scoped by `ownerId` → `revalidatePath(...)` → `ActionState` back to the form (toast).
- **Reads:** pages call functions in `src/server/queries.ts`. Totals and the ordered entry list use `prisma.$queryRaw` (conditional sums; "open first, newest first" ordering); numerics are returned as strings to the UI.
- **Sign-out:** `logoutAction` → `auth.api.signOut` deletes the session row; `nextCookies()` plugin clears the cookie.

## Integrations
| Service | Where in code | Notes |
|---|---|---|
| Neon Postgres (production) | `src/lib/prisma.ts`, `prisma.config.ts` | `PrismaNeon` WebSocket pool (supports transactions) |
| Local Postgres (dev) | `src/lib/prisma.ts` | `PrismaPg` (node-postgres); chosen when the `DATABASE_URL` host isn't `*.neon.tech` |
| Google OAuth | `src/lib/better-auth.ts` | Enabled only when both `GOOGLE_*` vars are set (`googleEnabled`) |
| Better Auth | `src/lib/better-auth.ts`, `src/app/api/auth/[...all]/route.ts` | Prisma adapter, uuid ids, 30-day sessions, DB-backed per-IP rate limit, account linking trusts Google |

## Key modules
- `src/lib/better-auth.ts` — the whole auth configuration; `onAPIError.errorURL = "/login"`.
- `src/lib/auth.ts` — `getCurrentUser()` / `requireUser()`; every page and action goes through these.
- `src/server/queries.ts` — read paths and `getAuthorisedWalletOwner()` (the only gate for viewing someone else's wallet; also rejects malformed uuids).
- `src/components/app/entry-card.tsx` — shows phone (`tel:` link), a WhatsApp button (`whatsappUrl()` in `src/lib/utils.ts`) and address; these render for shared viewers too, while edit/settle/delete stay owner-only.
- `src/server/actions/entries.ts` — create/update/delete/settle/part-payment; update re-opens an entry if the new amount exceeds what's paid (in a transaction).
- `src/server/actions/shares.ts` — grant by email (case-insensitive), revoke, leave.
- `src/lib/prisma.ts` — lazy client behind a Proxy so `next build` needs no DB credentials; picks the driver adapter from the `DATABASE_URL` host.
