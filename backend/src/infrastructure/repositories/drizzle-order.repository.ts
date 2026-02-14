import { eq } from "drizzle-orm";
import type { IOrderRepository } from "../../domain/ports/order.repository.port.js";
import type { Order } from "../../domain/entities/order.entity.js";
import type { Database } from "../db/index.js";
import { order } from "../db/schema.js";

export function createDrizzleOrderRepository(db: Database): IOrderRepository {
  return {
    async findAll() {
      return db.query.order.findMany({
        orderBy: (order, { desc }) => [desc(order.createdAt)],
      }) as Promise<Order[]>;
    },

    async findById(id: string) {
      return db.query.order.findFirst({
        where: eq(order.id, id),
      }) as Promise<Order | undefined>;
    },

    async findByStatus(status) {
      return db.query.order.findMany({
        where: eq(order.status, status),
        orderBy: (order, { desc }) => [desc(order.createdAt)],
      }) as Promise<Order[]>;
    },

    async create(data) {
      const [result] = await db.insert(order).values(data).returning();
      return result as Order;
    },

    async update(id: string, data) {
      const [result] = await db.update(order).set(data).where(eq(order.id, id)).returning();
      return result as Order | undefined;
    },
  };
}
