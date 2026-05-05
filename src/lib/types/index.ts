// ─── Platform & Media ────────────────────────────────────────────────────────

export type MediaType = "video" | "image" | "caption";
export type Platform = "tiktok" | "instagram" | "youtube_shorts";

export const PLATFORM_LABELS: Record<Platform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube_shorts: "YouTube Shorts",
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  video: "Video",
  image: "Image",
  caption: "Caption",
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadedFile {
  storagePath: string;
  signedUrl: string;
  mimeType: string;
  sizeBytes: number;
  mediaType: MediaType;
}

export interface UploadResponse {
  storagePath: string;
  signedUrl: string;
  mediaType: MediaType;
}

// ─── Virality Score ───────────────────────────────────────────────────────────

export interface DimensionScore {
  score: number; // 0–100 (always clamped)
  explanation: string;
  suggestions: string[];
}

export interface ViralityScore {
  overall: number; // 0–100 weighted composite
  hookStrength: DimensionScore;
  pacing: DimensionScore | null; // null for images/captions
  visualAppeal: DimensionScore | null; // null for caption-only
  captionOptimization: DimensionScore;
  platformFit: DimensionScore;
  hashtags: string[]; // 10–15 items
  audioSuggestion: string;
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

export interface Analysis {
  id: string;
  userId: string;
  mediaUrl: string | null;
  mediaType: MediaType;
  platform: Platform;
  caption: string | null;
  scores: ViralityScore;
  createdAt: string;
}

export interface AnalysisSummary {
  id: string;
  mediaType: MediaType;
  platform: Platform;
  mediaUrl: string | null;
  overallScore: number;
  createdAt: string;
}

export interface NewAnalysis {
  userId: string;
  mediaUrl: string | null;
  mediaType: MediaType;
  platform: Platform;
  caption: string | null;
  scores: ViralityScore;
}

// ─── API Payloads ─────────────────────────────────────────────────────────────

export interface AnalysisInput {
  storagePath: string;
  signedUrl: string;
  mediaType: MediaType;
  platform: Platform;
  caption?: string;
  userId: string;
}

export interface AnalyzeRequestBody {
  storagePath: string;
  signedUrl: string;
  mediaType: MediaType;
  platform: Platform;
  caption?: string;
}

export interface AnalyzeResponse {
  analysisId: string;
}

export interface HistoryResponse {
  analyses: AnalysisSummary[];
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

// ─── Platform Weights ─────────────────────────────────────────────────────────

export interface PlatformWeights {
  hookStrength: number;
  pacing: number;
  visualAppeal: number;
  captionOptimization: number;
  platformFit: number;
}

export const PLATFORM_WEIGHTS: Record<Platform, PlatformWeights> = {
  tiktok: {
    hookStrength: 0.35,
    pacing: 0.25,
    visualAppeal: 0.15,
    captionOptimization: 0.15,
    platformFit: 0.1,
  },
  instagram: {
    hookStrength: 0.2,
    pacing: 0.2,
    visualAppeal: 0.3,
    captionOptimization: 0.2,
    platformFit: 0.1,
  },
  youtube_shorts: {
    hookStrength: 0.3,
    pacing: 0.3,
    visualAppeal: 0.15,
    captionOptimization: 0.15,
    platformFit: 0.1,
  },
};

// ─── Errors ───────────────────────────────────────────────────────────────────

export class AIAnalysisError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIAnalysisError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}
