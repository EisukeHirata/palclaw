"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Deployment {
  id: string;
  channel: string;
  model: string;
  status: string;
  render_service_url: string | null;
  openclaw_token: string | null;
  created_at: string;
}

interface Agent {
  id: string;
  name: string;
  personality: string;
  goal: string;
}

interface DashboardContentProps {
  user: User;
  deployments: Deployment[];
  agents: Agent[];
  activeDeploymentId?: string;
}

const STATUS_COLORS: Record<string, "default" | "warning" | "success" | "destructive" | "secondary"> = {
  running: "success",
  deploying: "warning",
  pending: "secondary",
  failed: "destructive",
};

const MODEL_ICONS: Record<string, string> = {
  claude: "🧠",
  gpt: "⚡",
  gemini: "💡",
};

const CHANNEL_ICONS: Record<string, string> = {
  telegram: "✈️",
  whatsapp: "💬",
};

export function DashboardContent({
  user,
  deployments,
  agents,
  activeDeploymentId,
}: DashboardContentProps) {
  const [liveDeployments, setLiveDeployments] = useState(deployments);

  // Poll for status updates on deploying instances
  useEffect(() => {
    const deploying = liveDeployments.filter((d) => d.status === "deploying" || d.status === "pending");
    if (deploying.length === 0) return;

    const interval = setInterval(async () => {
      const updated = await Promise.all(
        deploying.map(async (d) => {
          try {
            const res = await fetch(`/api/deploy/${d.id}`);
            if (res.ok) return await res.json();
          } catch {}
          return d;
        })
      );

      setLiveDeployments((prev) =>
        prev.map((d) => updated.find((u) => u.id === d.id) ?? d)
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [liveDeployments]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this deployment? This will shut down the Railway service and remove all associated agents.")) return;
    try {
      const res = await fetch(`/api/deploy/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setLiveDeployments((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const runningCount = liveDeployments.filter((d) => d.status === "running").length;
  const deployingCount = liveDeployments.filter((d) => d.status === "deploying" || d.status === "pending").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user.email?.split("@")[0]}
          </p>
        </div>
        <Link href="/#deploy">
          <Button className="gap-2">
            <span>🚀</span> New Deployment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{runningCount}</div>
            <div className="text-sm text-muted-foreground">Running Agents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">{deployingCount}</div>
            <div className="text-sm text-muted-foreground">Deploying</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{agents.length}</div>
            <div className="text-sm text-muted-foreground">Agents Configured</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">—</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Active deploy notification */}
      {activeDeploymentId && deployingCount > 0 && (
        <div className="mb-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <span className="animate-spin text-xl">⟳</span>
            <div>
              <div className="font-semibold text-yellow-800">Deployment in progress</div>
              <div className="text-sm text-yellow-700">
                Your Openclaw instance is being set up. This usually takes 1–2 minutes.
              </div>
            </div>
          </div>
          <Progress value={45} className="mt-3" />
        </div>
      )}

      {/* Deployments */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Deployments</h2>
          <Link href="/agents" className="text-sm text-primary hover:underline">
            Manage agents →
          </Link>
        </div>

        {liveDeployments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-5xl">🐾</div>
              <h3 className="mb-2 font-semibold">No deployments yet</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Deploy your first Openclaw instance to get started.
              </p>
              <Link href="/#deploy">
                <Button>Deploy Now</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveDeployments.map((d) => (
              <Card key={d.id} className={d.id === activeDeploymentId ? "ring-2 ring-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{CHANNEL_ICONS[d.channel] ?? "📡"}</span>
                      <CardTitle className="text-base capitalize">{d.channel}</CardTitle>
                    </div>
                    <Badge variant={STATUS_COLORS[d.status] ?? "secondary"}>
                      {d.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <span>{MODEL_ICONS[d.model]}</span>
                    <span className="capitalize">{d.model}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {d.status === "running" && d.render_service_url && (
                    <a
                      href={d.render_service_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline break-all"
                    >
                      {d.render_service_url}
                    </a>
                  )}
                  {(d.status === "deploying" || d.status === "pending") && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="animate-spin">⟳</span> Setting up...
                      </div>
                      <Progress value={30} />
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Deployed {new Date(d.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDelete(d.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/agents">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-5 pb-5">
                <span className="text-2xl">🤖</span>
                <div>
                  <div className="font-medium text-sm">Configure Agent</div>
                  <div className="text-xs text-muted-foreground">Set goals & personality</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/chats">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-5 pb-5">
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-medium text-sm">View Chats</div>
                  <div className="text-xs text-muted-foreground">See recent sessions</div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/#deploy">
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-3 pt-5 pb-5">
                <span className="text-2xl">➕</span>
                <div>
                  <div className="font-medium text-sm">Add Channel</div>
                  <div className="text-xs text-muted-foreground">Deploy another instance</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  );
}
