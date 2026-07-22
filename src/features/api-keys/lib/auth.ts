import "server-only";
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema/api-keys";
import { eq } from "drizzle-orm";
import { createHash, timingSafeEqual } from "crypto";

export async function validateApiKey(request: Request) {
  const authHeader = request.headers.get("authorization") || request.headers.get("x-api-key");
  if (!authHeader) return null;

  const rawKey = authHeader.replace("Bearer ", "").trim();
  if (!rawKey.startsWith("vk_")) return null;

  const preview = rawKey.slice(0, 12);
  const hash = createHash("sha256").update(rawKey).digest("hex");

  const keys = await db.select().from(apiKeys).where(eq(apiKeys.preview, preview)).limit(1);

  if (keys.length === 0) return null;

  const apiKey = keys[0];

  const hashBuffer = Buffer.from(hash, "hex");
  const dbHashBuffer = Buffer.from(apiKey.keyHash, "hex");

  if (hashBuffer.length !== dbHashBuffer.length || !timingSafeEqual(hashBuffer, dbHashBuffer)) {
    return null;
  }

  if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
    return null;
  }

  return apiKey.tenantId;
}
