"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const WORDS = [
  "Self-Improvement",
  "Career Success",
  "Language Learning",
  "Health & Wellness",
  "Goal Achievement",
  "Productivity",
];

function WordRotator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % WORDS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="relative inline-block min-w-[600px] text-center align-bottom h-[1.1em]">
      {WORDS.map((word, i) => (
        <span
          key={word}
          className={`absolute inset-x-0 top-0 transition-all duration-500 ease-in-out whitespace-nowrap ${
            i === index
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8 pointer-events-none"
          } bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent`}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 to-white px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 overflow-hidden"
      >
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-100/50 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <Badge className="mb-6 inline-flex bg-violet-100 text-violet-700 border-violet-200">
          🌱 Your Personal Growth Engine
        </Badge>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl min-h-[1.2em]">
          Meet Your AI Coach for{" "}
          <WordRotator />
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Deploy Openclaw — your private, self-hosted AI companion — directly to Telegram.
          Customize its personality (SOUL), set long-term goals (MEMORY), and let it proactively coach you (HEARTBEAT).
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="#deploy">
            <Button size="lg" className="gap-2 px-8 text-base">
              <span>🐾</span> Deploy Your Palclaw
            </Button>
          </Link>
          <a
            href="https://openclaw.ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="text-base">
              What is Openclaw?
            </Button>
          </a>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-center sm:gap-8">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> No credit card required
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> MIT Licensed & Open Source
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Runs on Render
          </div>
        </div>
      </div>
    </section>
  );
}
