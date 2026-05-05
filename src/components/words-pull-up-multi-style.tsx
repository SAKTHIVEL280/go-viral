"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Segment {
  text: string;
  className?: string;
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[];
  containerClassName?: string;
  delay?: number;
}

export function WordsPullUpMultiStyle({
  segments,
  containerClassName = "",
  delay = 0,
}: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null);
  // once: false — replays every time the element enters the viewport
  const inView = useInView(ref, { once: false, margin: "-10% 0px" });

  const allWords: { word: string; className: string }[] = [];
  for (const seg of segments) {
    const words = seg.text.split(" ").filter(Boolean);
    for (const word of words) {
      allWords.push({ word, className: seg.className ?? "" });
    }
  }

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${containerClassName}`}>
      {allWords.map((item, i) => (
        <span key={i} className="overflow-hidden inline-block mr-[0.25em]">
          <motion.span
            className={`inline-block ${item.className}`}
            initial={{ y: "100%", opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {item.word}
          </motion.span>
        </span>
      ))}
    </div>
  );
}
