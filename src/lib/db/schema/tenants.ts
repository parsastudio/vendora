import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  customDomain: text("custom_domain").unique(),
  logoUrl: text("logo_url"),
  themeSettings: jsonb("theme_settings")
    .$type<{
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
    }>()
    .default({
      primaryColor: "#18181b",
      secondaryColor: "#f4f4f5",
      fontFamily: "Geist",
    })
    .notNull(),
  subscriptionStatus: text("subscription_status").default("trial").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
