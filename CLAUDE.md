@AGENTS.md

# Claude Code specifics
- Follow the Hard rules in AGENTS.md: never commit or push unless explicitly asked; never change the production (Neon) database. Develop against the local Postgres in `DATABASE_URL`; before any DB command confirm its host is `localhost`.
- Follow the Documentation rules in AGENTS.md on every task — update `docs/ai/` before saying you're done.
- Sandbox: run `next build`, `npx prisma …`, `psql` and any DB script with the sandbox disabled; npm installs need `npm_config_cache="$TMPDIR/npm-cache"` and `registry.npmjs.org` allowed.
- Verify UI changes with the `dena-paona` dev server in `.claude/launch.json` (port 3000).
- Checks before finishing: `npm run typecheck`, `npm run lint`, and `next build` for anything non-trivial.
