import type { IBasketRepository } from "../../../domain/ports/basket.repository.port.js";

export function getBasketUseCase(basketRepo: IBasketRepository) {
  return async (id: string) => {
    return basketRepo.findById(id);
  };
}
