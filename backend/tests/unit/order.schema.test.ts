import { describe, it, expect } from "vitest";
import { createOrderSchema } from "../../src/application/schemas/order.schema.js";

describe("createOrderSchema", () => {
  it("accepte un input valide", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = createOrderSchema.safeParse({
      type: "monthly",
      targetDate: futureDate,
      description: "Commande test",
    });
    expect(result.success).toBe(true);
  });

  it("rejette une date passée", () => {
    const result = createOrderSchema.safeParse({
      type: "monthly",
      targetDate: "2020-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejette un type invalide", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = createOrderSchema.safeParse({
      type: "invalid",
      targetDate: futureDate,
    });
    expect(result.success).toBe(false);
  });

  it("accepte tous les types valides", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    for (const type of ["monthly", "private_sale", "special"]) {
      const result = createOrderSchema.safeParse({ type, targetDate: futureDate });
      expect(result.success).toBe(true);
    }
  });

  it("accepte une description optionnelle", () => {
    const futureDate = new Date(Date.now() + 86400000).toISOString();
    const result = createOrderSchema.safeParse({
      type: "private_sale",
      targetDate: futureDate,
    });
    expect(result.success).toBe(true);
  });

  it("rejette un body vide", () => {
    const result = createOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
