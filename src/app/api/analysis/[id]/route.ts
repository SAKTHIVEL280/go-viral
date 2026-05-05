import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/services/auth.service";
import { findById } from "@/lib/repositories/analysis.repository";
import { createRequestLogger } from "@/lib/logger";
import { randomUUID } from "crypto";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = randomUUID();
  const log = createRequestLogger(requestId);

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const analysis = await findById(id);

    // Return 404 for both not-found and unauthorized (prevents enumeration — BR-15)
    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found." }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    log.error({ error: err instanceof Error ? err.message : "Unknown" }, "Analysis fetch error");
    return NextResponse.json({ error: "Failed to load analysis." }, { status: 500 });
  }
}
