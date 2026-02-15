import { z } from 'zod'
import { apiFetch } from '@/lib/api-client'
import { wishSchema } from './wish.types'
import type { Wish } from './wish.types'

export interface CreateWishPayload {
  orderId: string
  gameName: string
  philibertReference: string
  philibertUrl?: string
  userId?: string
}

export const wishAdapter = {
  fetchMyWishes: async (): Promise<Wish[]> => {
    const data = await apiFetch<unknown>('/api/wishes/mine')
    return z.array(wishSchema).parse(data)
  },

  fetchOrderWishes: async (orderId: string): Promise<Wish[]> => {
    const data = await apiFetch<unknown>(`/api/wishes/order/${orderId}`)
    return z.array(wishSchema).parse(data)
  },

  createWish: async (payload: CreateWishPayload): Promise<Wish> => {
    const data = await apiFetch<unknown>('/api/wishes', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return wishSchema.parse(data)
  },
}
