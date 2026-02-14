import { describe, it, expect } from "vitest";
import { calculateProrataShares } from "../../src/domain/services/prorata.service.js";

describe("calculateProrataShares", () => {
  it("distribue les coûts proportionnellement aux prix unitaires", () => {
    const items = [
      { id: "a", unitPrice: 30 },
      { id: "b", unitPrice: 70 },
    ];
    const result = calculateProrataShares(items, 10);
    expect(result).toEqual([
      { id: "a", share: 3 },
      { id: "b", share: 7 },
    ]);
  });

  it("corrige les arrondis sur le dernier item", () => {
    const items = [
      { id: "a", unitPrice: 33.33 },
      { id: "b", unitPrice: 33.33 },
      { id: "c", unitPrice: 33.34 },
    ];
    const result = calculateProrataShares(items, 10);
    const totalShares = result.reduce((sum, r) => sum + r.share, 0);
    expect(Number(totalShares.toFixed(2))).toBe(10);
  });

  it("gère un seul item", () => {
    const result = calculateProrataShares([{ id: "a", unitPrice: 50 }], 15);
    expect(result).toEqual([{ id: "a", share: 15 }]);
  });

  it("gère des prix égaux", () => {
    const items = [
      { id: "a", unitPrice: 25 },
      { id: "b", unitPrice: 25 },
    ];
    const result = calculateProrataShares(items, 10);
    expect(result).toEqual([
      { id: "a", share: 5 },
      { id: "b", share: 5 },
    ]);
  });

  it("gère un coût total de 0", () => {
    const items = [
      { id: "a", unitPrice: 30 },
      { id: "b", unitPrice: 70 },
    ];
    const result = calculateProrataShares(items, 0);
    expect(result).toEqual([
      { id: "a", share: 0 },
      { id: "b", share: 0 },
    ]);
  });

  it("arrondit à 2 décimales", () => {
    const items = [
      { id: "a", unitPrice: 10 },
      { id: "b", unitPrice: 20 },
      { id: "c", unitPrice: 30 },
    ];
    const result = calculateProrataShares(items, 7);
    for (const r of result) {
      const decimals = r.share.toString().split(".")[1];
      expect(!decimals || decimals.length <= 2).toBe(true);
    }
  });
});
