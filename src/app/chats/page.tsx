import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/app-navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ChatsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: deployments } = await supabase
    .from("deployments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const CHANNEL_ICONS: Record<string, string> = { telegram: "✈️", whatsapp: "💬" };
  const MODEL_ICONS: Record<string, string> = { claude: "🧠", gpt: "⚡", gemini: "💡" };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Chats</h1>
          <p className="text-sm text-muted-foreground">
            Your chat sessions happen directly in Telegram or WhatsApp.
          </p>
        </div>

        {deployments && deployments.length > 0 ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
              💡 Conversations with your Openclaw agent happen in your connected messaging app.
              Click your deployment URL below to open the Openclaw dashboard.
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {deployments.map((d) => (
                <Card key={d.id}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{CHANNEL_ICONS[d.channel] ?? "📡"}</span>
                        <div>
                          <div className="font-semibold capitalize">{d.channel}</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{MODEL_ICONS[d.model]}</span>
                            <span className="capitalize">{d.model}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          d.status === "running"
                            ? "success"
                            : d.status === "failed"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {d.status}
                      </Badge>
                    </div>

                    {d.status === "running" && d.render_service_url ? (
                      <a
                        href={`${d.render_service_url}?token=${d.openclaw_token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        Open Openclaw Dashboard →
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {d.status === "deploying" || d.status === "pending"
                          ? "⟳ Setting up your instance..."
                          : "Deployment unavailable"}
                      </p>
                    )}

                    <div className="mt-3 text-xs text-muted-foreground">
                      Started {new Date(d.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-5xl">💬</div>
              <h3 className="mb-2 font-semibold">No active deployments</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Deploy your first Openclaw instance to start chatting.
              </p>
              <Link href="/#deploy">
                <Button>Deploy Now</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
