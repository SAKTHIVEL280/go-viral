"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowRight } from "lucide-react";
import { WordsPullUpMultiStyle } from "@/components/words-pull-up-multi-style";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

const featureCards = [
  {
    number: "01",
    title: "Virality Score.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85",
    items: [
      "0 to 100 composite score across 5 dimensions",
      "Platform-specific weighting for TikTok, Instagram, and Shorts",
      "Instant results powered by Gemini 1.5 Flash",
      "Full breakdown with actionable suggestions per dimension",
    ],
  },
  {
    number: "02",
    title: "Hook Analysis.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85",
    items: [
      "AI reads your first 3 seconds for scroll-stopping power",
      "Caption strength, CTA presence, and emoji scoring",
      "Groq-powered suggestion rewrites for maximum impact",
    ],
  },
  {
    number: "03",
    title: "Creator Toolkit.",
    icon: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85",
    items: [
      "10 to 15 platform-specific hashtags generated per upload",
      "Audio style recommendations matched to your content",
      "Full analysis history to track your improvement over time",
    ],
  },
];

const steps = [
  { n: "01", title: "Upload your content", body: "Drop a video, image, or paste a caption. We support MP4, MOV, WebM, JPG, PNG, and more." },
  { n: "02", title: "Select your platform", body: "Choose TikTok, Instagram, or YouTube Shorts. Scoring weights adapt to each algorithm." },
  { n: "03", title: "Get your score", body: "Receive a 0 to 100 virality score with a full breakdown and specific suggestions in under 30 seconds." },
];

const platforms = [
  { name: "TikTok",         desc: "Short-form vertical video. Hook weight at 35%.",         tag: "15s to 7min" },
  { name: "Instagram",      desc: "Reels, Stories, and feed posts. Visual weight at 30%.",   tag: "Reels and Posts" },
  { name: "YouTube Shorts", desc: "Vertical shorts up to 7 minutes. Pacing weight at 30%.", tag: "Up to 7min" },
];

