import { useMutation, useQuery } from '@tanstack/react-query'
import { wishAdapter } from './wish.adapter'
import type { CreateWishPayload } from './wish.adapter'

export function useMyWishes() {
  return useQuery({
    queryKey: ['wishes', 'mine'],
    queryFn: () => wishAdapter.fetchMyWishes(),
  })
}

export function useOrderWishes(orderId: string) {
  return useQuery({
    queryKey: ['wishes', 'order', orderId],
    queryFn: () => wishAdapter.fetchOrderWishes(orderId),
  })
}

export function useCreateWishMutation() {
  return useMutation({
    mutationFn: (payload: CreateWishPayload) => wishAdapter.createWish(payload),
  })
}
