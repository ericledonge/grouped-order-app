import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.js";
import { createAdminUser, createMemberUser, authHeaders } from "../helpers/auth-helpers.js";

describe("Orders API", () => {
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

  it("POST /api/orders - un admin peut créer une commande", async () => {
    const res = await testApp.app.request("/api/orders", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({
        type: "monthly",
        targetDate: new Date(Date.now() + 86400000).toISOString(),
        description: "Commande test",
      }),
    });
    expect(res.status).toBe(201);
    const order = await res.json();
    expect(order.type).toBe("monthly");
    expect(order.status).toBe("open");
    expect(order.id).toBeDefined();
  });

  it("POST /api/orders - un membre reçoit 403", async () => {
    const res = await testApp.app.request("/api/orders", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        type: "monthly",
        targetDate: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    expect(res.status).toBe(403);
  });

  it("GET /api/orders - un utilisateur authentifié peut lister les commandes", async () => {
    const res = await testApp.app.request("/api/orders", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBe(true);
    expect(orders.length).toBeGreaterThan(0);
  });

  it("GET /api/orders?status=open - filtre par statut", async () => {
    const res = await testApp.app.request("/api/orders?status=open", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBe(true);
    for (const order of orders) {
      expect(order.status).toBe("open");
    }
  });

  it("GET /api/orders/:id - retourne 404 pour un id inexistant", async () => {
    const res = await testApp.app.request("/api/orders/nonexistent-id", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/orders - rejette un body invalide", async () => {
    const res = await testApp.app.request("/api/orders", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({ type: "invalid" }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/orders - rejette une date passée", async () => {
    const res = await testApp.app.request("/api/orders", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({
        type: "monthly",
        targetDate: "2020-01-01",
      }),
    });
    expect(res.status).toBe(400);
  });
});
