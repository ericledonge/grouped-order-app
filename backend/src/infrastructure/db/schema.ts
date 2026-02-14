import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).default(false).notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: integer("banned", { mode: "boolean" }).default(false),
  banReason: text("ban_reason"),
  banExpires: integer("ban_expires", { mode: "timestamp_ms" }),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ─── Business Tables ────────────────────────────────────────────────

export const order = sqliteTable(
  "order",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    type: text("type", { enum: ["monthly", "private_sale", "special"] }).notNull(),
    targetDate: integer("target_date", { mode: "timestamp_ms" }).notNull(),
    description: text("description"),
    status: text("status", {
      enum: ["open", "in_progress", "completed"],
    })
      .notNull()
      .default("open"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("order_createdBy_idx").on(table.createdBy)],
);

export const basket = sqliteTable(
  "basket",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    status: text("status", {
      enum: [
        "draft",
        "awaiting_validation",
        "validated",
        "awaiting_customs",
        "awaiting_reception",
        "awaiting_delivery",
        "available_pickup",
      ],
    })
      .notNull()
      .default("draft"),
    shippingCost: real("shipping_cost"),
    customsCost: real("customs_cost"),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    receivedAt: integer("received_at", { mode: "timestamp_ms" }),
    availableAt: integer("available_at", { mode: "timestamp_ms" }),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("basket_orderId_idx").on(table.orderId),
    index("basket_createdBy_idx").on(table.createdBy),
  ],
);

export const depositPoint = sqliteTable("deposit_point", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  address: text("address").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const wish = sqliteTable(
  "wish",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    gameName: text("game_name").notNull(),
    philibertReference: text("philibert_reference").notNull(),
    philibertUrl: text("philibert_url"),
    status: text("status", {
      enum: ["submitted", "in_basket", "validated", "refused", "paid", "picked_up"],
    })
      .notNull()
      .default("submitted"),
    unitPrice: real("unit_price"),
    shippingShare: real("shipping_share"),
    customsShare: real("customs_share"),
    amountDue: real("amount_due"),
    paymentStatus: text("payment_status", {
      enum: ["pending", "sent", "received", "partial"],
    })
      .notNull()
      .default("pending"),
    paymentSentAt: integer("payment_sent_at", { mode: "timestamp_ms" }),
    paymentReceivedAt: integer("payment_received_at", { mode: "timestamp_ms" }),
    amountPaid: real("amount_paid"),
    pickedUpAt: integer("picked_up_at", { mode: "timestamp_ms" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id),
    basketId: text("basket_id").references(() => basket.id),
    depositPointId: text("deposit_point_id").references(() => depositPoint.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("wish_userId_idx").on(table.userId),
    index("wish_orderId_idx").on(table.orderId),
    index("wish_basketId_idx").on(table.basketId),
  ],
);

// ─── Business Relations ─────────────────────────────────────────────

export const orderRelations = relations(order, ({ one, many }) => ({
  creator: one(user, {
    fields: [order.createdBy],
    references: [user.id],
  }),
  wishes: many(wish),
  baskets: many(basket),
}));

export const basketRelations = relations(basket, ({ one, many }) => ({
  order: one(order, {
    fields: [basket.orderId],
    references: [order.id],
  }),
  creator: one(user, {
    fields: [basket.createdBy],
    references: [user.id],
  }),
  wishes: many(wish),
}));

export const wishRelations = relations(wish, ({ one }) => ({
  user: one(user, {
    fields: [wish.userId],
    references: [user.id],
  }),
  order: one(order, {
    fields: [wish.orderId],
    references: [order.id],
  }),
  basket: one(basket, {
    fields: [wish.basketId],
    references: [basket.id],
  }),
  depositPoint: one(depositPoint, {
    fields: [wish.depositPointId],
    references: [depositPoint.id],
  }),
}));

export const depositPointRelations = relations(depositPoint, ({ many }) => ({
  wishes: many(wish),
}));
