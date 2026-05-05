"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WordsPullUpMultiStyle } from "@/components/words-pull-up-multi-style";
import { AnimatedLetter } from "@/components/animated-letter";

gsap.registerPlugin(ScrollTrigger);

const BODY_TEXT =
  "Over the last several years, GoViral has worked with creators on TikTok, Instagram, and YouTube. From emerging voices to established studios, we built a system that has helped content earn millions of views and recognition across every major platform.";

const stats = [
  { value: "10M+", label: "Views generated" },
  { value: "50K+", label: "Analyses run" },
  { value: "3",    label: "Platforms supported" },
  { value: "100%", label: "Free to use" },
];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  // Framer scroll for character reveal
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.8", "end 0.2"],
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card slides up on enter
      gsap.fromTo(
        cardRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Stats count up
      const statEls = statsRef.current?.querySelectorAll("[data-stat]");
      statEls?.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            delay: i * 0.1,
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    });

    return () => ctx.revert();
  }, []);

  const chars = BODY_TEXT.split("");

  return (
    <section
      id="about"
      ref={sectionRef}
      className="bg-black py-16 sm:py-20 md:py-32 px-3 sm:px-4 md:px-6"
      style={{ position: "relative" }}
    >
      <div
        ref={cardRef}
        className="max-w-6xl mx-auto rounded-2xl md:rounded-[2rem] px-5 sm:px-8 md:px-12 lg:px-16 py-10 sm:py-14 md:py-20"
        style={{ background: "#101010", opacity: 0 }}
      >
        <p className="text-primary text-sm sm:text-base uppercase tracking-widest mb-6 sm:mb-8 text-center">
          AI Content Analysis
        </p>

        <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl max-w-3xl mx-auto leading-[1.0] sm:leading-[0.95] mb-8 sm:mb-12 text-center">
          <WordsPullUpMultiStyle
            segments={[
              { text: "Your content,", className: "font-normal" },
              { text: "analyzed.", className: "font-serif italic" },
              { text: "Scores for hook strength, visual appeal, and caption power.", className: "font-normal" },
            ]}
            containerClassName="text-center"
            delay={0}
          />
        </div>

        {/* Scroll-linked character reveal */}
        <p
          className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-center mb-12 sm:mb-16"
          style={{ color: "#DEDBC8" }}
        >
          {chars.map((char, i) => (
            <AnimatedLetter
              key={i}
              char={char}
              scrollProgress={scrollYProgress}
              index={i}
              total={chars.length}
            />
          ))}
        </p>

        {/* Stats */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px"
          style={{ background: "rgba(225,224,204,0.06)" }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              data-stat
              className="px-4 sm:px-6 py-6 sm:py-8 text-center"
              style={{ background: "#101010" }}
            >
              <p className="text-2xl sm:text-3xl md:text-4xl font-medium mb-1 sm:mb-2" style={{ color: "#E1E0CC" }}>
                {s.value}
              </p>
              <p className="text-gray-500 text-sm sm:text-base uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
