import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "@/lib/services/auth.service";
import { uploadFile } from "@/lib/services/storage.service";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { randomUUID } from "crypto";

const uploadQuerySchema = z.object({
  platform: z.enum(["tiktok", "instagram", "youtube_shorts"]),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const log = createRequestLogger(requestId);

  try {
    // 1. Auth check (SECURITY-08)
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqLog = createRequestLogger(requestId, user.id);
    reqLog.info({ endpoint: "/api/upload" }, "Upload request received");

    // 2. Rate limit check (SECURITY-11)
    const rateLimit = await checkRateLimit(user.id, "upload");
    if (!rateLimit.allowed) {
      reqLog.warn({ retryAfter: rateLimit.retryAfterSeconds }, "Rate limit exceeded");
      return NextResponse.json(
        { error: "Too many requests. Please wait before uploading again." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) },
        }
      );
    }

    // 3. Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const platform = formData.get("platform") as string | null;

    // 4. Validate inputs (SECURITY-05)
    const validation = uploadQuerySchema.safeParse({ platform });
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid platform. Must be tiktok, instagram, or youtube_shorts." },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // 5. Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadFile(buffer, user.id, file.name, file.type);

    reqLog.info(
      { mediaType: uploaded.mediaType, sizeBytes: uploaded.sizeBytes },
      "File uploaded successfully"
    );

    return NextResponse.json({
      storagePath: uploaded.storagePath,
      signedUrl: uploaded.signedUrl,
      mediaType: uploaded.mediaType,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    log.error({ error: message }, "Upload error");

    // Return user-friendly errors for known validation failures (SECURITY-09)
    if (
      message.includes("Unsupported file type") ||
      message.includes("File too large")
    ) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
