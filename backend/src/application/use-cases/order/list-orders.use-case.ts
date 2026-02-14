import type { IOrderRepository } from "../../../domain/ports/order.repository.port.js";
import type { OrderStatus } from "../../../domain/entities/order.entity.js";

export function listOrdersUseCase(orderRepo: IOrderRepository) {
  return async (status?: OrderStatus) => {
    if (status) {
      return orderRepo.findByStatus(status);
    }
    return orderRepo.findAll();
  };
}
