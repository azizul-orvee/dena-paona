import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function connect(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and add your Neon connection string.",
    );
  }

  // Neon (production) goes through Neon's WebSocket pool — not its HTTP
  // driver, because Better Auth needs transactions. Anything else, e.g. the
  // local dev Postgres, speaks the plain Postgres protocol.
  const isNeon = new URL(connectionString).hostname.endsWith(".neon.tech");
  const client = new PrismaClient({
    adapter: isNeon
      ? new PrismaNeon({ connectionString })
      : new PrismaPg({ connectionString }),
  });

  // One client per process — and across dev hot reloads, which would
  // otherwise open a new pool on every edit.
  globalForPrisma.prisma = client;
  return client;
}

/**
 * Connects on first use rather than at import time, so `next build` and any
 * tooling that merely loads a route module doesn't need live credentials.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = connect();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
