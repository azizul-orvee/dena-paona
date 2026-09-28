/**
 * Optional demo data for the LOCAL dev database: two accounts, a spread of
 * entries, and a read-only share between them. Safe to re-run — it clears the
 * two demo users first. Refuses to run against Neon (production).
 *
 *   npm run seed
 *   SEED_EMAIL=you@gmail.com npm run seed   # "Ayesha" becomes your Google account
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Minimal .env.local reader so the script needs no extra dependency.
for (const file of [".env.local", ".env"]) {
  try {
    for (const line of readFileSync(resolve(root, file), "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch {
    /* file is optional */
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

// Demo data belongs in the local dev database only, never production.
if (new URL(process.env.DATABASE_URL).hostname.endsWith(".neon.tech")) {
  console.error("Refusing to seed: DATABASE_URL points at Neon (production).");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

/** Tagged template → parameterised query, returning the rows. */
async function sql(strings, ...values) {
  const text = strings.reduce((acc, s, i) => acc + `$${i}` + s);
  const { rows } = await client.query(text, values);
  return rows;
}

// Sign-in is Google-only, so seed "Ayesha" with your own Google email
// (SEED_EMAIL) to log in and see her ledger. Rahim stays a placeholder.
// Note: an existing account with that email is replaced (dev DB only).
const AYESHA = process.env.SEED_EMAIL?.trim().toLowerCase() || "ayesha@example.com";
const RAHIM = "rahim@example.com";

/** Local calendar date, not UTC — due dates are date-only and read locally. */
function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function main() {
  await client.connect();
  await sql`delete from users where email in (${AYESHA}, ${RAHIM})`;

  const [ayesha] = await sql`
    insert into users (name, email, email_verified, phone)
    values ('Ayesha Siddiqua', ${AYESHA}, true, '01700000001')
    returning id`;
  const [rahim] = await sql`
    insert into users (name, email, email_verified, phone)
    values ('Rahim Uddin', ${RAHIM}, true, '01700000002')
    returning id`;

  const entries = [
    ["paona", "Rafi Hasan", "4500.00", "0.00", "Cricket tickets", daysFromNow(6), null],
    ["paona", "Nusrat Jahan", "2300.00", "1000.00", "Dinner at Star", daysFromNow(-3), null],
    ["paona", "Tanvir Ahmed", "800.00", "0.00", "Coffee run", null, null],
    ["paona", "Rafi Hasan", "15000.00", "15000.00", "Laptop advance", null, "now()"],
    ["dena", "Ammu", "12000.00", "0.00", "Rickshaw fund", daysFromNow(20), null],
    ["dena", "Shakib", "950.00", "0.00", "Shared lunch", daysFromNow(-9), null],
    ["dena", "Nusrat Jahan", "3200.00", "3200.00", "Eid shopping", null, "now()"],
  ];

  for (const [kind, name, amount, paid, note, due, settled] of entries) {
    if (settled) {
      await sql`
        insert into entries (owner_id, kind, person_name, amount, amount_paid, note, due_date, settled_at)
        values (${ayesha.id}, ${kind}, ${name}, ${amount}, ${paid}, ${note}, ${due}, now())`;
    } else {
      await sql`
        insert into entries (owner_id, kind, person_name, amount, amount_paid, note, due_date)
        values (${ayesha.id}, ${kind}, ${name}, ${amount}, ${paid}, ${note}, ${due})`;
    }
  }

  await sql`
    insert into entries (owner_id, kind, person_name, amount, note)
    values (${rahim.id}, 'dena', 'Ayesha Siddiqua', '5000.00', 'Borrowed for the trip')`;

  // Ayesha lets Rahim look at her wallet.
  await sql`
    insert into wallet_shares (owner_id, viewer_id)
    values (${ayesha.id}, ${rahim.id})
    on conflict do nothing`;

  console.log("Seeded.");
  console.log(`  Ayesha  ${AYESHA}  (7 entries, shares with Rahim)`);
  console.log(`  Rahim   ${RAHIM}  (can view Ayesha's wallet)`);
  if (!process.env.SEED_EMAIL) {
    console.log("Sign-in is Google-only: re-run with SEED_EMAIL=<your Google email> to log in as Ayesha.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => client.end());
