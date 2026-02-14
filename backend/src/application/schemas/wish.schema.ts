import { z } from "zod";

export const createWishSchema = z.object({
  orderId: z.string().min(1),
  gameName: z.string().min(1, "Le nom du jeu est requis"),
  philibertReference: z.string().min(1, "La référence Philibert est requise"),
  philibertUrl: z.string().url().optional().or(z.literal("")),
});

export type CreateWishInput = z.infer<typeof createWishSchema>;
