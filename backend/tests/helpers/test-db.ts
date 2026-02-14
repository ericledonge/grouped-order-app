import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import * as schema from "../../src/infrastructure/db/schema.js";

export function createTestDatabase() {
  const client = createClient({ url: ":memory:" });
  const db = drizzle(client, { schema });
  return { db, client };
}

export async function applySchema(db: ReturnType<typeof drizzle>) {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      role TEXT,
      banned INTEGER DEFAULT 0,
      ban_reason TEXT,
      ban_expires INTEGER
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      impersonated_by TEXT
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS session_userId_idx ON session(user_id)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS session_token_idx ON session(token)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      password TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer))
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS account_userId_idx ON account(user_id)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer))
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS "order" (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      target_date INTEGER NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      created_by TEXT NOT NULL REFERENCES user(id),
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer))
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS order_createdBy_idx ON "order"(created_by)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS basket (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      shipping_cost REAL,
      customs_cost REAL,
      order_id TEXT NOT NULL REFERENCES "order"(id),
      created_by TEXT NOT NULL REFERENCES user(id),
      received_at INTEGER,
      available_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer))
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS basket_orderId_idx ON basket(order_id)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS basket_createdBy_idx ON basket(created_by)`);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS deposit_point (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer))
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS wish (
      id TEXT PRIMARY KEY,
      game_name TEXT NOT NULL,
      philibert_reference TEXT NOT NULL,
      philibert_url TEXT,
      status TEXT NOT NULL DEFAULT 'submitted',
      unit_price REAL,
      shipping_share REAL,
      customs_share REAL,
      amount_due REAL,
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_sent_at INTEGER,
      payment_received_at INTEGER,
      amount_paid REAL,
      picked_up_at INTEGER,
      user_id TEXT NOT NULL REFERENCES user(id),
      order_id TEXT NOT NULL REFERENCES "order"(id),
      basket_id TEXT REFERENCES basket(id),
      deposit_point_id TEXT REFERENCES deposit_point(id),
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch() * 1000 as integer))
    )
  `);
  await db.run(sql`CREATE INDEX IF NOT EXISTS wish_userId_idx ON wish(user_id)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS wish_orderId_idx ON wish(order_id)`);
  await db.run(sql`CREATE INDEX IF NOT EXISTS wish_basketId_idx ON wish(basket_id)`);
}
