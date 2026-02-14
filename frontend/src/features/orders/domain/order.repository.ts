import { useMutation, useQuery } from '@tanstack/react-query'
import { orderAdapter } from './order.adapter'
import type { CreateOrderPayload } from './order.adapter'
import type { OrderStatus } from './order.types'

export function useOrders(status?: OrderStatus) {
  return useQuery({
    queryKey: ['orders', status],
    queryFn: () => orderAdapter.fetchOrders(status),
  })
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderAdapter.createOrder(payload),
  })
}
