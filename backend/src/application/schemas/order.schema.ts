import { z } from "zod";

export const createOrderSchema = z.object({
  type: z.enum(["monthly", "private_sale", "special"]),
  targetDate: z.coerce.date().refine((date) => date > new Date(), {
    message: "La date cible doit être dans le futur",
  }),
  description: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
