"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UploadDropzone } from "@/components/upload-dropzone";
import type { Platform } from "@/lib/types";
import { ArrowRight, Info } from "lucide-react";

const PLATFORMS: { id: Platform; label: string; sub: string; hint: string }[] = [
  { id: "tiktok",         label: "TikTok",         sub: "Short-form vertical", hint: "Hook weight 35%" },
  { id: "instagram",      label: "Instagram",       sub: "Reels and Stories",  hint: "Visual weight 30%" },
  { id: "youtube_shorts", label: "YouTube Shorts",  sub: "Up to 7 minutes",    hint: "Pacing weight 30%" },
];

const ACCEPTED_FILES = [
  "video/mp4", "video/quicktime", "video/webm",
  "image/jpeg", "image/png", "image/gif", "image/webp",
];

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ANALYSIS_MESSAGES = [
  "Reading your hook...",
  "Analyzing visual composition...",
  "Evaluating pacing and retention...",
  "Scoring caption strength...",
  "Generating platform-specific hashtags...",
  "Calculating your virality score...",
];

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState(ANALYSIS_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setError(null);
    if (f.type.startsWith("image/")) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }, []);

  const handleClear = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setUploadProgress(0);
  }, [preview]);

  const maxSize = file?.type.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const canAnalyze = file && platform && !uploading && !analyzing;

  async function handleAnalyze() {
    if (!file || !platform) return;
    setError(null);
    setUploading(true);
    setUploadProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("platform", platform);

      setUploadProgress(50);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      setUploadProgress(90);

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error ?? "Upload failed");
      }

      const { storagePath, signedUrl, mediaType } = await uploadRes.json();
      setUploadProgress(100);
      setUploading(false);
      setAnalyzing(true);

      let msgIdx = 0;
      const msgInterval = setInterval(() => {
        msgIdx = (msgIdx + 1) % ANALYSIS_MESSAGES.length;
        setAnalysisMessage(ANALYSIS_MESSAGES[msgIdx]);
      }, 2800);

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storagePath, signedUrl, mediaType, platform, caption: caption.trim() || undefined }),
      });

      clearInterval(msgInterval);

      if (!analyzeRes.ok) {
        const data = await analyzeRes.json();
        throw new Error(data.error ?? "Analysis failed");
      }

      const { analysisId } = await analyzeRes.json();
      router.push(`/analysis/${analysisId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setUploading(false);
      setAnalyzing(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="min-h-screen bg-black px-3 sm:px-4 md:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div
          className="py-10 sm:py-12 border-b mb-8 sm:mb-10"
          style={{ borderColor: "rgba(225,224,204,0.08)" }}
        >
          <p className="text-primary/40 text-sm uppercase tracking-widest mb-2 sm:mb-3">AI analysis</p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium" style={{ color: "#E1E0CC" }}>
            Analyze your content.
          </h1>
          <p className="text-gray-500 text-base font-light mt-2 sm:mt-3 leading-relaxed">
            Upload a video or image, select your target platform, and get a precise virality score with actionable feedback in under 30 seconds.
          </p>
        </div>

        <div className="space-y-7 sm:space-y-8">

          {/* Step 1 */}
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <p className="text-primary/40 text-sm uppercase tracking-widest">Step 1. Target platform</p>
              <span className="text-red-500/50 text-xs uppercase tracking-wider">Required</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  aria-pressed={platform === p.id}
                  className="p-4 rounded-xl text-left transition-all duration-300"
                  style={{
                    background: platform === p.id ? "rgba(222,219,200,0.08)" : "#101010",
                    border: platform === p.id ? "1px solid rgba(222,219,200,0.25)" : "1px solid rgba(225,224,204,0.06)",
                  }}
                >
                  <p className="text-sm font-medium mb-0.5" style={{ color: platform === p.id ? "#E1E0CC" : "rgba(225,224,204,0.6)" }}>
                    {p.label}
                  </p>
                  <p className="text-gray-600 text-base font-light">{p.sub}</p>
                  {platform === p.id && (
                    <p className="text-primary/40 text-sm mt-1.5 uppercase tracking-wider">{p.hint}</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <p className="text-primary/40 text-sm uppercase tracking-widest mb-3 sm:mb-4">
              Step 2. Upload content
            </p>
            <UploadDropzone
              onFileSelect={handleFileSelect}
              accept={ACCEPTED_FILES}
              maxSizeBytes={maxSize}
              uploading={uploading}
              progress={uploadProgress}
              preview={preview}
              selectedFile={file}
              onClear={handleClear}
            />
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <p className="text-primary/40 text-sm uppercase tracking-widest">Step 3. Caption</p>
              <span className="text-gray-700 text-sm">optional but improves accuracy</span>
            </div>
            <div className="relative">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
                placeholder="Paste your caption here for a more accurate analysis. The AI will score hook words, CTA strength, emoji usage, and length."
                rows={4}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all duration-200"
                style={{
                  background: "#101010",
                  border: "1px solid rgba(225,224,204,0.06)",
                  color: "#E1E0CC",
                  lineHeight: "1.6",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(222,219,200,0.2)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(225,224,204,0.06)")}
                aria-label="Caption text"
              />
              <span className="absolute bottom-3 right-3 text-gray-700 text-sm">{caption.length}/2200</span>
            </div>
          </div>

          {/* Info */}
          <div
            className="flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(225,224,204,0.03)", border: "1px solid rgba(225,224,204,0.06)" }}
          >
            <Info className="w-3.5 h-3.5 text-primary/30 flex-shrink-0 mt-0.5" />
            <p className="text-gray-600 text-base leading-relaxed">
              Analysis takes 10 to 30 seconds depending on content length. Videos are analyzed for hook, pacing, and visual appeal. Images are scored on visual composition and thumbnail potential.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-base text-red-400 bg-red-500/10 border border-red-500/20" role="alert">
              {error}
            </div>
          )}

          {/* CTA */}
          {canAnalyze ? (
            <button
              onClick={handleAnalyze}
              className="group w-full flex items-center justify-between bg-primary rounded-full pl-5 sm:pl-6 pr-1.5 py-1.5 transition-all duration-300"
            >
              <span className="text-black font-medium text-sm sm:text-base">Analyze virality</span>
              <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ArrowRight className="w-4 h-4 text-primary" />
              </span>
            </button>
          ) : (
            <button
              disabled
              className="w-full py-4 rounded-full text-sm font-medium cursor-not-allowed"
              style={{ background: "#101010", color: "rgba(225,224,204,0.2)", border: "1px solid rgba(225,224,204,0.06)" }}
            >
              {!platform ? "Select a platform first" : "Upload content first"}
            </button>
          )}
        </div>
      </div>

      {/* Analysis overlay */}
      {analyzing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.96)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="rounded-2xl p-8 sm:p-12 max-w-sm w-full text-center"
            style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.08)" }}
          >
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-6 sm:mb-8">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center">
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-medium mb-2 sm:mb-3" style={{ color: "#E1E0CC" }}>
              Analyzing your content...
            </h3>
            <p className="text-primary/50 text-base mb-1.5 sm:mb-2">{analysisMessage}</p>
            <p className="text-gray-700 text-base font-light">This takes 10 to 30 seconds</p>
          </div>
        </div>
      )}
    </div>
  );
}
