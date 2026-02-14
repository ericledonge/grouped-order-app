import { Hono } from "hono";
import { cors } from "hono/cors";
import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "./infrastructure/auth/auth.middleware.js";
import type { Database } from "./infrastructure/db/index.js";

// Repositories
import { createDrizzleOrderRepository } from "./infrastructure/repositories/drizzle-order.repository.js";
import { createDrizzleWishRepository } from "./infrastructure/repositories/drizzle-wish.repository.js";
import { createDrizzleBasketRepository } from "./infrastructure/repositories/drizzle-basket.repository.js";

// Use Cases
import { createOrderUseCase } from "./application/use-cases/order/create-order.use-case.js";
import { listOrdersUseCase } from "./application/use-cases/order/list-orders.use-case.js";
import { getOrderUseCase } from "./application/use-cases/order/get-order.use-case.js";
import { createWishUseCase } from "./application/use-cases/wish/create-wish.use-case.js";
import { listUserWishesUseCase } from "./application/use-cases/wish/list-user-wishes.use-case.js";
import { listOrderWishesUseCase } from "./application/use-cases/wish/list-order-wishes.use-case.js";
import { createBasketUseCase } from "./application/use-cases/basket/create-basket.use-case.js";
import { listOrderBasketsUseCase } from "./application/use-cases/basket/list-order-baskets.use-case.js";
import { getBasketUseCase } from "./application/use-cases/basket/get-basket.use-case.js";

// Routes
import { createOrderRoutes } from "./infrastructure/http/routes/order.routes.js";
import { createWishRoutes } from "./infrastructure/http/routes/wish.routes.js";
import { createBasketRoutes } from "./infrastructure/http/routes/basket.routes.js";

export interface AppDependencies {
  db: Database;
  sessionMiddleware: MiddlewareHandler<AppEnv>;
  authRouteHandler: Hono;
  corsOrigins: string[];
}

export function createApp(deps: AppDependencies) {
  const { db, sessionMiddleware, authRouteHandler, corsOrigins } = deps;

  // 1. Repositories
  const orderRepo = createDrizzleOrderRepository(db);
  const wishRepo = createDrizzleWishRepository(db);
  const basketRepo = createDrizzleBasketRepository(db);

  // 2. Use Cases
  const orderUseCases = {
    createOrder: createOrderUseCase(orderRepo),
    listOrders: listOrdersUseCase(orderRepo),
    getOrder: getOrderUseCase(orderRepo),
  };

  const wishUseCases = {
    createWish: createWishUseCase(wishRepo, orderRepo),
    listUserWishes: listUserWishesUseCase(wishRepo),
    listOrderWishes: listOrderWishesUseCase(wishRepo),
  };

  const basketUseCases = {
    createBasket: createBasketUseCase(basketRepo),
    listOrderBaskets: listOrderBasketsUseCase(basketRepo),
    getBasket: getBasketUseCase(basketRepo),
  };

  // 3. App
  const app = new Hono<AppEnv>();

  app.use(
    "/api/*",
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );

  app.use("/api/*", sessionMiddleware);

  app.route("/api/auth", authRouteHandler);
  app.route("/api/orders", createOrderRoutes(orderUseCases));
  app.route("/api/wishes", createWishRoutes(wishUseCases));
  app.route("/api/baskets", createBasketRoutes(basketUseCases));

  app.get("/", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/health", (c) => {
    return c.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}
