import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNavbar } from "@/components/app-navbar";
import { DashboardContent } from "@/components/dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ deployment?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { deployment: deploymentId } = await searchParams;

  const { data: deployments } = await supabase
    .from("deployments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <DashboardContent
        user={user}
        deployments={deployments ?? []}
        agents={agents ?? []}
        activeDeploymentId={deploymentId}
      />
    </div>
  );
}
