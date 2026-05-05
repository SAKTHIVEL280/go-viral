import { createClient } from "@/lib/supabase/server";
import type { Analysis, AnalysisSummary, NewAnalysis } from "@/lib/types";
import { DatabaseError } from "@/lib/types";

const MAX_ANALYSES_PER_USER = 20;

export async function save(analysis: NewAnalysis): Promise<Analysis> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: analysis.userId,
      media_url: analysis.mediaUrl,
      media_type: analysis.mediaType,
      platform: analysis.platform,
      caption: analysis.caption,
      scores: analysis.scores,
    })
    .select()
    .single();

  if (error || !data) throw new DatabaseError(`Failed to save analysis: ${error?.message}`);
  return mapRow(data);
}

export async function findById(id: string): Promise<Analysis | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null; // RLS returns null for non-owner rows (BR-15)
  return mapRow(data);
}

export async function findByUser(
  userId: string,
  limit = 20
): Promise<AnalysisSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("analyses")
    .select("id, media_type, platform, media_url, scores, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new DatabaseError(`Failed to fetch history: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    mediaType: row.media_type,
    platform: row.platform,
    mediaUrl: row.media_url,
    overallScore: (row.scores as { overall: number })?.overall ?? 0,
    createdAt: row.created_at,
  }));
}

export async function countByUser(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("analyses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return 0;
  return count ?? 0;
}

export async function deleteOldest(userId: string): Promise<void> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("analyses")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (data?.id) {
    await supabase.from("analyses").delete().eq("id", data.id);
  }
}

/**
 * Saves analysis, auto-deleting oldest if user has reached the limit (BR-12).
 */
export async function saveWithOverflowCheck(analysis: NewAnalysis): Promise<Analysis> {
  const count = await countByUser(analysis.userId);
  if (count >= MAX_ANALYSES_PER_USER) {
    await deleteOldest(analysis.userId);
  }
  return save(analysis);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Analysis {
  return {
    id: row.id,
    userId: row.user_id,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    platform: row.platform,
    caption: row.caption,
    scores: row.scores,
    createdAt: row.created_at,
  };
}
