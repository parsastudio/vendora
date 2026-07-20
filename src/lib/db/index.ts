import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as tenants from "./schema/tenants";
import * as users from "./schema/users";
import * as products from "./schema/products";
import * as customers from "./schema/customers";
import * as orders from "./schema/orders";
import * as workflows from "./schema/workflows";

const schema = {
  ...tenants,
  ...users,
  ...products,
  ...customers,
  ...orders,
  ...workflows,
};

interface GlobalDb {
  pool?: Pool;
}

const globalForDb = global as unknown as GlobalDb;

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

pool.on("error", (error: Error) => {
  console.error("Database connection pool idle client error:", error);
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
