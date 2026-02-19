import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceStatus } from "@/lib/railway";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: deployment, error } = await supabase
    .from("deployments")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !deployment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Poll Railway for live status if we have a service ID
  if (deployment.render_service_id && deployment.status === "deploying") {
    const liveStatus = await getServiceStatus(deployment.render_service_id);

    if (liveStatus !== deployment.status) {
      await supabase
        .from("deployments")
        .update({ status: liveStatus, updated_at: new Date().toISOString() })
        .eq("id", id);

      deployment.status = liveStatus;
    }
  }

  return NextResponse.json(deployment);
}
