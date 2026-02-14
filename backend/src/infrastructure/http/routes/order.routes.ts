import { Hono } from "hono";
import type { AppEnv } from "../../auth/auth.middleware.js";
import { requireAuth, requireAdmin } from "../../auth/auth.middleware.js";
import {
  createOrderSchema,
  type CreateOrderInput,
} from "../../../application/schemas/order.schema.js";
import type { Order, OrderStatus } from "../../../domain/entities/order.entity.js";

interface OrderUseCases {
  listOrders: (status?: OrderStatus) => Promise<Order[]>;
  getOrder: (id: string) => Promise<Order | undefined>;
  createOrder: (input: CreateOrderInput, userId: string) => Promise<Order>;
}

export function createOrderRoutes(useCases: OrderUseCases) {
  const routes = new Hono<AppEnv>();

  routes.get("/", requireAuth, async (c) => {
    const status = c.req.query("status") as OrderStatus | undefined;
    const orders = await useCases.listOrders(status);
    return c.json(orders);
  });

  routes.get("/:id", requireAuth, async (c) => {
    const order = await useCases.getOrder(c.req.param("id"));
    if (!order) {
      return c.json({ error: "Commande introuvable" }, 404);
    }
    return c.json(order);
  });

  routes.post("/", requireAdmin, async (c) => {
    const body = await c.req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: parsed.error.flatten() }, 400);
    }

    const user = c.get("user");
    const order = await useCases.createOrder(parsed.data, user.id);
    return c.json(order, 201);
  });

  return routes;
}
