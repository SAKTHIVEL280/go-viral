/** Score color — matches the 3-tier system */
export function getScoreColor(score: number): string {
  if (score <= 40) return "#f43f5e";   // rose
  if (score <= 70) return "#f59e0b";   // amber
  return "#10b981";                     // emerald
}

/** Tailwind text color class */
export function getScoreColorClass(score: number): string {
  if (score <= 40) return "text-rose-400";
  if (score <= 70) return "text-amber-400";
  return "text-emerald-400";
}

/** Human-readable score label */
export function getScoreLabel(score: number): string {
  if (score <= 20) return "Low Potential";
  if (score <= 40) return "Below Average";
  if (score <= 55) return "Average";
  if (score <= 70) return "Good";
  if (score <= 85) return "Strong";
  if (score <= 93) return "Viral Ready";
  return "Exceptional";
}

/** Platform display name */
export function formatPlatform(platform: string): string {
  const map: Record<string, string> = {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube_shorts: "YouTube Shorts",
  };
  return map[platform] ?? platform;
}

/** Media type display name */
export function formatMediaType(mediaType: string): string {
  const map: Record<string, string> = {
    video: "Video",
    image: "Image",
    caption: "Caption",
  };
  return map[mediaType] ?? mediaType;
}
