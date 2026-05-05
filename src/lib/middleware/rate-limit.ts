import { createClient } from "@/lib/supabase/server";
import type { RateLimitResult } from "@/lib/types";

const RATE_LIMIT = 5; // max analyses per window
const WINDOW_MINUTES = 60;

/**
 * Sliding window rate limiter using Supabase rate_limits table.
 * Returns { allowed: true } or { allowed: false, retryAfterSeconds }
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string
): Promise<RateLimitResult> {
  const supabase = await createClient();
  const windowStart = new Date(
    Date.now() - WINDOW_MINUTES * 60 * 1000
  ).toISOString();

  // Count requests in the current window
  const { count, error } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("created_at", windowStart);

  if (error) {
    // Fail open on DB error — don't block users due to rate limit DB issues
    console.error("Rate limit check failed:", error.message);
    return { allowed: true };
  }

  if ((count ?? 0) >= RATE_LIMIT) {
    // Find the oldest request in window to calculate retry-after
    const { data: oldest } = await supabase
      .from("rate_limits")
      .select("created_at")
      .eq("user_id", userId)
      .eq("endpoint", endpoint)
      .gte("created_at", windowStart)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    const retryAfterSeconds = oldest
      ? Math.ceil(
          (new Date(oldest.created_at).getTime() +
            WINDOW_MINUTES * 60 * 1000 -
            Date.now()) /
            1000
        )
      : WINDOW_MINUTES * 60;

    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  // Record this request
  await supabase
    .from("rate_limits")
    .insert({ user_id: userId, endpoint });

  return { allowed: true };
}
