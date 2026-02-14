import { eq } from "drizzle-orm";
import type { IBasketRepository } from "../../domain/ports/basket.repository.port.js";
import type { Basket, BasketWithRelations } from "../../domain/entities/basket.entity.js";
import type { Database } from "../db/index.js";
import { basket } from "../db/schema.js";

export function createDrizzleBasketRepository(db: Database): IBasketRepository {
  return {
    async findByOrderId(orderId: string) {
      return db.query.basket.findMany({
        where: eq(basket.orderId, orderId),
        with: { wishes: true },
        orderBy: (basket, { desc }) => [desc(basket.createdAt)],
      }) as Promise<BasketWithRelations[]>;
    },

    async findById(id: string) {
      return db.query.basket.findFirst({
        where: eq(basket.id, id),
        with: { wishes: true },
      }) as Promise<BasketWithRelations | undefined>;
    },

    async create(data) {
      const [result] = await db.insert(basket).values(data).returning();
      return result as Basket;
    },

    async update(id: string, data) {
      const [result] = await db.update(basket).set(data).where(eq(basket.id, id)).returning();
      return result as Basket | undefined;
    },

    async deleteById(id: string) {
      await db.delete(basket).where(eq(basket.id, id));
    },
  };
}
