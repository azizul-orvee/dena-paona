import "server-only";

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import { prisma } from "@/lib/prisma";

/**
 * Google is the only way in — no email, password or magic-link sign-up
 * exists. Until its credentials are set, the login button stays disabled.
 */
export const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  appName: "Dena-Paona",
  // Reads BETTER_AUTH_SECRET and BETTER_AUTH_URL from the environment.

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  advanced: {
    // Every id in this schema is a Postgres uuid.
    database: { generateId: "uuid" },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // slide the expiry at most once a day
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          prompt: "select_account",
        },
      }
    : {},

  rateLimit: {
    enabled: true,
    // Memory would reset per serverless instance; the database doesn't.
    storage: "database",
    modelName: "rateLimit",
  },

  // OAuth failures (cancelled consent, stale state) land back on the login
  // page with ?error=… instead of Better Auth's default error page.
  onAPIError: { errorURL: "/login" },

  // Must stay last: lets server actions set/clear the session cookie.
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
