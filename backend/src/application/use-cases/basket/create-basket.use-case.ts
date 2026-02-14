import type { IBasketRepository } from "../../../domain/ports/basket.repository.port.js";
import type { CreateBasketInput } from "../../schemas/basket.schema.js";

export function createBasketUseCase(basketRepo: IBasketRepository) {
  return async (input: CreateBasketInput, userId: string) => {
    // TODO: verify all wishes are in "submitted" status and have no basket_id
    // TODO: update wishes to "in_basket" status and set basket_id
    return basketRepo.create({
      name: input.name || `Panier - ${new Date().toLocaleDateString("fr-CA")}`,
      orderId: input.orderId,
      createdBy: userId,
    });
  };
}
