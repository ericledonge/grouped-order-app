import { useOrder } from '@/features/orders/domain/order.repository'
import { useOrderWishes } from '@/features/wishes/domain/wish.repository'

export function useOrderDetail(orderId: string) {
  const { data: order, isPending: orderPending, error: orderError } = useOrder(orderId)
  const { data: wishes, isPending: wishesPending } = useOrderWishes(orderId)

  return {
    order: order ?? null,
    wishes: wishes ?? [],
    isPending: orderPending || wishesPending,
    error: orderError?.message ?? null,
  }
}
