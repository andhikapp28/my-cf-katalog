import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["ADMIN"]);
export const productStatusEnum = pgEnum("product_status", [
  "TARGET",
  "PO_OPEN",
  "PO_DONE",
  "PURCHASED",
  "CANCELLED",
  "SOLD_OUT"
]);
export const priorityEnum = pgEnum("priority", ["HIGH", "MEDIUM", "LOW"]);
export const purchaseTypeEnum = pgEnum("purchase_type", ["PO", "ON_THE_SPOT"]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "CASH",
  "QRIS",
  "CARD",
  "BANK_TRANSFER",
  "E_WALLET",
  "OTHER"
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull().default("ADMIN"),
    ...timestamps
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    description: text("description"),
    venue: varchar("venue", { length: 180 }),
    bannerImageUrl: text("banner_image_url"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    budget: integer("budget").notNull().default(0),
    isActive: boolean("is_active").notNull().default(false),
    ...timestamps
  },
  (table) => [
    uniqueIndex("events_slug_unique").on(table.slug),
    index("events_active_idx").on(table.isActive)
  ]
);

export const circles = pgTable(
  "circles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 160 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    socialLink: text("social_link"),
    notes: text("notes"),
    ...timestamps
  },
  (table) => [
    uniqueIndex("circles_slug_unique").on(table.slug),
    index("circles_name_idx").on(table.name)
  ]
);

export const floorMaps = pgTable(
  "floor_maps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 160 }).notNull(),
    imageUrl: text("image_url").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    ...timestamps
  },
  (table) => [index("floor_maps_event_idx").on(table.eventId)]
);

export const boothLocations = pgTable(
  "booth_locations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    circleId: uuid("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "cascade" }),
    floorMapId: uuid("floor_map_id")
      .notNull()
      .references(() => floorMaps.id, { onDelete: "cascade" }),
    boothCode: varchar("booth_code", { length: 32 }).notNull(),
    posX: integer("pos_x").notNull(),
    posY: integer("pos_y").notNull(),
    notes: text("notes"),
    ...timestamps
  },
  (table) => [
    index("booth_locations_event_idx").on(table.eventId),
    index("booth_locations_circle_idx").on(table.circleId),
    uniqueIndex("booth_locations_event_circle_booth_unique").on(
      table.eventId,
      table.circleId,
      table.boothCode
    )
  ]
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    circleId: uuid("circle_id")
      .notNull()
      .references(() => circles.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 200 }).notNull(),
    imageUrl: text("image_url"),
    price: integer("price").notNull().default(0),
    poDeadline: date("po_deadline"),
    productLink: text("product_link"),
    status: productStatusEnum("status").notNull().default("TARGET"),
    priority: priorityEnum("priority").notNull().default("MEDIUM"),
    quantity: integer("quantity").notNull().default(1),
    notes: text("notes"),
    purchaseType: purchaseTypeEnum("purchase_type").notNull().default("ON_THE_SPOT"),
    ...timestamps
  },
  (table) => [
    index("products_event_idx").on(table.eventId),
    index("products_circle_idx").on(table.circleId),
    index("products_status_idx").on(table.status),
    index("products_priority_idx").on(table.priority),
    index("products_deadline_idx").on(table.poDeadline)
  ]
);

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    color: varchar("color", { length: 16 }).notNull().default("#D46A3A"),
    ...timestamps
  },
  (table) => [uniqueIndex("expense_categories_slug_unique").on(table.slug)]
);

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => expenseCategories.id, { onDelete: "restrict" }),
    amount: integer("amount").notNull(),
    expenseDate: date("expense_date").notNull(),
    note: text("note"),
    paymentMethod: paymentMethodEnum("payment_method").notNull().default("CASH"),
    isPlanned: boolean("is_planned").notNull().default(false),
    isActual: boolean("is_actual").notNull().default(true),
    ...timestamps
  },
  (table) => [
    index("expenses_event_idx").on(table.eventId),
    index("expenses_category_idx").on(table.categoryId),
    index("expenses_product_idx").on(table.productId),
    index("expenses_date_idx").on(table.expenseDate)
  ]
);

export const productStatusLogs = pgTable(
  "product_status_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    fromStatus: productStatusEnum("from_status"),
    toStatus: productStatusEnum("to_status").notNull(),
    note: text("note"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index("product_status_logs_product_idx").on(table.productId, table.createdAt)]
);

export const usersRelations = relations(users, ({ many }) => ({
  statusLogs: many(productStatusLogs)
}));

export const eventsRelations = relations(events, ({ many }) => ({
  floorMaps: many(floorMaps),
  boothLocations: many(boothLocations),
  products: many(products),
  expenses: many(expenses)
}));

export const circlesRelations = relations(circles, ({ many }) => ({
  boothLocations: many(boothLocations),
  products: many(products)
}));

export const floorMapsRelations = relations(floorMaps, ({ one, many }) => ({
  event: one(events, {
    fields: [floorMaps.eventId],
    references: [events.id]
  }),
  boothLocations: many(boothLocations)
}));

export const boothLocationsRelations = relations(boothLocations, ({ one }) => ({
  event: one(events, {
    fields: [boothLocations.eventId],
    references: [events.id]
  }),
  circle: one(circles, {
    fields: [boothLocations.circleId],
    references: [circles.id]
  }),
  floorMap: one(floorMaps, {
    fields: [boothLocations.floorMapId],
    references: [floorMaps.id]
  })
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  event: one(events, {
    fields: [products.eventId],
    references: [events.id]
  }),
  circle: one(circles, {
    fields: [products.circleId],
    references: [circles.id]
  }),
  expenses: many(expenses),
  statusLogs: many(productStatusLogs)
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses)
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  event: one(events, {
    fields: [expenses.eventId],
    references: [events.id]
  }),
  product: one(products, {
    fields: [expenses.productId],
    references: [products.id]
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id]
  })
}));

export const productStatusLogsRelations = relations(productStatusLogs, ({ one }) => ({
  product: one(products, {
    fields: [productStatusLogs.productId],
    references: [products.id]
  }),
  createdByUser: one(users, {
    fields: [productStatusLogs.createdBy],
    references: [users.id]
  })
}));

export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Circle = typeof circles.$inferSelect;
export type FloorMap = typeof floorMaps.$inferSelect;
export type BoothLocation = typeof boothLocations.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
