import { Hono } from "hono";
import type { AppEnv } from "../../auth/auth.middleware.js";
import { requireAuth } from "../../auth/auth.middleware.js";
import {
  createWishSchema,
  type CreateWishInput,
} from "../../../application/schemas/wish.schema.js";
import type { Wish } from "../../../domain/entities/wish.entity.js";

interface WishUseCases {
  listUserWishes: (userId: string) => Promise<Wish[]>;
  listOrderWishes: (orderId: string) => Promise<Wish[]>;
  createWish: (input: CreateWishInput, userId: string) => Promise<Wish>;
}

export function createWishRoutes(useCases: WishUseCases) {
  const routes = new Hono<AppEnv>();

  routes.get("/mine", requireAuth, async (c) => {
    const user = c.get("user");
    const wishes = await useCases.listUserWishes(user.id);
    return c.json(wishes);
  });

  routes.get("/order/:orderId", requireAuth, async (c) => {
    const wishes = await useCases.listOrderWishes(c.req.param("orderId"));
    return c.json(wishes);
  });

  routes.post("/", requireAuth, async (c) => {
    const body = await c.req.json();
    const parsed = createWishSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const user = c.get("user");
    try {
      const wish = await useCases.createWish(parsed.data, user.id);
      return c.json(wish, 201);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur interne";
      return c.json({ error: message }, 400);
    }
  });

  return routes;
}
