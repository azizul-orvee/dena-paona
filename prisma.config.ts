import { defineConfig } from "prisma/config";

// The Prisma CLI runs outside Next.js, so load the local env file ourselves.
for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Optional — Vercel and CI supply the variables directly.
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // Migrations need a direct (non-pooled) connection. Falls back to
    // DATABASE_URL, which is fine when that is already the direct URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL!,
  },
});
