import type { IOrderRepository } from "../../../domain/ports/order.repository.port.js";

export function getOrderUseCase(orderRepo: IOrderRepository) {
  return async (id: string) => {
    return orderRepo.findById(id);
  };
}
