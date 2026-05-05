import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { getUser } from "@/lib/services/auth.service";
import { analyzeContent } from "@/lib/services/ai-analysis.service";
import { saveWithOverflowCheck } from "@/lib/repositories/analysis.repository";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import { createRequestLogger } from "@/lib/logger";
import { AIAnalysisError } from "@/lib/types";

const analyzeBodySchema = z.object({
  storagePath: z.string().min(1),
  signedUrl: z.string().url(),
  mediaType: z.enum(["video", "image", "caption"]),
  platform: z.enum(["tiktok", "instagram", "youtube_shorts"]),
  caption: z.string().max(2200).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  const log = createRequestLogger(requestId);

  try {
    // 1. Auth
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reqLog = createRequestLogger(requestId, user.id);

    // 2. Rate limit
    const rateLimit = await checkRateLimit(user.id, "analyze");
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "You have reached the analysis limit. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds ?? 60) } }
      );
    }

    // 3. Validate body
    const body = await request.json();
    const validation = analyzeBodySchema.safeParse(body);
    if (!validation.success) {
      reqLog.warn({ issues: validation.error.issues }, "Invalid request body");
      return NextResponse.json(
        { error: "Invalid request. Please check your input." },
        { status: 400 }
      );
    }

    const { storagePath, signedUrl, mediaType, platform, caption } = validation.data;
    reqLog.info({ mediaType, platform, storagePath }, "Starting analysis");

    // 4. Run AI analysis
    const scores = await analyzeContent({
      storagePath,
      signedUrl,
      mediaType,
      platform,
      caption,
      userId: user.id,
    });

    // 5. Save to DB
    const analysis = await saveWithOverflowCheck({
      userId: user.id,
      mediaUrl: signedUrl,
      mediaType,
      platform,
      caption: caption ?? null,
      scores,
    });

    reqLog.info({ analysisId: analysis.id, score: scores.overall }, "Analysis saved");
    return NextResponse.json({ analysisId: analysis.id });

  } catch (err) {
    // Always log the full error for debugging
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    log.error({ error: message, stack }, "Analysis route error");

    if (err instanceof AIAnalysisError) {
      // Determine user-facing message based on error content
      let userMessage = "AI analysis failed. Please try again.";
      if (message.includes("expired") || message.includes("fetch") || message.includes("HTTP 4")) {
        userMessage = "Could not read your file. Please upload again and retry.";
      } else if (message.includes("rate") || message.includes("429") || message.includes("quota") || message.includes("wait")) {
        userMessage = "The AI service is busy. Please wait 1 minute and try again.";
      } else if (message.includes("incomplete") || message.includes("unreadable")) {
        userMessage = "AI returned an incomplete response. Please try again.";
      }
      return NextResponse.json({ error: userMessage }, { status: 502 });
    }

    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
