import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOpenclaw } from "@/lib/railway";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { channel, model } = body as { channel: string; model: string };

  if (!channel || !model) {
    return NextResponse.json({ error: "channel and model are required" }, { status: 400 });
  }

  // Save deployment as pending
  const { data: deployment, error: dbError } = await supabase
    .from("deployments")
    .insert({
      user_id: user.id,
      channel,
      model,
      status: "pending",
    })
    .select()
    .single();

  if (dbError || !deployment) {
    return NextResponse.json({ error: dbError?.message ?? "DB error" }, { status: 500 });
  }

  try {
    const { serviceId, serviceUrl, token } = await createOpenclaw({
      name: `palclaw-${deployment.id}`,
      channel,
      model,
      userId: user.id,
    });

    const { error: updateError } = await supabase
      .from("deployments")
      .update({
        render_service_id: serviceId,
        render_service_url: serviceUrl,
        openclaw_token: token,
        status: "deploying",
      })
      .eq("id", deployment.id);

    if (updateError) {
      console.error("Failed to update deployment:", updateError);
    }

    return NextResponse.json({
      deploymentId: deployment.id,
      serviceId,
      serviceUrl,
      status: "deploying",
    });
  } catch (err) {
    await supabase
      .from("deployments")
      .update({ status: "failed" })
      .eq("id", deployment.id);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deploy failed" },
      { status: 500 }
    );
  }
}
