import type { IOrderRepository } from "../../../domain/ports/order.repository.port.js";
import type { IWishRepository } from "../../../domain/ports/wish.repository.port.js";
import type { CreateWishInput } from "../../schemas/wish.schema.js";

export function createWishUseCase(wishRepo: IWishRepository, orderRepo: IOrderRepository) {
  return async (input: CreateWishInput, userId: string) => {
    const order = await orderRepo.findById(input.orderId);
    if (!order) {
      throw new Error("Commande introuvable");
    }
    if (order.status === "completed") {
      throw new Error("Impossible d'ajouter un souhait à une commande terminée");
    }

    return wishRepo.create({
      gameName: input.gameName,
      philibertReference: input.philibertReference,
      philibertUrl: input.philibertUrl || null,
      userId,
      orderId: input.orderId,
    });
  };
}
