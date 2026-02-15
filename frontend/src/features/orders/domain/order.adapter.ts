import { z } from 'zod'
import { apiFetch } from '@/lib/api-client'
import { orderSchema } from './order.types'
import type { Order, OrderStatus } from './order.types'

export interface CreateOrderPayload {
  type: string
  targetDate: string
  description?: string
}

export const orderAdapter = {
  fetchOrders: async (status?: OrderStatus): Promise<Order[]> => {
    const query = status ? `?status=${status}` : ''
    const data = await apiFetch<unknown>(`/api/orders${query}`)
    return z.array(orderSchema).parse(data)
  },

  fetchOrder: async (id: string): Promise<Order> => {
    const data = await apiFetch<unknown>(`/api/orders/${id}`)
    return orderSchema.parse(data)
  },

  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const data = await apiFetch<unknown>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return orderSchema.parse(data)
  },
}
