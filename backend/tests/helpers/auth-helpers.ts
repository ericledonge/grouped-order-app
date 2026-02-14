import { sql } from "drizzle-orm";
import type { TestApp } from "./test-app.js";

export async function signUpUser(
  app: TestApp["app"],
  user: { name: string; email: string; password: string },
) {
  const res = await app.request("/api/auth/sign-up/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  return res;
}

export async function signInUser(
  app: TestApp["app"],
  credentials: { email: string; password: string },
) {
  const res = await app.request("/api/auth/sign-in/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const setCookie = res.headers.get("set-cookie");
  return { res, cookie: setCookie };
}

export function authHeaders(cookie: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Cookie: cookie,
  };
}

export async function createAdminUser(testApp: TestApp) {
  const { app, db } = testApp;

  await signUpUser(app, {
    name: "Admin",
    email: "admin@test.com",
    password: "password123",
  });

  await db.run(sql`UPDATE user SET role = 'admin' WHERE email = 'admin@test.com'`);

  const { cookie } = await signInUser(app, {
    email: "admin@test.com",
    password: "password123",
  });

  return { cookie: cookie! };
}

export async function createMemberUser(testApp: TestApp) {
  const { app } = testApp;

  await signUpUser(app, {
    name: "Member",
    email: "member@test.com",
    password: "password123",
  });

  const { cookie } = await signInUser(app, {
    email: "member@test.com",
    password: "password123",
  });

  return { cookie: cookie! };
}
