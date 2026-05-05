import { createClient } from "@/lib/supabase/server";
import type { MediaType, UploadedFile } from "@/lib/types";

const BUCKET = "media-uploads";

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
const SIGNED_URL_EXPIRY = 3600; // 1 hour

export function validateFileType(mimeType: string): MediaType | null {
  if ((ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType))
    return "video";
  if ((ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType))
    return "image";
  return null;
}

export function validateFileSize(
  sizeBytes: number,
  mediaType: MediaType
): boolean {
  if (mediaType === "video") return sizeBytes <= MAX_VIDEO_BYTES;
  if (mediaType === "image") return sizeBytes <= MAX_IMAGE_BYTES;
  return true;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "")
    .toLowerCase();
}

export async function uploadFile(
  file: Buffer,
  userId: string,
  originalName: string,
  mimeType: string
): Promise<UploadedFile> {
  const mediaType = validateFileType(mimeType);
  if (!mediaType) {
    throw new Error(
      "Unsupported file type. Please upload MP4, MOV, WebM, JPG, PNG, GIF, or WebP."
    );
  }

  if (!validateFileSize(file.length, mediaType)) {
    const limit = mediaType === "video" ? "200MB" : "10MB";
    throw new Error(`File too large. Maximum size for ${mediaType} is ${limit}.`);
  }

  const supabase = await createClient();
  const filename = sanitizeFilename(originalName);
  const storagePath = `${userId}/${Date.now()}-${filename}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const signedUrl = await getSignedUrl(storagePath);

  return { storagePath, signedUrl, mimeType, sizeBytes: file.length, mediaType };
}

export async function getSignedUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to generate signed URL: ${error?.message}`);
  }
  return data.signedUrl;
}

export async function deleteFile(storagePath: string): Promise<void> {
  const supabase = await createClient();
  await supabase.storage.from(BUCKET).remove([storagePath]);
}
