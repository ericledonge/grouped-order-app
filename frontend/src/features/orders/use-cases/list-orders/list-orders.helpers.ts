import type { OrderStatus } from '@/features/orders/domain/order.types'

export const STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline'
> = {
  open: 'default',
  in_progress: 'secondary',
  completed: 'outline',
}
