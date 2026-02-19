import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
          🚀 Deploy in under 60 seconds
        </Badge>

        <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Your AI Companion for{" "}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Learning & Habits
          </span>
        </h1>

        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Deploy Openclaw — a self-hosted AI agent — directly to Telegram or WhatsApp with one click.
          No servers, no SSH, no config. Just a personal AI coach ready to help you achieve your goals.
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
