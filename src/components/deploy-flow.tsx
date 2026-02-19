"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface DeployFlowProps {
  user: User | null;
}

type Channel = "telegram" | "whatsapp";
type Model = "claude" | "gpt" | "gemini";

const CHANNELS: { id: Channel; name: string; icon: string; description: string; available: boolean }[] = [
  { id: "telegram", name: "Telegram", icon: "✈️", description: "Most popular. Easy bot setup.", available: true },
  { id: "whatsapp", name: "WhatsApp", icon: "💬", description: "Connect via WhatsApp Business.", available: true },
];

const MODELS: { id: Model; name: string; icon: string; description: string; provider: string }[] = [
  { id: "claude", name: "Claude Sonnet 4.6", icon: "🧠", description: "Best reasoning & learning support", provider: "Anthropic" },
  { id: "gpt", name: "GPT-4o", icon: "⚡", description: "Fast and versatile", provider: "OpenAI" },
  { id: "gemini", name: "Gemini 2.0 Flash", icon: "💡", description: "Great for multilingual tasks", provider: "Google" },
];

export function DeployFlow({ user }: DeployFlowProps) {
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [model, setModel] = useState<Model>("claude");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleGoogleSignIn() {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) setError(error.message);
  }

  async function handleDeploy() {
    if (!user) {
      await handleGoogleSignIn();
      return;
    }
    if (!channel) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, model }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Deploy failed");
      }

      router.push(`/dashboard?deployment=${data.deploymentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="deploy" className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">Deploy in 3 Steps</h2>
          <p className="text-muted-foreground">No servers. No config. Just deploy.</p>
        </div>

        {/* Step indicator */}
        <div className="mb-10 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-12 transition-colors sm:w-20 ${
                    step > s ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Channel */}
        {step === 1 && (
          <div>
            <h3 className="mb-2 text-center text-xl font-semibold">Choose your channel</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Where should your AI coach reach you?
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                    channel === ch.id
                      ? "border-primary bg-violet-50"
                      : "border-border bg-white hover:border-primary/40"
                  } ${!ch.available ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!ch.available}
                >
                  <div className="mb-2 text-3xl">{ch.icon}</div>
                  <div className="font-semibold">{ch.name}</div>
                  <div className="text-sm text-muted-foreground">{ch.description}</div>
                  {!ch.available && (
                    <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      Coming soon
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)} disabled={!channel}>
                Next: Choose Model →
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Model */}
        {step === 2 && (
          <div>
            <h3 className="mb-2 text-center text-xl font-semibold">Choose your AI model</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Your agent will use this model for all conversations.
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`rounded-xl border-2 p-5 text-left transition-all hover:shadow-md ${
                    model === m.id
                      ? "border-primary bg-violet-50"
                      : "border-border bg-white hover:border-primary/40"
                  }`}
                >
                  <div className="mb-2 text-3xl">{m.icon}</div>
                  <div className="font-semibold text-sm">{m.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{m.provider}</div>
                  <div className="mt-2 text-xs text-muted-foreground">{m.description}</div>
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next: Deploy →
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Deploy */}
        {step === 3 && (
          <div>
            <h3 className="mb-2 text-center text-xl font-semibold">Ready to deploy!</h3>
            <p className="mb-6 text-center text-sm text-muted-foreground">
              Review your config and hit Deploy.
            </p>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Channel</span>
                    <span className="font-medium capitalize">
                      {CHANNELS.find((c) => c.id === channel)?.icon}{" "}
                      {CHANNELS.find((c) => c.id === channel)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">AI Model</span>
                    <span className="font-medium">
                      {MODELS.find((m) => m.id === model)?.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Hosting</span>
                    <span className="font-medium">Render (Docker)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Deploy time</span>
                    <span className="font-medium text-green-600">~60 seconds</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {user ? (
                <Button
                  size="lg"
                  className="w-full gap-2 text-base"
                  onClick={handleDeploy}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⟳</span> Deploying...
                    </>
                  ) : (
                    <>🚀 Deploy Now</>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full gap-2 text-base"
                  onClick={handleGoogleSignIn}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google & Deploy
                </Button>
              )}
            </div>

            <div className="mt-4 flex justify-start">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                ← Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
