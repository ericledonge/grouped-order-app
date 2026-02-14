import { z } from 'zod'

export type OrderType = 'monthly' | 'private_sale' | 'special'
export type OrderStatus = 'open' | 'in_progress' | 'completed'

export const orderSchema = z.object({
  id: z.string(),
  type: z.enum(['monthly', 'private_sale', 'special']),
  targetDate: z.string(),
  description: z.string().nullable(),
  status: z.enum(['open', 'in_progress', 'completed']),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Order = z.infer<typeof orderSchema>

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  monthly: 'Mensuelle',
  private_sale: 'Vente privée',
  special: 'Spéciale',
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  open: 'Ouverte',
  in_progress: 'En cours',
  completed: 'Terminée',
}
