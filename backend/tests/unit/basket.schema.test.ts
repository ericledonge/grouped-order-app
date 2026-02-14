import { describe, it, expect } from "vitest";
import { createBasketSchema, editBasketSchema } from "../../src/application/schemas/basket.schema.js";

describe("createBasketSchema", () => {
  it("accepte un input valide", () => {
    const result = createBasketSchema.safeParse({
      orderId: "order-123",
      wishIds: ["wish-1", "wish-2"],
    });
    expect(result.success).toBe(true);
  });

  it("accepte avec un nom optionnel", () => {
    const result = createBasketSchema.safeParse({
      orderId: "order-123",
      name: "Panier janvier",
      wishIds: ["wish-1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejette un panier sans souhaits", () => {
    const result = createBasketSchema.safeParse({
      orderId: "order-123",
      wishIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejette un orderId manquant", () => {
    const result = createBasketSchema.safeParse({
      wishIds: ["wish-1"],
    });
    expect(result.success).toBe(false);
  });
});

describe("editBasketSchema", () => {
  it("accepte un input valide", () => {
    const result = editBasketSchema.safeParse({
      shippingCost: 25.5,
      wishes: [
        { id: "wish-1", unitPrice: 30 },
        { id: "wish-2", unitPrice: 45 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("rejette des frais de port négatifs", () => {
    const result = editBasketSchema.safeParse({
      shippingCost: -5,
      wishes: [{ id: "wish-1", unitPrice: 30 }],
    });
    expect(result.success).toBe(false);
  });

  it("rejette un prix unitaire négatif", () => {
    const result = editBasketSchema.safeParse({
      shippingCost: 10,
      wishes: [{ id: "wish-1", unitPrice: -5 }],
    });
    expect(result.success).toBe(false);
  });
});
