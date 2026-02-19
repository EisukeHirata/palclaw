import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/app-navbar";
import { AgentsContent } from "@/components/agents-content";

export default async function AgentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: deployments } = await supabase
    .from("deployments")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "running")
    .order("created_at", { ascending: false });

  const { data: agents } = await supabase
    .from("agents")
    .select("*, deployments(status, channel, model)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <AgentsContent deployments={deployments ?? []} agents={agents ?? []} />
    </div>
  );
}
