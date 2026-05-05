"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { WordsPullUp } from "@/components/words-pull-up";

export function HeroSection() {
  const descRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        descRef.current,
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" },
        0.5
      )
        .fromTo(
          ctaRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          0.7
        )
        .fromTo(
          badgeRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6, ease: "power2.out" },
          0.9
        );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="h-screen p-3 sm:p-4 md:p-6">
      <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden">

        {/* Background video */}
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Noise overlay */}
        <div className="noise-overlay absolute inset-0 opacity-[0.7] mix-blend-overlay pointer-events-none" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-12 items-end">

          {/* Giant heading */}
          <div className="col-span-12 lg:col-span-8 px-4 sm:px-5 md:px-6 pb-0 md:pb-2">
            <h1
              className="font-medium leading-[0.85] tracking-[-0.07em] select-none"
              style={{ fontSize: "clamp(16vw, 20vw, 22vw)", color: "#E1E0CC" }}
            >
              <WordsPullUp text="GoViral" showAsterisk delay={0.1} />
            </h1>
          </div>

          {/* Right col */}
          <div className="col-span-12 lg:col-span-4 px-4 sm:px-5 md:px-6 pb-6 sm:pb-8 md:pb-10 flex flex-col gap-4 sm:gap-5">
            <p
              ref={descRef}
              className="text-primary/70 text-base sm:text-lg max-w-xs"
              style={{ lineHeight: 1.5, opacity: 0 }}
            >
              GoViral is an AI-powered virality analyzer for creators worldwide. Not defined by platform or follower count, but by the hunger to unlock their content&apos;s full potential.
            </p>

            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
              style={{ opacity: 0 }}
            >
              <Link
                href="/auth"
                className="group inline-flex items-center gap-2 hover:gap-3 bg-primary rounded-full pl-4 sm:pl-5 pr-1.5 py-1.5 transition-all duration-300"
              >
                <span className="text-black font-medium text-sm sm:text-base whitespace-nowrap">
                  Analyze my content
                </span>
                <span className="bg-black rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </span>
              </Link>
              <span ref={badgeRef} className="text-primary/30 text-sm hidden sm:block" style={{ opacity: 0 }}>
                Free forever
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