export function FeaturesSection() {
  const featuresRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const platformsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {

      // Feature cards — stagger in from bottom
      const cards = cardsRef.current?.querySelectorAll("[data-card]");
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Steps — stagger in
      const stepEls = stepsRef.current?.querySelectorAll("[data-step]");
      if (stepEls) {
        gsap.fromTo(
          stepEls,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: stepsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Platform cards
      const platformEls = platformsRef.current?.querySelectorAll("[data-platform]");
      if (platformEls) {
        gsap.fromTo(
          platformEls,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: platformsRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // CTA strip
      gsap.fromTo(
        ctaRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

    }, featuresRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={featuresRef}>

      {/* Features grid */}
      <section id="features" className="bg-black relative py-16 sm:py-20 md:py-32 px-3 sm:px-4 md:px-6">
        <div className="bg-noise absolute inset-0 opacity-[0.15] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          <div className="mb-10 sm:mb-12 md:mb-16 text-center px-2">
            <WordsPullUpMultiStyle
              segments={[{ text: "Studio-grade analysis for visionary creators.", className: "text-primary" }]}
              containerClassName="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal mb-2 sm:mb-3"
              delay={0}
            />
            <WordsPullUpMultiStyle
              segments={[{ text: "Built for pure vision. Powered by AI.", className: "text-gray-500" }]}
              containerClassName="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-normal"
              delay={0.2}
            />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">

            {/* Video card */}
            <div
              data-card
              className="relative rounded-2xl overflow-hidden h-64 sm:h-72 lg:h-auto lg:min-h-[320px]"
              style={{ opacity: 0 }}
            >
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4"
                autoPlay loop muted playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "rgba(225,224,204,0.5)" }}>
                  Your canvas
                </p>
                <p className="font-medium text-sm sm:text-base" style={{ color: "#E1E0CC" }}>
                  Your creative canvas.
                </p>
              </div>
            </div>

            {/* Feature cards */}
            {featureCards.map((card) => (
              <div
                key={card.number}
                data-card
                className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
                style={{ background: "#212121", minHeight: "320px", opacity: 0 }}
              >
                <div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden mb-5 sm:mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.icon} alt="" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-primary/40 text-sm mb-1">{card.number}</p>
                  <h3 className="text-base sm:text-lg md:text-xl font-medium mb-4 sm:mb-5" style={{ color: "#E1E0CC" }}>
                    {card.title}
                  </h3>
                  <ul className="space-y-2.5 sm:space-y-3">
                    {card.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-2.5">
                        <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary flex-shrink-0 mt-1" />
                        <span className="text-gray-400 text-base leading-snug">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-5" style={{ borderTop: "1px solid rgba(225,224,204,0.06)" }}>
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 text-sm transition-colors duration-200 group"
                    style={{ color: "rgba(225,224,204,0.5)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225,224,204,0.5)")}
                  >
                    Get started
                    <ArrowRight
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      style={{ transform: "rotate(-45deg)" }}
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-black py-16 sm:py-20 md:py-28 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 sm:mb-14">
            <p className="text-primary/40 text-sm sm:text-base uppercase tracking-widest mb-3 sm:mb-4">Process</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium" style={{ color: "#E1E0CC" }}>
              Three steps to viral.
            </h2>
          </div>

          <div
            ref={stepsRef}
            className="grid grid-cols-1 sm:grid-cols-3 gap-px"
            style={{ background: "rgba(225,224,204,0.06)" }}
          >
            {steps.map((step) => (
              <div
                key={step.n}
                data-step
                className="px-5 sm:px-7 md:px-8 py-8 sm:py-10"
                style={{ background: "#000", opacity: 0 }}
              >
                <p className="text-primary/30 text-sm uppercase tracking-widest mb-4 sm:mb-6">{step.n}</p>
                <h3 className="text-base sm:text-lg md:text-xl font-medium mb-3" style={{ color: "#E1E0CC" }}>
                  {step.title}
                </h3>
                <p className="text-gray-500 text-base leading-relaxed font-light">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section id="platforms" className="bg-black py-16 sm:py-20 md:py-28 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10 sm:mb-14">
            <p className="text-primary/40 text-sm sm:text-base uppercase tracking-widest mb-3 sm:mb-4">Platforms</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium" style={{ color: "#E1E0CC" }}>
              Built for every algorithm.
            </h2>
          </div>

          <div
            ref={platformsRef}
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3"
          >
            {platforms.map((p) => (
              <div
                key={p.name}
                data-platform
                className="rounded-2xl p-5 sm:p-6 md:p-8"
                style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.05)", opacity: 0 }}
              >
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-medium" style={{ color: "#E1E0CC" }}>{p.name}</h3>
                  <span
                    className="text-xs sm:text-sm uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ml-2"
                    style={{ background: "rgba(225,224,204,0.06)", color: "rgba(225,224,204,0.4)" }}
                  >
                    {p.tag}
                  </span>
                </div>
                <p className="text-gray-500 text-base leading-relaxed font-light">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-black py-16 sm:py-20 md:py-28 px-3 sm:px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={ctaRef}
            className="rounded-2xl md:rounded-[2rem] px-6 sm:px-10 md:px-16 py-12 sm:py-16 md:py-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8"
            style={{ background: "#101010", border: "1px solid rgba(225,224,204,0.06)", opacity: 0 }}
          >
            <div className="max-w-lg">
              <p className="text-primary/40 text-sm sm:text-base uppercase tracking-widest mb-3 sm:mb-4">Start now</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight" style={{ color: "#E1E0CC" }}>
                Your next post deserves to be seen.
              </h2>
              <p className="text-gray-500 text-base mt-3 sm:mt-4 font-light leading-relaxed max-w-sm">
                Free forever. Powered by Gemini and Groq. No credit card required and no limits on analysis quality.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/auth"
                className="group inline-flex items-center gap-2 hover:gap-3 bg-primary rounded-full pl-5 pr-1.5 py-1.5 transition-all duration-300"
              >
                <span className="text-black font-medium text-sm sm:text-base whitespace-nowrap">Get your score</span>
                <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ArrowRight className="w-4 h-4 text-primary" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-3 sm:px-4 md:px-6 pb-8 sm:pb-10">
        <div
          className="max-w-6xl mx-auto pt-8 sm:pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(225,224,204,0.06)" }}
        >
          <div>
            <p className="text-primary/60 text-base font-medium">GoViral</p>
            <p className="text-gray-600 text-base mt-1">AI-powered virality analysis. Free forever.</p>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-gray-600 hover:text-primary/60 text-base transition-colors duration-200"
              >
                {item}
              </Link>
            ))}
          </div>
          <p className="text-gray-700 text-base">2026 GoViral. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
