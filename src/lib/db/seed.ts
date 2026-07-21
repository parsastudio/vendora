import { db } from "./index";
import { tenants } from "./schema/tenants";
import { categories, products, productVariants, warehouses, inventory } from "./schema/products";
import { users, roles, permissions, rolesToPermissions, usersToRoles } from "./schema/users";
import { customers } from "./schema/customers";
import { orders, orderItems, transactions, shippingRates } from "./schema/orders";
import { generateDemoCustomers, generateDemoData } from "./demo-generator";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    TRUNCATE TABLE 
      "api_keys", "audit_logs", "workflow_settings", 
      "transactions", "order_items", "order_returns", "orders", 
      "shipping_rates", "discounts", "cart_items", "carts", 
      "inventory", "product_variants", "products", "categories", "warehouses", 
      "users_to_roles", "roles_to_permissions", "users", "roles", "permissions", 
      "customers", "tenants" 
    RESTART IDENTITY CASCADE;
  `);

  await db.insert(tenants).values([
    {
      id: "tenant-nike",
      name: "Nike Store",
      subdomain: "nike",
      customDomain: "nike.local",
      themeSettings: {
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        fontFamily: "Geist",
      },
      subscriptionStatus: "active",
    },
    {
      id: "tenant-apple",
      name: "Apple Shop",
      subdomain: "apple",
      customDomain: "apple.local",
      themeSettings: {
        primaryColor: "#1a1a1a",
        secondaryColor: "#f5f5f7",
        fontFamily: "Geist_Mono",
      },
      subscriptionStatus: "active",
    },
    {
      id: "tenant-demo",
      name: "Vendora Demo Store",
      subdomain: "demo",
      customDomain: null,
      themeSettings: {
        primaryColor: "#0f172a",
        secondaryColor: "#f8fafc",
        fontFamily: "Geist",
      },
      subscriptionStatus: "active",
    },
  ]);

  await db.insert(permissions).values([
    { id: "p1", action: "products:read" },
    { id: "p2", action: "products:write" },
    { id: "p3", action: "orders:read" },
    { id: "p4", action: "settings:write" },
  ]);

  await db.insert(roles).values([
    { id: "role-admin-nike", tenantId: "tenant-nike", name: "Admin" },
    { id: "role-admin-apple", tenantId: "tenant-apple", name: "Admin" },
    { id: "role-admin-demo", tenantId: "tenant-demo", name: "Administrator" },
  ]);

  await db.insert(rolesToPermissions).values([
    { roleId: "role-admin-nike", permissionId: "p1" },
    { roleId: "role-admin-nike", permissionId: "p2" },
    { roleId: "role-admin-nike", permissionId: "p3" },
    { roleId: "role-admin-nike", permissionId: "p4" },
    { roleId: "role-admin-apple", permissionId: "p1" },
    { roleId: "role-admin-apple", permissionId: "p2" },
    { roleId: "role-admin-demo", permissionId: "p1" },
    { roleId: "role-admin-demo", permissionId: "p2" },
    { roleId: "role-admin-demo", permissionId: "p3" },
    { roleId: "role-admin-demo", permissionId: "p4" },
  ]);

  await db.insert(users).values([
    {
      id: "user-nike-1",
      tenantId: "tenant-nike",
      email: "nike@admin.com",
      passwordHash: "$2a$10$X78B8KsmI9Hh6YpZJ7b5duN/wS0vE6o5.D9pL9g6N2v/I0pC8F8Gq",
      name: "Nike Admin",
    },
    {
      id: "user-apple-1",
      tenantId: "tenant-apple",
      email: "apple@admin.com",
      passwordHash: "$2a$10$X78B8KsmI9Hh6YpZJ7b5duN/wS0vE6o5.D9pL9g6N2v/I0pC8F8Gq",
      name: "Apple Admin",
    },
    {
      id: "user-demo-1",
      tenantId: "tenant-demo",
      email: "demo@vendora.com",
      passwordHash: "$2a$10$X78B8KsmI9Hh6YpZJ7b5duN/wS0vE6o5.D9pL9g6N2v/I0pC8F8Gq",
      name: "Demo Admin",
    },
  ]);

  await db.insert(usersToRoles).values([
    { userId: "user-nike-1", roleId: "role-admin-nike" },
    { userId: "user-apple-1", roleId: "role-admin-apple" },
    { userId: "user-demo-1", roleId: "role-admin-demo" },
  ]);

  await db.insert(categories).values([
    { id: "cat-nike-shoes", tenantId: "tenant-nike", parentId: null, name: "Shoes", slug: "shoes" },
    {
      id: "cat-apple-devices",
      tenantId: "tenant-apple",
      parentId: null,
      name: "Devices",
      slug: "devices",
    },
    { id: "cat-demo-audio", tenantId: "tenant-demo", parentId: null, name: "Audio", slug: "audio" },
    {
      id: "cat-demo-computers",
      tenantId: "tenant-demo",
      parentId: null,
      name: "Computers",
      slug: "computers",
    },
  ]);

  await db.insert(products).values([
    {
      id: "prod-nike-1",
      tenantId: "tenant-nike",
      categoryId: "cat-nike-shoes",
      name: "Air Max Pro",
      slug: "air-max-pro",
      description: "High performance running shoes.",
      status: "active",
    },
    {
      id: "prod-apple-1",
      tenantId: "tenant-apple",
      categoryId: "cat-apple-devices",
      name: "iPhone 18",
      slug: "iphone-18",
      description: "The latest smartphone technology.",
      status: "active",
    },
    {
      id: "prod-demo-1",
      tenantId: "tenant-demo",
      categoryId: "cat-demo-audio",
      name: "Zenith Wireless Headphones",
      slug: "zenith-headphones",
      description: "Premium noise cancelling acoustic audio.",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      status: "active",
    },
    {
      id: "prod-demo-2",
      tenantId: "tenant-demo",
      categoryId: "cat-demo-computers",
      name: "Apex Mechanical Keyboard",
      slug: "apex-keyboard",
      description: "Ultra-fast response tactile switches.",
      imageUrl:
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=80",
      status: "active",
    },
  ]);

  await db.insert(productVariants).values([
    {
      id: "var-nike-1-black",
      productId: "prod-nike-1",
      sku: "NIKE-AM-BLK",
      price: "180.00",
      compareAtPrice: "220.00",
      attributes: { color: "black", size: "10" },
    },
    {
      id: "var-apple-1-256",
      productId: "prod-apple-1",
      sku: "APL-IP18-256",
      price: "999.00",
      compareAtPrice: null,
      attributes: { storage: "256GB", color: "Titanium" },
    },
    {
      id: "var-demo-1-acoustic",
      productId: "prod-demo-1",
      sku: "VEN-ZEN-ACU",
      price: "299.00",
      compareAtPrice: "349.00",
      attributes: { color: "black", type: "acoustic" },
    },
    {
      id: "var-demo-2-tactile",
      productId: "prod-demo-2",
      sku: "VEN-APX-TAC",
      price: "149.00",
      compareAtPrice: "179.00",
      attributes: { switches: "brown", layout: "tenkeyless" },
    },
  ]);

  await db.insert(warehouses).values([
    {
      id: "wh-demo-1",
      tenantId: "tenant-demo",
      name: "Silicon Valley Hub",
      location: "San Jose, CA",
    },
  ]);

  await db.insert(inventory).values([
    { id: "inv-demo-1", variantId: "var-demo-1-acoustic", warehouseId: "wh-demo-1", quantity: 8 },
    { id: "inv-demo-2", variantId: "var-demo-2-tactile", warehouseId: "wh-demo-1", quantity: 15 },
  ]);

  await db.insert(shippingRates).values([
    {
      id: "ship-demo-std",
      tenantId: "tenant-demo",
      name: "Standard Ground Shipping",
      price: "10.00",
      minOrderAmount: null,
    },
    {
      id: "ship-demo-exp",
      tenantId: "tenant-demo",
      name: "Express Courier Shipping",
      price: "25.00",
      minOrderAmount: null,
    },
  ]);

  const demoCusts = generateDemoCustomers("tenant-demo");
  for (const c of demoCusts) {
    await db.insert(customers).values(c);
  }

  const { ordersList, itemsList, txnsList } = generateDemoData("tenant-demo", demoCusts, [
    { id: "var-demo-1-acoustic", price: "299.00" },
    { id: "var-demo-2-tactile", price: "149.00" },
  ]);

  for (const o of ordersList) {
    await db.insert(orders).values(o);
  }
  for (const oi of itemsList) {
    await db.insert(orderItems).values(oi);
  }
  for (const tx of txnsList) {
    await db.insert(transactions).values(tx);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
