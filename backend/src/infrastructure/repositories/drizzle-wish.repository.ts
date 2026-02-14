import { and, eq } from "drizzle-orm";
import type { IWishRepository } from "../../domain/ports/wish.repository.port.js";
import type { Wish, WishWithRelations } from "../../domain/entities/wish.entity.js";
import type { Database } from "../db/index.js";
import { wish } from "../db/schema.js";

export function createDrizzleWishRepository(db: Database): IWishRepository {
  return {
    async findByOrderId(orderId: string) {
      return db.query.wish.findMany({
        where: eq(wish.orderId, orderId),
        orderBy: (wish, { desc }) => [desc(wish.createdAt)],
      }) as Promise<Wish[]>;
    },

    async findByUserId(userId: string) {
      return db.query.wish.findMany({
        where: eq(wish.userId, userId),
        with: { order: true, basket: true },
        orderBy: (wish, { desc }) => [desc(wish.createdAt)],
      }) as Promise<WishWithRelations[]>;
    },

    async findById(id: string) {
      return db.query.wish.findFirst({
        where: eq(wish.id, id),
        with: { basket: true },
      }) as Promise<WishWithRelations | undefined>;
    },

    async findByOrderIdAndStatus(orderId, status) {
      return db.query.wish.findMany({
        where: and(eq(wish.orderId, orderId), eq(wish.status, status)),
      }) as Promise<Wish[]>;
    },

    async create(data) {
      const [result] = await db.insert(wish).values(data).returning();
      return result as Wish;
    },

    async update(id: string, data) {
      const [result] = await db.update(wish).set(data).where(eq(wish.id, id)).returning();
      return result as Wish | undefined;
    },

    async deleteById(id: string) {
      await db.delete(wish).where(eq(wish.id, id));
    },
  };
}
