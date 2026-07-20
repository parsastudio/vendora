import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });
    if (!user) {
      return NextResponse.json({ success: true });
    }
    const token = randomUUID();
    await redis.set(`reset_token:${token}`, user.id, "EX", 3600);
    logger.info(
      `Password reset link generated for ${user.email}: /admin/reset-password?token=${token}`,
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
