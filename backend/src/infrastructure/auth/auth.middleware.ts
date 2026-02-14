import type { MiddlewareHandler } from "hono";
import type { Auth } from "./auth.js";

export type AppEnv = {
  Variables: {
    user: { id: string; name: string; email: string; role: string | null; [key: string]: unknown };
    session: { id: string; [key: string]: unknown };
  };
};

export function createSessionMiddleware(auth: Auth): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (session) {
      c.set("user", session.user as AppEnv["Variables"]["user"]);
      c.set("session", session.session as AppEnv["Variables"]["session"]);
    }

    await next();
  };
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Non authentifié" }, 401);
  }
  await next();
};

export const requireAdmin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Non authentifié" }, 401);
  }
  if (user.role !== "admin") {
    return c.json({ error: "Accès réservé aux administrateurs" }, 403);
  }
  await next();
};
