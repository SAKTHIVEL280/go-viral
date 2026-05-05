import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getUser } from "@/lib/services/auth.service";
import { findByUser } from "@/lib/repositories/analysis.repository";
import { formatPlatform, formatMediaType, getScoreColor, getScoreLabel } from "@/lib/utils/design";

export default async function DashboardPage() {
  const user = await getUser();
  const analyses = user ? await findByUser(user.id, 20).catch(() => []) : [];

  const avgScore = analyses.length > 0
    ? Math.round(analyses.reduce((s, a) => s + a.overallScore, 0) / analyses.length)
    : null;
  const bestScore = analyses.length > 0
    ? Math.max(...analyses.map((a) => a.overallScore))
    : null;

  return (
    <div className="min-h-screen bg-black px-3 sm:px-4 md:px-6 pt-16 sm:pt-20 pb-16 sm:pb-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 sm:gap-6 py-10 sm:py-12 border-b"
          style={{ borderColor: "rgba(225,224,204,0.08)" }}
        >
          <div>
            <p className="text-primary/40 text-sm uppercase tracking-widest mb-2 sm:mb-3">Your workspace</p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium" style={{ color: "#E1E0CC" }}>
              {user?.name ? `${user.name.split(" ")[0]}'s` : "Your"} analyses.
            </h1>
            {user?.email && (
              <p className="text-gray-600 text-sm mt-1.5">{user.email}</p>
            )}
          </div>
          <Link
            href="/upload"
            className="group inline-flex items-center gap-2 hover:gap-3 bg-primary rounded-full pl-4 sm:pl-5 pr-1.5 py-1.5 transition-all duration-300 self-start sm:self-auto flex-shrink-0"
            data-testid="dashboard-new-analysis-btn"
          >
            <span className="text-black font-medium text-sm whitespace-nowrap">New analysis</span>
            <span className="bg-black rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </span>
          </Link>
        </div>

        {/* Stats */}
        {analyses.length > 0 && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-px my-px"
            style={{ background: "rgba(225,224,204,0.06)" }}
          >
            {[
              { label: "Total analyses", value: String(analyses.length) },
              { label: "Average score",  value: avgScore ? `${avgScore}` : "0" },
              { label: "Best score",     value: bestScore ? `${bestScore}` : "0" },
              { label: "This month",     value: String(analyses.filter(a => new Date(a.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length) },
            ].map((s) => (
              <div key={s.label} className="bg-black px-4 sm:px-6 py-6 sm:py-8">
                <p className="text-2xl sm:text-3xl md:text-4xl font-medium mb-1 sm:mb-2" style={{ color: "#E1E0CC" }}>{s.value}</p>
                <p className="text-gray-600 text-sm sm:text-base uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="mt-8 sm:mt-10">
          <p className="text-primary/40 text-sm sm:text-base uppercase tracking-widest mb-5 sm:mb-6">
            {analyses.length > 0 ? `${analyses.length} result${analyses.length > 1 ? "s" : ""}` : "History"}
          </p>

          {analyses.length === 0 ? (
            <div
              className="rounded-2xl p-10 sm:p-14 md:p-16 text-center"
              style={{ background: "#101010" }}
              data-testid="dashboard-analysis-grid"
            >
              <p className="text-primary/30 text-sm uppercase tracking-widest mb-5 sm:mb-6">Nothing here yet</p>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-medium mb-3 sm:mb-4" style={{ color: "#E1E0CC" }}>
                Upload your first content.
              </h2>
              <p className="text-gray-500 text-base font-light max-w-xs mx-auto mb-8 sm:mb-10 leading-relaxed">
                Get an AI virality score with a full breakdown and actionable feedback in under 30 seconds.
              </p>
              <Link
                href="/upload"
                className="group inline-flex items-center gap-2 hover:gap-3 bg-primary rounded-full pl-5 pr-1.5 py-1.5 transition-all duration-300"
              >
                <span className="text-black font-medium text-sm">Analyze your first content</span>
                <span className="bg-black rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </span>
              </Link>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3"
              data-testid="dashboard-analysis-grid"
            >
              {analyses.map((a) => {
                const color = getScoreColor(a.overallScore);
                const label = getScoreLabel(a.overallScore);
                return (
                  <Link
                    key={a.id}
                    href={`/analysis/${a.id}`}
                    className="group rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:scale-[1.01]"
                    style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.04)" }}
                    data-testid={`dashboard-analysis-card-${a.id}`}
                  >
                    <div className="flex items-start justify-between mb-5 sm:mb-6">
                      <div>
                        <p className="text-primary/40 text-sm uppercase tracking-widest mb-1.5 sm:mb-2">
                          {formatPlatform(a.platform)}
                        </p>
                        <p className="text-4xl sm:text-5xl font-medium leading-none" style={{ color }}>
                          {a.overallScore}
                        </p>
                        <p className="text-gray-600 text-base mt-1">/100 · {label}</p>
                      </div>
                      <svg width="44" height="44" viewBox="0 0 44 44" className="-rotate-90 flex-shrink-0">
                        <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                        <circle
                          cx="22" cy="22" r="17" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 17}`}
                          strokeDashoffset={`${2 * Math.PI * 17 * (1 - a.overallScore / 100)}`}
                        />
                      </svg>
                    </div>

                    <div className="h-px mb-4" style={{ background: "rgba(225,224,204,0.05)" }} />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-base">{formatMediaType(a.mediaType)}</p>
                        <p className="text-gray-700 text-base mt-0.5">
                          {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-primary/20 group-hover:text-primary/60 transition-colors duration-200"
                        style={{ transform: "rotate(-45deg)" }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {analyses.length > 0 && (
          <p className="text-gray-700 text-base text-center mt-8 sm:mt-10">
            Showing your last {analyses.length} {analyses.length === 1 ? "analysis" : "analyses"}. Max 20 stored.
          </p>
        )}
      </div>
    </div>
  );
}
