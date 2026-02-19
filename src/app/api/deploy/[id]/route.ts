import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getServiceStatus, deleteProject } from "@/lib/railway";

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

export async function DELETE(
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
    .select("id, render_service_id, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !deployment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Shut down Railway project (service + infra)
  if (deployment.render_service_id) {
    try {
      await deleteProject(deployment.render_service_id);
    } catch (err) {
      console.error("Railway delete failed:", err);
      // Continue with DB cleanup even if Railway fails
    }
  }

  // Delete related agents first (FK), then deployment
  await supabase.from("agents").delete().eq("deployment_id", id);
  await supabase.from("deployments").delete().eq("id", id);

  return new NextResponse(null, { status: 204 });
}
