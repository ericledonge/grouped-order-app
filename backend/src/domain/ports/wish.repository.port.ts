import type { Wish, WishWithRelations, WishStatus } from "../entities/wish.entity.js";

export interface IWishRepository {
  findByOrderId(orderId: string): Promise<Wish[]>;
  findByUserId(userId: string): Promise<WishWithRelations[]>;
  findById(id: string): Promise<WishWithRelations | undefined>;
  findByOrderIdAndStatus(orderId: string, status: WishStatus): Promise<Wish[]>;
  create(
    data: Omit<
      Wish,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "unitPrice"
      | "shippingShare"
      | "customsShare"
      | "amountDue"
      | "paymentStatus"
      | "paymentSentAt"
      | "paymentReceivedAt"
      | "amountPaid"
      | "pickedUpAt"
      | "basketId"
      | "depositPointId"
      | "status"
    > & { status?: WishStatus },
  ): Promise<Wish>;
  update(id: string, data: Partial<Wish>): Promise<Wish | undefined>;
  deleteById(id: string): Promise<void>;
}
