import { z } from 'zod'

export type WishStatus = 'submitted' | 'in_basket' | 'validated' | 'refused' | 'paid' | 'picked_up'

export const wishSchema = z.object({
  id: z.string(),
  gameName: z.string(),
  philibertReference: z.string(),
  philibertUrl: z.string().nullable(),
  status: z.enum(['submitted', 'in_basket', 'validated', 'refused', 'paid', 'picked_up']),
  unitPrice: z.number().nullable(),
  shippingShare: z.number().nullable(),
  customsShare: z.number().nullable(),
  amountDue: z.number().nullable(),
  userId: z.string(),
  orderId: z.string(),
  basketId: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Wish = z.infer<typeof wishSchema>

export const WISH_STATUS_LABELS: Record<WishStatus, string> = {
  submitted: 'Soumis',
  in_basket: 'Dans le panier',
  validated: 'Validé',
  refused: 'Refusé',
  paid: 'Payé',
  picked_up: 'Récupéré',
}
