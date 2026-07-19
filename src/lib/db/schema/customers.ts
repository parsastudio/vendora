import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const customers = pgTable("customers", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
