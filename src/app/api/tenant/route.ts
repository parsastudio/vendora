import { NextResponse } from "next/server";
import { getActiveTenant } from "@/lib/tenant";

export async function GET() {
  const tenant = await getActiveTenant();

  if (!tenant) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Active tenant not identified",
        },
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      subscriptionStatus: tenant.subscriptionStatus,
    },
  });
}
