import type { Order, OrderStatus } from "../entities/order.entity.js";

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | undefined>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  create(data: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order>;
  update(id: string, data: Partial<Order>): Promise<Order | undefined>;
}
