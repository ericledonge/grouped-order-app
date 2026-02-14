import type { IOrderRepository } from "../../../domain/ports/order.repository.port.js";
import type { CreateOrderInput } from "../../schemas/order.schema.js";

export function createOrderUseCase(orderRepo: IOrderRepository) {
  return async (input: CreateOrderInput, userId: string) => {
    return orderRepo.create({
      type: input.type,
      targetDate: input.targetDate,
      description: input.description ?? null,
      status: "open",
      createdBy: userId,
    });
  };
}
