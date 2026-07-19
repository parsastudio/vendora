import { pgTable, text, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: timestamp("two_factor_enabled"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const roles = pgTable("roles", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: text("id").primaryKey(),
  action: text("action").notNull().unique(),
});

export const usersToRoles = pgTable(
  "users_to_roles",
  {
    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    roleId: text("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const rolesToPermissions = pgTable(
  "roles_to_permissions",
  {
    roleId: text("role_id")
      .references(() => roles.id, { onDelete: "cascade" })
      .notNull(),
    permissionId: text("permission_id")
      .references(() => permissions.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
