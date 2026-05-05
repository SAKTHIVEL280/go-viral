"use client";

import { motion, useTransform, MotionValue } from "framer-motion";

interface AnimatedLetterProps {
  char: string;
  scrollProgress: MotionValue<number>;
  index: number;
  total: number;
}

export function AnimatedLetter({ char, scrollProgress, index, total }: AnimatedLetterProps) {
  const charProgress = index / total;
  const opacity = useTransform(
    scrollProgress,
    [charProgress - 0.1, charProgress + 0.05],
    [0.2, 1]
  );

  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {char}
    </motion.span>
  );
}
