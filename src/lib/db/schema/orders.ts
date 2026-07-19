import { pgTable, text, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { productVariants } from "./products";
import { customers } from "./customers";

export const carts = pgTable("carts", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: text("id").primaryKey(),
  cartId: text("cart_id")
    .references(() => carts.id, { onDelete: "cascade" })
    .notNull(),
  variantId: text("variant_id")
    .references(() => productVariants.id, { onDelete: "cascade" })
    .notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const discounts = pgTable("discounts", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  code: text("code").unique(),
  type: text("type").notNull(),
  value: numeric("value", { precision: 12, scale: 2 }).notNull(),
  minPurchaseAmount: numeric("min_purchase_amount", { precision: 12, scale: 2 }),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),
  startsAt: timestamp("starts_at"),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  customerId: text("customer_id").references(() => customers.id, { onDelete: "set null" }),
  status: text("status").default("pending").notNull(),
  paymentStatus: text("payment_status").default("unpaid").notNull(),
  shippingAddress: jsonb("shipping_address")
    .$type<{
      name: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>()
    .notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  subtotalAmount: numeric("subtotal_amount", { precision: 12, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  shippingAmount: numeric("shipping_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).default("0.00").notNull(),
  trackingCode: text("tracking_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  variantId: text("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id")
    .references(() => tenants.id, { onDelete: "cascade" })
    .notNull(),
  orderId: text("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  provider: text("provider").notNull(),
  referenceId: text("reference_id"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Discount = typeof discounts.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
