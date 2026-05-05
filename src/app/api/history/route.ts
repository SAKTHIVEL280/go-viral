import { NextResponse } from "next/server";
import { getUser } from "@/lib/services/auth.service";
import { findByUser } from "@/lib/repositories/analysis.repository";
import { createRequestLogger } from "@/lib/logger";
import { randomUUID } from "crypto";

export async function GET() {
  const requestId = randomUUID();
  const log = createRequestLogger(requestId);

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await findByUser(user.id, 20);
    return NextResponse.json({ analyses });
  } catch (err) {
    log.error({ error: err instanceof Error ? err.message : "Unknown" }, "History fetch error");
    return NextResponse.json({ error: "Failed to load history." }, { status: 500 });
  }
}
