import { describe, it, expect, beforeAll } from "vitest";
import { createTestApp, type TestApp } from "../helpers/test-app.js";
import { createAdminUser, createMemberUser, authHeaders } from "../helpers/auth-helpers.js";

describe("Wishes API", () => {
  let testApp: TestApp;
  let adminCookie: string;
  let memberCookie: string;
  let orderId: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    const admin = await createAdminUser(testApp);
    adminCookie = admin.cookie;
    const member = await createMemberUser(testApp);
    memberCookie = member.cookie;

    // Créer une commande pour les tests de souhaits
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
  });

  it("POST /api/wishes - un membre peut créer un souhait", async () => {
    const res = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        orderId,
        gameName: "Terraforming Mars",
        philibertReference: "PHI-12345",
        philibertUrl: "https://www.philibert.com/terraforming-mars",
      }),
    });
    expect(res.status).toBe(201);
    const wish = await res.json();
    expect(wish.gameName).toBe("Terraforming Mars");
    expect(wish.status).toBe("submitted");
    expect(wish.orderId).toBe(orderId);
  });

  it("GET /api/wishes/mine - retourne les souhaits de l'utilisateur", async () => {
    const res = await testApp.app.request("/api/wishes/mine", {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(200);
    const wishes = await res.json();
    expect(Array.isArray(wishes)).toBe(true);
    expect(wishes.length).toBeGreaterThan(0);
  });

  it("GET /api/wishes/order/:orderId - retourne les souhaits d'une commande", async () => {
    const res = await testApp.app.request(`/api/wishes/order/${orderId}`, {
      headers: authHeaders(memberCookie),
    });
    expect(res.status).toBe(200);
    const wishes = await res.json();
    expect(Array.isArray(wishes)).toBe(true);
    expect(wishes.length).toBeGreaterThan(0);
  });

  it("POST /api/wishes - rejette un body invalide", async () => {
    const res = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        orderId,
        gameName: "",
        philibertReference: "",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/wishes - rejette un orderId inexistant", async () => {
    const res = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        orderId: "nonexistent-order",
        gameName: "Wingspan",
        philibertReference: "PHI-99999",
      }),
    });
    expect(res.status).toBe(400);
  });

  it("POST /api/wishes - non authentifié retourne 401", async () => {
    const res = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        gameName: "Wingspan",
        philibertReference: "PHI-99999",
      }),
    });
    expect(res.status).toBe(401);
  });

  it("POST /api/wishes - un admin peut créer un souhait pour un autre membre", async () => {
    // Récupérer l'id du membre
    const usersRes = await testApp.app.request("/api/users", {
      headers: authHeaders(adminCookie),
    });
    const users = await usersRes.json();
    const member = users.find(
      (u: { email: string }) => u.email === "member@test.com",
    );

    const res = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: authHeaders(adminCookie),
      body: JSON.stringify({
        orderId,
        gameName: "Everdell",
        philibertReference: "PHI-77777",
        userId: member.id,
      }),
    });
    expect(res.status).toBe(201);
    const wish = await res.json();
    expect(wish.gameName).toBe("Everdell");
    expect(wish.userId).toBe(member.id);
  });

  it("POST /api/wishes - un membre ne peut pas créer un souhait pour un autre", async () => {
    const res = await testApp.app.request("/api/wishes", {
      method: "POST",
      headers: authHeaders(memberCookie),
      body: JSON.stringify({
        orderId,
        gameName: "Root",
        philibertReference: "PHI-88888",
        userId: "some-other-user-id",
      }),
    });
    expect(res.status).toBe(403);
  });
});
