"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Check, Copy, Music, Hash } from "lucide-react";
import { gsap } from "gsap";
import { ScoreGauge } from "@/components/score-gauge";
import { ScoreBreakdownCard } from "@/components/score-breakdown-card";
import { formatPlatform, formatMediaType, getScoreLabel, getScoreColor } from "@/lib/utils/design";
import type { Analysis } from "@/lib/types";

const DIMENSIONS = [
  { key: "hookStrength",        name: "Hook Strength",      icon: "⚡" },
  { key: "pacing",              name: "Pacing and Retention", icon: "🎬" },
  { key: "visualAppeal",        name: "Visual Appeal",      icon: "👁" },
  { key: "captionOptimization", name: "Caption",            icon: "✍️" },
  { key: "platformFit",         name: "Platform Fit",       icon: "🎯" },
];

export default function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [copiedScore, setCopiedScore] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/analysis/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => setAnalysis(d.analysis))
      .catch((e) => setError(e === 404 ? "Analysis not found." : "Failed to load."))
      .finally(() => setLoading(false));
  }, [id]);

  // Stagger score cards in after data loads
  useEffect(() => {
    if (!analysis || !cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll("[data-score-card]");
    gsap.fromTo(
      cards,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.08, delay: 0.3 }
    );
  }, [analysis]);

  async function copyTag(tag: string) {
    await navigator.clipboard?.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  }

  async function copyAllTags() {
    if (!analysis) return;
    await navigator.clipboard?.writeText(analysis.scores.hashtags.join(" "));
    setCopiedTag("__all__");
    setTimeout(() => setCopiedTag(null), 1500);
  }

  async function shareScore() {
    if (!analysis) return;
    await navigator.clipboard?.writeText(
      `My ${formatPlatform(analysis.platform)} content scored ${analysis.scores.overall}/100 on GoViral. ${getScoreLabel(analysis.scores.overall)}.`
    );
    setCopiedScore(true);
    setTimeout(() => setCopiedScore(false), 1500);
  }

  if (loading) return <LoadingSkeleton />;

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <p className="text-red-400 mb-4 sm:mb-6 text-sm">{error ?? "Not found."}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary/50 hover:text-primary text-sm transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { scores } = analysis;
  const scoreColor = getScoreColor(scores.overall);
  const scoreLabel = getScoreLabel(scores.overall);
  const activeDimensions = DIMENSIONS.filter(
    (d) => scores[d.key as keyof typeof scores] !== null && scores[d.key as keyof typeof scores] !== undefined
  );

  return (
    <div className="min-h-screen bg-black px-3 sm:px-4 md:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-primary/60 text-base transition-colors duration-200 mt-6 sm:mt-8 mb-8 sm:mb-10"
        >
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
          Back to Dashboard
        </button>

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-10">
          <span
            className="text-xs sm:text-sm uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full"
            style={{ background: "rgba(222,219,200,0.08)", color: "rgba(225,224,204,0.6)", border: "1px solid rgba(225,224,204,0.1)" }}
          >
            {formatPlatform(analysis.platform)}
          </span>
          <span
            className="text-xs sm:text-sm uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full"
            style={{ background: "rgba(222,219,200,0.04)", color: "rgba(225,224,204,0.4)", border: "1px solid rgba(225,224,204,0.06)" }}
          >
            {formatMediaType(analysis.mediaType)}
          </span>
          <span
            className="text-xs sm:text-sm uppercase tracking-widest px-2.5 sm:px-3 py-1 rounded-full"
            style={{ background: `${scoreColor}15`, color: scoreColor, border: `1px solid ${scoreColor}30` }}
          >
            {scoreLabel}
          </span>
          <span className="text-gray-700 text-sm sm:text-base ml-auto">
            {new Date(analysis.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>

        {/* Hero score card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl p-6 sm:p-8 md:p-12 mb-3 sm:mb-4"
          style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.06)" }}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 md:gap-10">
            <div className="flex-shrink-0">
              <ScoreGauge score={scores.overall} label="Virality Score" size="lg" animated />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-primary/40 text-sm uppercase tracking-widest mb-3 sm:mb-4">Analysis complete</p>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium mb-3 sm:mb-4 leading-tight" style={{ color: "#E1E0CC" }}>
                Your virality report for {formatPlatform(analysis.platform)}.
              </h1>
              <p className="text-gray-500 text-base font-light leading-relaxed max-w-sm mb-4 sm:mb-5">
                {scores.overall >= 71
                  ? "Strong viral potential detected. Review the breakdown below and apply the suggestions to push it even higher."
                  : scores.overall >= 41
                    ? "Solid foundation with clear room to grow. The suggestions below will help you close the gap."
                    : "Several key signals are missing. The breakdown below shows exactly what to fix first."}
              </p>
              {analysis.caption && (
                <div
                  className="p-3 sm:p-4 rounded-xl text-base text-gray-500 font-light leading-relaxed"
                  style={{ background: "#212121", border: "1px solid rgba(225,224,204,0.05)" }}
                >
                  <p className="text-primary/30 text-xs sm:text-sm uppercase tracking-widest mb-1.5 sm:mb-2">Caption analyzed</p>
                  <p className="line-clamp-3">{analysis.caption}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Score breakdown */}
        <div className="mb-3 sm:mb-4">
          <p className="text-primary/40 text-sm uppercase tracking-widest mb-4 sm:mb-6 mt-8 sm:mt-10">
            Score breakdown. {activeDimensions.length} dimensions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" ref={cardsRef}>
            {activeDimensions.map((dim, i) => {
              const dimScore = scores[dim.key as keyof typeof scores];
              if (!dimScore || typeof dimScore !== "object" || !("score" in dimScore)) return null;
              return (
                <div key={dim.key} data-score-card style={{ opacity: 0 }}>
                  <ScoreBreakdownCard dimension={{ ...dim, score: dimScore }} index={i} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Hashtags */}
        {scores.hashtags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-5 sm:p-6 md:p-8 mb-2 sm:mb-3"
            style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.06)" }}
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/40" />
                <p className="text-primary/40 text-sm uppercase tracking-widest">
                  Recommended hashtags ({scores.hashtags.length})
                </p>
              </div>
              <button
                onClick={copyAllTags}
                className="text-sm sm:text-base transition-colors duration-200 flex items-center gap-1"
                style={{ color: copiedTag === "__all__" ? "#E1E0CC" : "rgba(225,224,204,0.3)" }}
              >
                {copiedTag === "__all__" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedTag === "__all__" ? "Copied!" : "Copy all"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {scores.hashtags.map((tag, i) => (
                <button
                  key={i}
                  onClick={() => copyTag(tag)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-sm sm:text-base transition-all duration-200 hover:scale-105"
                  style={{
                    background: "#212121",
                    border: "1px solid rgba(225,224,204,0.08)",
                    color: copiedTag === tag ? "#E1E0CC" : "rgba(225,224,204,0.6)",
                  }}
                  title="Click to copy"
                >
                  {tag}
                  {copiedTag === tag
                    ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                    : <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3 opacity-30" />
                  }
                </button>
              ))}
            </div>
            <p className="text-gray-700 text-sm sm:text-base mt-3 sm:mt-4 font-light">
              Click any hashtag to copy. Mix of high-volume, niche, and trending-adjacent tags.
            </p>
          </motion.div>
        )}

        {/* Audio */}
        {scores.audioSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl p-5 sm:p-6 md:p-8 mb-8 sm:mb-10 md:mb-12"
            style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.06)" }}
          >
            <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4">
              <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/40" />
              <p className="text-primary/40 text-sm uppercase tracking-widest">Audio recommendation</p>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-light">{scores.audioSuggestion}</p>
            <p className="text-gray-600 text-base mt-2 sm:mt-3 font-light">
              Matching your content&apos;s tone and energy to trending audio styles can significantly boost reach.
            </p>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => router.push("/upload")}
            className="group inline-flex items-center justify-between sm:justify-start gap-2 hover:gap-3 bg-primary rounded-full pl-5 pr-1.5 py-1.5 transition-all duration-300"
          >
            <span className="text-black font-medium text-sm">Analyze another</span>
            <span className="bg-black rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <ArrowRight className="w-4 h-4 text-primary" />
            </span>
          </button>
          <button
            onClick={shareScore}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-sm transition-all duration-200"
            style={{
              background: "#101010",
              color: copiedScore ? "#E1E0CC" : "rgba(225,224,204,0.5)",
              border: "1px solid rgba(225,224,204,0.08)",
            }}
          >
            {copiedScore ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedScore ? "Copied to clipboard!" : "Share score"}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm transition-all duration-200"
            style={{
              background: "transparent",
              color: "rgba(225,224,204,0.3)",
              border: "1px solid rgba(225,224,204,0.06)",
            }}
          >
            View all analyses
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-black px-4 sm:px-6 pt-20 sm:pt-24 pb-20 max-w-5xl mx-auto">
      <div className="animate-pulse space-y-3 sm:space-y-4">
        <div className="h-3 w-20 rounded bg-white/5" />
        <div className="h-5 w-40 rounded bg-white/5" />
        <div className="h-40 sm:h-48 rounded-2xl bg-white/3 mt-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 sm:h-40 rounded-2xl bg-white/3" />
          ))}
        </div>
        <div className="h-28 sm:h-32 rounded-2xl bg-white/3" />
        <div className="h-20 sm:h-24 rounded-2xl bg-white/3" />
      </div>
    </div>
  );
}
