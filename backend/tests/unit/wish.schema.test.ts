import { describe, it, expect } from "vitest";
import { createWishSchema } from "../../src/application/schemas/wish.schema.js";

describe("createWishSchema", () => {
  it("accepte un input valide", () => {
    const result = createWishSchema.safeParse({
      orderId: "order-123",
      gameName: "Terraforming Mars",
      philibertReference: "PHI-12345",
      philibertUrl: "https://www.philibert.com/game",
    });
    expect(result.success).toBe(true);
  });

  it("accepte sans URL (optionnel)", () => {
    const result = createWishSchema.safeParse({
      orderId: "order-123",
      gameName: "Wingspan",
      philibertReference: "PHI-67890",
    });
    expect(result.success).toBe(true);
  });

  it("accepte une URL vide", () => {
    const result = createWishSchema.safeParse({
      orderId: "order-123",
      gameName: "Wingspan",
      philibertReference: "PHI-67890",
      philibertUrl: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejette un nom de jeu vide", () => {
    const result = createWishSchema.safeParse({
      orderId: "order-123",
      gameName: "",
      philibertReference: "PHI-12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une référence Philibert vide", () => {
    const result = createWishSchema.safeParse({
      orderId: "order-123",
      gameName: "Terraforming Mars",
      philibertReference: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un orderId manquant", () => {
    const result = createWishSchema.safeParse({
      gameName: "Terraforming Mars",
      philibertReference: "PHI-12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une URL invalide", () => {
    const result = createWishSchema.safeParse({
      orderId: "order-123",
      gameName: "Terraforming Mars",
      philibertReference: "PHI-12345",
      philibertUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
