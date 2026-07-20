import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@/lib/logger";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function generatePresignedUrl(key: string, contentType: string): Promise<string> {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) {
    logger.error("AWS_S3_BUCKET environment variable is missing");
    throw new Error("Storage configuration mismatch");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  try {
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    logger.error({ error, key }, "Failed to generate presigned S3 URL");
    throw new Error("Failed to sign upload request");
  }
}
