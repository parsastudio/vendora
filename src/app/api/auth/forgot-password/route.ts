import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";
import { randomUUID } from "crypto";
import { rateLimit } from "@/features/shared/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const limiter = await rateLimit(`rate_limit:forgot_password:${ip}`, 5, 3600);

    if (!limiter.success) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again in an hour." },
        { status: 429 },
      );
    }

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
  } catch (error: unknown) {
    logger.error(error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
