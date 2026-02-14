import { Hono } from "hono";
import type { Auth } from "../../auth/auth.js";

export function createAuthRoutes(auth: Auth) {
  const routes = new Hono();

  routes.all("/*", (c) => {
    return auth.handler(c.req.raw);
  });

  return routes;
}
