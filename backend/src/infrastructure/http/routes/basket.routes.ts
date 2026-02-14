import { Hono } from "hono";
import type { AppEnv } from "../../auth/auth.middleware.js";
import { requireAuth, requireAdmin } from "../../auth/auth.middleware.js";
import {
  createBasketSchema,
  type CreateBasketInput,
} from "../../../application/schemas/basket.schema.js";
import type { Basket } from "../../../domain/entities/basket.entity.js";

interface BasketUseCases {
  listOrderBaskets: (orderId: string) => Promise<Basket[]>;
  getBasket: (id: string) => Promise<Basket | undefined>;
  createBasket: (input: CreateBasketInput, userId: string) => Promise<Basket>;
}

export function createBasketRoutes(useCases: BasketUseCases) {
  const routes = new Hono<AppEnv>();

  routes.get("/order/:orderId", requireAuth, async (c) => {
    const baskets = await useCases.listOrderBaskets(c.req.param("orderId"));
    return c.json(baskets);
  });

  routes.get("/:id", requireAuth, async (c) => {
    const basket = await useCases.getBasket(c.req.param("id"));
    if (!basket) {
      return c.json({ error: "Panier introuvable" }, 404);
    }
    return c.json(basket);
  });

  routes.post("/", requireAdmin, async (c) => {
    const body = await c.req.json();
    const parsed = createBasketSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const user = c.get("user");
    const basket = await useCases.createBasket(parsed.data, user.id);
    return c.json(basket, 201);
  });

  return routes;
}
