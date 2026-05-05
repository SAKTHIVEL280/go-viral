"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getScoreColor } from "@/lib/utils/design";
import type { DimensionScore } from "@/lib/types";

interface ScoreBreakdownCardProps {
  dimension: { key: string; name: string; icon: string; score: DimensionScore };
  index?: number;
}

export function ScoreBreakdownCard({ dimension, index = 0 }: ScoreBreakdownCardProps) {
  const { key, name, icon, score } = dimension;
  const color = getScoreColor(score.score);
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl p-6 transition-all duration-300"
      style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.06)" }}
      data-testid={`score-card-${key}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-base" role="img" aria-hidden>{icon}</span>
          <p className="text-primary/40 text-sm uppercase tracking-widest">{name}</p>
        </div>
        <span className="text-2xl font-medium" style={{ color }} data-testid={`score-card-${key}-score`}>
          {score.score}
        </span>
      </div>

      {/* Bar */}
      <div className="h-px mb-4 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
        <motion.div
          className="h-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score.score}%` }}
          transition={{ duration: 1, delay: index * 0.07 + 0.25, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <p className="text-gray-500 text-base leading-relaxed font-light mb-4">{score.explanation}</p>

      {score.suggestions.length > 0 && (
        <div>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 text-base transition-colors duration-200"
            style={{ color: open ? "rgba(225,224,204,0.7)" : "rgba(225,224,204,0.3)" }}
            aria-expanded={open}
            data-testid={`score-card-${key}-suggestions`}
          >
            {score.suggestions.length} suggestion{score.suggestions.length > 1 ? "s" : ""}
            <ChevronDown
              className="w-3 h-3 transition-transform duration-300"
              style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {open && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 space-y-2.5 overflow-hidden"
            >
              {score.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-base text-gray-500 font-light">
                  <span className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                  {s}
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      )}
    </motion.div>
  );
}
