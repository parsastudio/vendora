import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";
import { workflowEmitter } from "@/features/workflows/lib/event-emitter";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { triggerEvent, url } = body as { triggerEvent: string; url: string };

    if (!triggerEvent || !url) {
      return NextResponse.json({ error: "Missing payload details" }, { status: 400 });
    }

    const mockPayload = {
      orderId: `ord-mock-${Date.now()}`,
      total: "199.99",
      currency: "USD",
    };

    await workflowEmitter.emitEvent(triggerEvent, session.user.tenantId, mockPayload);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Workflow test emission failed" }, { status: 500 });
  }
}
