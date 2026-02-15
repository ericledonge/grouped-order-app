import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.js";
import {
  createAdminUser,
  createMemberUser,
  authHeaders,
} from "../helpers/auth-helpers.js";

describe("Users API", () => {
  let testApp: TestApp;
  let adminCookie: string;
  let memberCookie: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    const admin = await createAdminUser(testApp);
    adminCookie = admin.cookie;
    const member = await createMemberUser(testApp);
    memberCookie = member.cookie;
  });

  it("GET /api/users - un admin peut lister les utilisateurs", async () => {
    const res = await testApp.app.request("/api/users", {
      headers: authHeaders(adminCookie),
    });
    expect(res.status).toBe(200);
    const users = await res.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users[0]).toHaveProperty("id");
    expect(users[0]).toHaveProperty("name");
    expect(users[0]).toHaveProperty("email");
    expect(users[0]).not.toHaveProperty("role");
  });

  it("GET /api/users - un membre reçoit 403", async () => {
    const res = await testApp.app.request("/api/users", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(403);
  });
});
