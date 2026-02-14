import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.js";
import { createAdminUser, createMemberUser, authHeaders } from "../helpers/auth-helpers.js";

describe("Baskets API", () => {
  let testApp: TestApp;
  let adminCookie: string;
  let memberCookie: string;
  let orderId: string;
  let wishId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    const admin = await createAdminUser(testApp);
    adminCookie = admin.cookie;
    const member = await createMemberUser(testApp);
    memberCookie = member.cookie;

    // Créer une commande
    const orderRes = await testApp.app.request("/api/orders", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({
        type: "monthly",
        targetDate: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    const order = await orderRes.json();
    orderId = order.id;

    // Créer un souhait
    const wishRes = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        orderId,
        gameName: "Terraforming Mars",
        philibertReference: "PHI-12345",
      }),
    });
    const wish = await wishRes.json();
    wishId = wish.id;
  });

  it("POST /api/baskets - un admin peut créer un panier", async () => {
    const res = await testApp.app.request("/api/baskets", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({
        orderId,
        wishIds: [wishId],
      }),
    });
    expect(res.status).toBe(201);
    const basket = await res.json();
    expect(basket.status).toBe("draft");
    expect(basket.orderId).toBe(orderId);
    expect(basket.id).toBeDefined();
  });

  it("POST /api/baskets - un membre reçoit 403", async () => {
    const res = await testApp.app.request("/api/baskets", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        orderId,
        wishIds: [wishId],
      }),
    });
    expect(res.status).toBe(403);
  });

  it("GET /api/baskets/order/:orderId - retourne les paniers d'une commande", async () => {
    const res = await testApp.app.request(`/api/baskets/order/${orderId}`, {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(200);
    const baskets = await res.json();
    expect(Array.isArray(baskets)).toBe(true);
    expect(baskets.length).toBeGreaterThan(0);
  });

  it("GET /api/baskets/:id - retourne 404 pour un id inexistant", async () => {
    const res = await testApp.app.request("/api/baskets/nonexistent-id", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/baskets - rejette un panier sans souhaits", async () => {
    const res = await testApp.app.request("/api/baskets", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({
        orderId,
        wishIds: [],
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/baskets - non authentifié retourne 401", async () => {
    const res = await testApp.app.request("/api/baskets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        wishIds: [wishId],
      }),
    });
    expect(res.status).toBe(401);
  });
});
