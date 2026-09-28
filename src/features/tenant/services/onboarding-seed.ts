import "server-only";
import { randomUUID } from "crypto";
import {
  categories,
  products,
  productVariants,
  warehouses,
  inventory,
} from "@/lib/db/schema/products";
import { customers } from "@/lib/db/schema/customers";
import { orders, orderItems, transactions, shippingRates } from "@/lib/db/schema/orders";
import { generateDemoCustomers, generateDemoData } from "@/lib/db/demo-generator";
import { db } from "@/lib/db";

type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export async function seedNewTenant(tx: DbTransaction, tenantId: string) {
  const catAudioId = `cat-audio-${randomUUID()}`;
  const catComputersId = `cat-computers-${randomUUID()}`;

  await tx.insert(categories).values([
    { id: catAudioId, tenantId, parentId: null, name: "Audio", slug: "audio" },
    {
      id: catComputersId,
      tenantId,
      parentId: null,
      name: "Computers",
      slug: "computers",
    },
  ]);

  const prod1Id = `prod-1-${randomUUID()}`;
  const prod2Id = `prod-2-${randomUUID()}`;
  await tx.insert(products).values([
    {
      id: prod1Id,
      tenantId,
      categoryId: catAudioId,
      name: "Zenith Wireless Headphones",
      slug: "zenith-headphones",
      description: "Premium noise cancelling acoustic audio.",
      imageUrl:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
      status: "active",
    },
    {
      id: prod2Id,
      tenantId,
      categoryId: catComputersId,
      name: "Apex Mechanical Keyboard",
      slug: "apex-keyboard",
      description: "Ultra-fast response tactile switches.",
      imageUrl:
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&auto=format&fit=crop&q=80",
      status: "active",
    },
  ]);

  const var1Id = `var-1-${randomUUID()}`;
  const var2Id = `var-2-${randomUUID()}`;
  await tx.insert(productVariants).values([
    {
      id: var1Id,
      productId: prod1Id,
      sku: `VEN-ZEN-ACU-${randomUUID().slice(0, 4).toUpperCase()}`,
      price: "299.00",
      compareAtPrice: "349.00",
      attributes: { color: "black", type: "acoustic" },
    },
    {
      id: var2Id,
      productId: prod2Id,
      sku: `VEN-APX-TAC-${randomUUID().slice(0, 4).toUpperCase()}`,
      price: "149.00",
      compareAtPrice: "179.00",
      attributes: { switches: "brown", layout: "tenkeyless" },
    },
  ]);

  const whId = `wh-1-${randomUUID()}`;
  await tx.insert(warehouses).values([
    {
      id: whId,
      tenantId,
      name: "Silicon Valley Hub",
      location: "San Jose, CA",
    },
  ]);

  await tx.insert(inventory).values([
    { id: `inv-1-${randomUUID()}`, variantId: var1Id, warehouseId: whId, quantity: 80 },
    { id: `inv-2-${randomUUID()}`, variantId: var2Id, warehouseId: whId, quantity: 150 },
  ]);

  await tx.insert(shippingRates).values([
    {
      id: `ship-std-${randomUUID()}`,
      tenantId,
      name: "Standard Ground Shipping",
      price: "10.00",
      minOrderAmount: null,
    },
    {
      id: `ship-exp-${randomUUID()}`,
      tenantId,
      name: "Express Courier Shipping",
      price: "25.00",
      minOrderAmount: null,
    },
  ]);

  const demoCusts = generateDemoCustomers(tenantId).map((c, idx) => ({
    ...c,
    id: `cust-${tenantId}-${idx}`,
  }));

  for (const c of demoCusts) {
    await tx.insert(customers).values(c);
  }

  const { ordersList, itemsList, txnsList } = generateDemoData(tenantId, demoCusts, [
    { id: var1Id, price: "299.00" },
    { id: var2Id, price: "149.00" },
  ]);

  const mappedOrders = ordersList.map((o) => ({
    ...o,
    id: `${o.id}-${tenantId}`,
    customerId: o.customerId ? `${o.customerId}` : null,
  }));

  const mappedOrderItems = itemsList.map((oi) => ({
    ...oi,
    id: `${oi.id}-${tenantId}`,
    orderId: `${oi.orderId}-${tenantId}`,
    variantId: oi.variantId === "var-demo-1-acoustic" ? var1Id : var2Id,
  }));

  const mappedTransactions = txnsList.map((txItem) => ({
    ...txItem,
    id: `${txItem.id}-${tenantId}`,
    orderId: `${txItem.orderId}-${tenantId}`,
  }));

  for (const o of mappedOrders) {
    await tx.insert(orders).values(o);
  }
  for (const oi of mappedOrderItems) {
    await tx.insert(orderItems).values(oi);
  }
  for (const txItem of mappedTransactions) {
    await tx.insert(transactions).values(txItem);
  }
}
