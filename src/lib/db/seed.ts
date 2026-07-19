import { db } from "./index";
import { tenants } from "./schema/tenants";
import { categories, products, productVariants } from "./schema/products";
import { users, roles, permissions, rolesToPermissions, usersToRoles } from "./schema/users";

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
      id: "tenant-book",
      name: "Global Books",
      subdomain: "books",
      customDomain: null,
      themeSettings: {
        primaryColor: "#4f46e5",
        secondaryColor: "#f8fafc",
        fontFamily: "Geist",
      },
      subscriptionStatus: "trial",
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
  ]);

  await db.insert(rolesToPermissions).values([
    { roleId: "role-admin-nike", permissionId: "p1" },
    { roleId: "role-admin-nike", permissionId: "p2" },
    { roleId: "role-admin-nike", permissionId: "p3" },
    { roleId: "role-admin-nike", permissionId: "p4" },
    { roleId: "role-admin-apple", permissionId: "p1" },
    { roleId: "role-admin-apple", permissionId: "p2" },
  ]);

  await db.insert(users).values([
    {
      id: "user-nike-1",
      tenantId: "tenant-nike",
      email: "nike@admin.com",
      passwordHash: "bcrypt_hashed_password_here",
      name: "Nike Admin",
    },
    {
      id: "user-apple-1",
      tenantId: "tenant-apple",
      email: "apple@admin.com",
      passwordHash: "bcrypt_hashed_password_here",
      name: "Apple Admin",
    },
  ]);

  await db.insert(usersToRoles).values([
    { userId: "user-nike-1", roleId: "role-admin-nike" },
    { userId: "user-apple-1", roleId: "role-admin-apple" },
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
  ]);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
