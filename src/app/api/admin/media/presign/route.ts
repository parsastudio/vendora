import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/features/auth/lib/auth";
import { generatePresignedUrl } from "@/lib/s3";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/_{2,}/g, "_");

    const key = `tenants/${session.user.tenantId}/uploads/${randomUUID()}-${sanitizedFileName}`;
    const uploadUrl = await generatePresignedUrl(key, contentType);

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl,
        fileUrl: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
