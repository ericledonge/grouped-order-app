import dayjs from 'dayjs'
import { z } from 'zod'

export const createOrderSchema = z.object({
  type: z.enum(['monthly', 'private_sale', 'special'], {
    error: 'Le type de commande est requis',
  }),
  targetDate: z.string().min(1, 'La date cible est requise').refine(
    (val) => dayjs(val).isAfter(dayjs().subtract(1, 'day'), 'day'),
    { message: 'La date cible doit être dans le futur' },
  ),
  description: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>

export function validateCreateOrderInput(input: unknown) {
  return createOrderSchema.safeParse(input)
}
