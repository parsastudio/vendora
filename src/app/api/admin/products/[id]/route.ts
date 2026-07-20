import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { productSchema } from "@/features/products/validation/product";
import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const productList = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.tenantId, session.user.tenantId)))
      .limit(1);
    if (productList.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const product = productList[0];
    const variants = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, id));
    return NextResponse.json({ success: true, data: { ...product, variants } });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          categoryId: validated.categoryId,
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          imageUrl: validated.imageUrl,
          seoMetadata: validated.seoMetadata,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, id), eq(products.tenantId, session.user.tenantId)));

      const existingVariants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id));

      const incomingSkus = validated.variants.map((v) => v.sku);
      const variantsToDelete = existingVariants.filter((ev) => !incomingSkus.includes(ev.sku));

      if (variantsToDelete.length > 0) {
        await tx.delete(productVariants).where(
          inArray(
            productVariants.id,
            variantsToDelete.map((v) => v.id),
          ),
        );
      }

      for (const variant of validated.variants) {
        const existing = existingVariants.find((ev) => ev.sku === variant.sku);
        if (existing) {
          await tx
            .update(productVariants)
            .set({
              price: variant.price,
              compareAtPrice: variant.compareAtPrice,
              attributes: variant.attributes,
              updatedAt: new Date(),
            })
            .where(eq(productVariants.id, existing.id));
        } else {
          await tx.insert(productVariants).values({
            id: `var-${randomUUID()}`,
            productId: id,
            sku: variant.sku,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            attributes: variant.attributes,
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid input or database error" }, { status: 400 });
  }
}
