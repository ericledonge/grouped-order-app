import type { WishStatus } from '@/features/wishes/domain/wish.types'

export const WISH_STATUS_VARIANT: Record<
  WishStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  submitted: 'default',
  in_basket: 'secondary',
  validated: 'default',
  refused: 'destructive',
  paid: 'outline',
  picked_up: 'outline',
}
