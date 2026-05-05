import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/types";

/**
 * Get the authenticated user from the current server-side request.
 * Returns null if no valid session exists.
 * Always validates JWT server-side — never trusts client state. (SECURITY-08)
 */
export async function getUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };
}

/**
 * Get the current session. Returns null if no valid session.
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
