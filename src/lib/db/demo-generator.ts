import { randomUUID, randomInt } from "crypto";

export interface DemoCustomer {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone: string;
}

export interface DemoOrder {
  id: string;
  tenantId: string;
  customerId: string | null;
  status: string;
  paymentStatus: string;
  shippingAddress: {
    name: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalAmount: string;
  subtotalAmount: string;
  discountAmount: string;
  shippingAmount: string;
  taxAmount: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DemoOrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: string;
  createdAt: Date;
}

export interface DemoTransaction {
  id: string;
  tenantId: string;
  orderId: string;
  provider: string;
  referenceId: string;
  amount: string;
  status: string;
  createdAt: Date;
}

const names = [
  "Robert Chen",
  "Emily Watson",
  "Marcus Vance",
  "Sophia Martinez",
  "David Kim",
  "Chloe Jenkins",
  "Alexander Wright",
  "Emma Harrison",
  "James Peterson",
  "Olivia Foster",
];

const cities = [
  { city: "New York", state: "NY", zip: "10001" },
  { city: "Los Angeles", state: "CA", zip: "90001" },
  { city: "Chicago", state: "IL", zip: "60601" },
  { city: "Houston", state: "TX", zip: "77001" },
  { city: "Miami", state: "FL", zip: "33101" },
  { city: "Seattle", state: "WA", zip: "98101" },
];

const streetNames = [
  "Broadway",
  "Sunset Blvd",
  "Michigan Ave",
  "Westheimer Rd",
  "Ocean Dr",
  "Pine St",
];
const shippingOptions = ["10.00", "25.00"];

export function generateDemoCustomers(tenantId: string): DemoCustomer[] {
  return names.map((name, idx) => ({
    id: `cust-demo-${idx}`,
    tenantId,
    email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
    name,
    phone: `+1-555-010${idx}`,
  }));
}

export function generateDemoData(
  tenantId: string,
  customers: DemoCustomer[],
  variants: { id: string; price: string }[],
) {
  const ordersList: DemoOrder[] = [];
  const itemsList: DemoOrderItem[] = [];
  const txnsList: DemoTransaction[] = [];

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const totalOrdersCount = 650;

  for (let i = 0; i < totalOrdersCount; i++) {
    const orderId = `ord-demo-${i}`;
    const daysAgo = Math.floor(Math.random() * 340) + 1;
    const createdAt = new Date(now - daysAgo * oneDay);

    const customer = customers[randomInt(0, customers.length)];
    const cityData = cities[randomInt(0, cities.length)];
    const street = streetNames[randomInt(0, streetNames.length)];
    const addressLine = `${randomInt(100, 9999)} ${street}`;

    const variant = variants[randomInt(0, variants.length)];
    const qty = randomInt(1, 3);
    const subtotal = (parseFloat(variant.price) * qty).toFixed(2);
    const tax = (parseFloat(subtotal) * 0.05).toFixed(2);
    const shipping = shippingOptions[randomInt(0, shippingOptions.length)];
    const total = (parseFloat(subtotal) + parseFloat(tax) + parseFloat(shipping)).toFixed(2);

    const rand = Math.random();
    let status = "delivered";
    let paymentStatus = "paid";
    let txnStatus = "success";

    if (rand < 0.05) {
      status = "pending";
      paymentStatus = "unpaid";
      txnStatus = "pending";
    } else if (rand < 0.1) {
      status = "cancelled";
      paymentStatus = "unpaid";
      txnStatus = "failed";
    } else if (rand < 0.15) {
      status = "processing";
      paymentStatus = "paid";
    } else if (rand < 0.2) {
      status = "shipped";
      paymentStatus = "paid";
    }

    ordersList.push({
      id: orderId,
      tenantId,
      customerId: customer.id,
      status,
      paymentStatus,
      shippingAddress: {
        name: customer.name,
        line1: addressLine,
        city: cityData.city,
        state: cityData.state,
        postalCode: cityData.zip,
        country: "US",
      },
      totalAmount: total,
      subtotalAmount: subtotal,
      discountAmount: "0.00",
      shippingAmount: shipping,
      taxAmount: tax,
      createdAt,
      updatedAt: createdAt,
    });

    itemsList.push({
      id: `oi-demo-${i}`,
      orderId,
      variantId: variant.id,
      quantity: qty,
      price: variant.price,
      createdAt,
    });

    if (paymentStatus === "paid" || txnStatus === "failed") {
      txnsList.push({
        id: `tx-demo-${i}`,
        tenantId,
        orderId,
        provider: "stripe",
        referenceId: `ch_${randomUUID().slice(0, 18)}`,
        amount: total,
        status: txnStatus,
        createdAt,
      });
    }
  }

  return { ordersList, itemsList, txnsList };
}
