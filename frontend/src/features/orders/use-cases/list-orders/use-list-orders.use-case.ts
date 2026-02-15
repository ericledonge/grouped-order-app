import { useOrders } from '@/features/orders/domain/order.repository'
import type { OrderStatus } from '@/features/orders/domain/order.types'

export function useListOrders(status?: OrderStatus) {
  const { data: orders, isPending, error } = useOrders(status)

  return {
    orders: orders ?? [],
    isPending,
    error: error?.message ?? null,
  }
}
