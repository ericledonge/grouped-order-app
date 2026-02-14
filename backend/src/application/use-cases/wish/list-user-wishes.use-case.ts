import type { IWishRepository } from "../../../domain/ports/wish.repository.port.js";

export function listUserWishesUseCase(wishRepo: IWishRepository) {
  return async (userId: string) => {
    return wishRepo.findByUserId(userId);
  };
}
