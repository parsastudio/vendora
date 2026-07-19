import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { users } from "./users";

export const workflowSettings = pgTable("workflow_settings", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  triggerEvent: text("trigger_event").notNull(),
  actions: jsonb("actions")
    .$type<
      {
        type: string;
        config: Record<string, string>;
      }[]
    >()
    .notNull(),
  isActive: text("is_active").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  details: jsonb("details").$type<Record<string, string[]>>(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type WorkflowSetting = typeof workflowSettings.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
