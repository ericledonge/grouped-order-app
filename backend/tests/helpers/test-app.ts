import { createTestDatabase, applySchema } from "./test-db.js";
import { createAuth } from "../../src/infrastructure/auth/auth.js";
import { createSessionMiddleware } from "../../src/infrastructure/auth/auth.middleware.js";
import { createAuthRoutes } from "../../src/infrastructure/http/routes/auth.routes.js";
import { createApp } from "../../src/app.js";

export async function createTestApp() {
  const { db, client } = createTestDatabase();
  await applySchema(db);

  const auth = createAuth(db, {
    trustedOrigins: ["http://localhost:5173"],
    secret: "test-secret-at-least-32-characters-long!!",
    baseURL: "http://localhost:3000",
  });

  const app = createApp({
    db,
    sessionMiddleware: createSessionMiddleware(auth),
    authRouteHandler: createAuthRoutes(auth),
    corsOrigins: ["http://localhost:5173"],
  });

  return { app, db, auth, client };
}

export type TestApp = Awaited<ReturnType<typeof createTestApp>>;
