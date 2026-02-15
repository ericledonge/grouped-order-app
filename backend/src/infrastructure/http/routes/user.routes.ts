import { Hono } from "hono";
import type { AppEnv } from "../../auth/auth.middleware.js";
import { requireAdmin } from "../../auth/auth.middleware.js";

interface UserUseCases {
  listUsers: () => Promise<{ id: string; name: string; email: string }[]>;
}

export function createUserRoutes(useCases: UserUseCases) {
  const routes = new Hono<AppEnv>();

  routes.get("/", requireAdmin, async (c) => {
    const users = await useCases.listUsers();
    return c.json(users);
  });

  return routes;
}
