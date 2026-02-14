import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.js";
import { signUpUser, signInUser } from "../helpers/auth-helpers.js";

describe("Authentication", () => {
  let testApp: TestApp;

  beforeAll(async () => {
    testApp = await createTestApp();
  });

  it("POST /api/auth/sign-up/email crée un utilisateur", async () => {
    const res = await signUpUser(testApp.app, {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
  });

  it("POST /api/auth/sign-in/email retourne un cookie de session", async () => {
    await signUpUser(testApp.app, {
      name: "Login User",
      email: "login@example.com",
      password: "password123",
    });

    const { res, cookie } = await signInUser(testApp.app, {
      email: "login@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(cookie).toBeTruthy();
  });

  it("une requête non authentifiée sur une route protégée retourne 401", async () => {
    const res = await testApp.app.request("/api/orders");
    expect(res.status).toBe(401);
  });
});
