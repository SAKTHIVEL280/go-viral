"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
  delay?: number;
}

export function WordsPullUp({ text, className = "", showAsterisk = false, delay = 0 }: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  // once: false — replays every time the element enters the viewport
  const inView = useInView(ref, { once: false, margin: "-10% 0px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1;
        return (
          <span key={i} className="overflow-hidden inline-block mr-[0.25em]">
            <motion.span
              className="inline-block relative"
              initial={{ y: "100%", opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: delay + i * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
              {isLast && showAsterisk && (
                <sup
                  className="absolute font-medium"
                  style={{
                    top: "0.65em",
                    right: "-0.3em",
                    fontSize: "0.31em",
                    color: "#E1E0CC",
                  }}
                >
                  *
                </sup>
              )}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}
