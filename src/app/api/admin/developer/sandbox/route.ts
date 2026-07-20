import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/features/auth/lib/auth";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, apiKey } = body as { path: string; apiKey: string };

    if (!path || !apiKey) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const res = await fetch(`${origin}${path}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = (await res.json()) as Record<string, unknown>;
    return NextResponse.json({ status: res.status, data });
  } catch {
    return NextResponse.json({ error: "Sandbox execution failed" }, { status: 500 });
  }
}
