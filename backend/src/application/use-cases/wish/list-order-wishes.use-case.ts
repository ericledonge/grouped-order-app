import type { IWishRepository } from "../../../domain/ports/wish.repository.port.js";

export function listOrderWishesUseCase(wishRepo: IWishRepository) {
  return async (orderId: string) => {
    return wishRepo.findByOrderId(orderId);
  };
}
