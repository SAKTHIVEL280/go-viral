"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { getScoreColor, getScoreLabel } from "@/lib/utils/design";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

const SIZE = {
  sm: { box: 52,  r: 20, sw: 3, numClass: "text-base" },
  md: { box: 88,  r: 34, sw: 5, numClass: "text-2xl"  },
  lg: { box: 160, r: 62, sw: 7, numClass: "text-5xl"  },
};

export function ScoreGauge({ score, label = "Score", size = "lg", animated = true }: ScoreGaugeProps) {
  const cfg = SIZE[size];
  const circ = 2 * Math.PI * cfg.r;
  const color = getScoreColor(score);
  const scoreLabel = getScoreLabel(score);

  const mv = useMotionValue(animated ? 0 : score);
  const display = useTransform(mv, (v) => Math.round(v));
  const offset = useTransform(mv, (v) => circ * (1 - v / 100));

  useEffect(() => {
    if (!animated) return;
    const ctrl = animate(mv, score, { duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 });
    return ctrl.stop;
  }, [score, animated, mv]);

  const cx = cfg.box / 2;
  const cy = cfg.box / 2;

  return (
    <div className="flex flex-col items-center gap-3" role="img" aria-label={`${label}: ${score} out of 100`} data-testid="score-gauge">
      <div className="relative" style={{ width: cfg.box, height: cfg.box }}>
        <svg width={cfg.box} height={cfg.box} viewBox={`0 0 ${cfg.box} ${cfg.box}`} className="-rotate-90">
          <circle cx={cx} cy={cy} r={cfg.r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={cfg.sw} />
          <motion.circle
            cx={cx} cy={cy} r={cfg.r}
            fill="none"
            stroke={color}
            strokeWidth={cfg.sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            style={{ strokeDashoffset: offset }}
            data-testid="score-gauge-ring"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-medium leading-none ${cfg.numClass}`}
            style={{ color }}
            data-testid="score-gauge-value"
          >
            {display}
          </motion.span>
          {size === "lg" && (
            <span className="text-gray-600 text-sm mt-1 font-light">/100</span>
          )}
        </div>
      </div>
      {size === "lg" && (
        <div className="text-center">
          <p className="text-gray-500 text-sm font-light">{label}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color }}>{scoreLabel}</p>
        </div>
      )}
    </div>
  );
}
