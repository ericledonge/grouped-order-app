import { z } from "zod";

export const createBasketSchema = z.object({
  orderId: z.string().min(1),
  name: z.string().optional(),
  wishIds: z.array(z.string().min(1)).min(1, "Le panier doit contenir au moins un souhait"),
});

export const editBasketSchema = z.object({
  shippingCost: z.coerce.number().positive("Les frais de port doivent être positifs"),
  wishes: z.array(
    z.object({
      id: z.string().min(1),
      unitPrice: z.coerce.number().positive("Le prix doit être positif"),
    }),
  ),
});

export type CreateBasketInput = z.infer<typeof createBasketSchema>;
export type EditBasketInput = z.infer<typeof editBasketSchema>;
