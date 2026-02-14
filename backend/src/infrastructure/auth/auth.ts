import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import type { Database } from "../db/index.js";

export interface AuthOptions {
  trustedOrigins: string[];
  secret: string;
  baseURL: string;
}

export function createAuth(db: Database, options: AuthOptions) {
  return betterAuth({
    database: drizzleAdapter(db, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
    plugins: [admin()],
    trustedOrigins: options.trustedOrigins,
    secret: options.secret,
    baseURL: options.baseURL,
  });
}

export type Auth = ReturnType<typeof createAuth>;
