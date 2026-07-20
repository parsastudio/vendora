import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { products, productVariants } from "@/lib/db/schema/products";
import { productSchema } from "@/features/products/validation/product";
import { eq, and, like, sql, ne } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 10;
  const offset = (page - 1) * limit;

  try {
    const results = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.tenantId, session.user.tenantId),
          ne(products.status, "deleted"),
          search ? like(products.name, `%${search}%`) : undefined,
        ),
      )
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(
        and(
          eq(products.tenantId, session.user.tenantId),
          ne(products.status, "deleted"),
          search ? like(products.name, `%${search}%`) : undefined,
        ),
      );

    const total = countResult[0]?.count || 0;

    return NextResponse.json({
      success: true,
      data: {
        items: results,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = productSchema.parse(body);

    const productId = `prod-${Date.now()}`;

    await db.transaction(async (tx) => {
      await tx.insert(products).values({
        id: productId,
        tenantId: session.user.tenantId,
        categoryId: validated.categoryId,
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        seoMetadata: validated.seoMetadata,
        status: "active",
      });

      for (const variant of validated.variants) {
        await tx.insert(productVariants).values({
          id: `var-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId,
          sku: variant.sku,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          attributes: variant.attributes,
        });
      }
    });

    return NextResponse.json({ success: true, data: { productId } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid product input data" }, { status: 400 });
  }
}
