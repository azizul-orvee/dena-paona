// Applies checked-in migrations (prisma/migrations) to the PRODUCTION Neon DB.
// Reads PROD_DATABASE_URL from .env.local, shows what's pending, and only
// applies after you type "yes". Run with: npm run db:migrate:prod
import { execFileSync } from "node:child_process";
import { createInterface } from "node:readline/promises";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Fine if PROD_DATABASE_URL is already in the environment.
}

const url = process.env.PROD_DATABASE_URL;
if (!url) {
  console.error("PROD_DATABASE_URL is not set (expected in .env.local).");
  process.exit(1);
}

const host = new URL(url).hostname;
if (!host.endsWith(".neon.tech")) {
  console.error(`PROD_DATABASE_URL points at ${host}, not Neon. Refusing.`);
  process.exit(1);
}

// Shell env beats .env.local in prisma.config.ts, so this targets production.
const env = { ...process.env, DATABASE_URL: url, DIRECT_URL: url };
const prisma = (...args) =>
  execFileSync("npx", ["prisma", "migrate", ...args], { env, stdio: "inherit" });

console.log(`\nProduction database: ${host}\n`);
try {
  prisma("status");
} catch {
  // `migrate status` exits non-zero when migrations are pending — expected.
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question('\nApply pending migrations to PRODUCTION? Type "yes": ');
rl.close();

if (answer.trim() !== "yes") {
  console.log("Cancelled. Nothing changed.");
  process.exit(0);
}

prisma("deploy");
