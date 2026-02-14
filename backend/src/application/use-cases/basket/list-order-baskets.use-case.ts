import type { IBasketRepository } from "../../../domain/ports/basket.repository.port.js";

export function listOrderBasketsUseCase(basketRepo: IBasketRepository) {
  return async (orderId: string) => {
    return basketRepo.findByOrderId(orderId);
  };
}
