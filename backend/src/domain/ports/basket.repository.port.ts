import type { Basket, BasketWithRelations, BasketStatus } from "../entities/basket.entity.js";

export interface IBasketRepository {
  findByOrderId(orderId: string): Promise<BasketWithRelations[]>;
  findById(id: string): Promise<BasketWithRelations | undefined>;
  create(
    data: Omit<
      Basket,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "shippingCost"
      | "customsCost"
      | "receivedAt"
      | "availableAt"
      | "status"
    > & { status?: BasketStatus },
  ): Promise<Basket>;
  update(id: string, data: Partial<Basket>): Promise<Basket | undefined>;
  deleteById(id: string): Promise<void>;
}
