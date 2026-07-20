import { db } from "./index";
import { tenants } from "./schema/tenants";
import { categories, products, productVariants, warehouses, inventory } from "./schema/products";
import { users, roles, permissions, rolesToPermissions, usersToRoles } from "./schema/users";
import { orders, orderItems, transactions } from "./schema/orders";

async function main() {
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
  ]);

  await db
    .insert(warehouses)
    .values([
      {
        id: "wh-demo-1",
        tenantId: "tenant-demo",
        name: "Silicon Valley Hub",
        location: "San Jose, CA",
      },
    ]);

  await db
    .insert(inventory)
    .values([
      { id: "inv-demo-1", variantId: "var-demo-1-acoustic", warehouseId: "wh-demo-1", quantity: 8 },
    ]);

  const demoOrders = [];
  const demoOrderItems = [];
  const demoTxns = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  for (let i = 0; i < 110; i++) {
    const orderId = `ord-demo-${i}`;
    const daysAgo = Math.floor(Math.random() * 300) + 1;
    const createdAt = new Date(now - daysAgo * oneDay);

    const price = 299.0;
    const tax = (price * 0.05).toFixed(2);
    const shipping = "10.00";
    const total = (price + parseFloat(tax) + parseFloat(shipping)).toFixed(2);

    demoOrders.push({
      id: orderId,
      tenantId: "tenant-demo",
      customerId: null,
      status: "delivered",
      paymentStatus: "paid",
      shippingAddress: {
        name: "Jessica Demo",
        line1: "456 Demo Avenue",
        city: "San Francisco",
        state: "CA",
        postalCode: "94103",
        country: "US",
      },
      totalAmount: total,
      subtotalAmount: price.toFixed(2),
      discountAmount: "0.00",
      shippingAmount: shipping,
      taxAmount: tax,
      createdAt,
      updatedAt: createdAt,
    });

    demoOrderItems.push({
      id: `oi-demo-${i}`,
      orderId,
      variantId: "var-demo-1-acoustic",
      quantity: 1,
      price: price.toFixed(2),
      createdAt,
    });

    demoTxns.push({
      id: `tx-demo-${i}`,
      tenantId: "tenant-demo",
      orderId,
      provider: "stripe",
      referenceId: `ch_demo_${i}`,
      amount: total,
      status: "success",
      createdAt,
    });
  }

  for (const o of demoOrders) {
    await db.insert(orders).values(o);
  }
  for (const oi of demoOrderItems) {
    await db.insert(orderItems).values(oi);
  }
  for (const tx of demoTxns) {
    await db.insert(transactions).values(tx);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
