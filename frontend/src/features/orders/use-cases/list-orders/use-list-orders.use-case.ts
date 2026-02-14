import { useOrders } from '@/features/orders/domain/order.repository'

export function useListOrders() {
  const { data: orders, isPending, error } = useOrders()

  return {
    orders: orders ?? [],
    isPending,
    error: error?.message ?? null,
  }
}
