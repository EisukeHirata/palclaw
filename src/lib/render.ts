import crypto from "crypto";

const RENDER_API_BASE = "https://api.render.com/v1";

interface CreateServiceParams {
  name: string;
  channel: string;
  model: string;
  userId: string;
}

interface RenderService {
  id: string;
  name: string;
  serviceDetails: {
    url: string;
  };
}

export function generateOpencawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createOpenclaw(
  params: CreateServiceParams
): Promise<{ serviceId: string; serviceUrl: string; token: string }> {
  const token = generateOpencawToken();
  const serviceName = `palclaw-${params.userId.slice(0, 8)}-${Date.now()}`;

  const modelEnvMap: Record<string, string> = {
    claude: "anthropic",
    gpt: "openai",
    gemini: "google",
  };

  const body = {
    type: "web_service",
    name: serviceName,
    ownerId: process.env.RENDER_OWNER_ID,
    image: {
      imagePath: process.env.RENDER_OPENCLAW_IMAGE || "docker.io/openclaw/openclaw:latest",
    },
    serviceDetails: {
      plan: "starter",
      region: "oregon",
      env: "image",
      numInstances: 1,
      healthCheckPath: "/",
    },
    envVars: [
      { key: "OPENCLAW_TOKEN", value: token },
      { key: "OPENCLAW_AI_PROVIDER", value: modelEnvMap[params.model] || "anthropic" },
      { key: "OPENCLAW_CHANNEL", value: params.channel },
      { key: "OPENCLAW_GATEWAY_PORT", value: "18789" },
      { key: "PORT", value: "18789" },
    ],
  };

  const res = await fetch(`${RENDER_API_BASE}/services`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Render API error: ${res.status} ${error}`);
  }

  const data: RenderService = await res.json();

  return {
    serviceId: data.id,
    serviceUrl: data.serviceDetails?.url ?? `https://${serviceName}.onrender.com`,
    token,
  };
}

export async function getServiceStatus(serviceId: string): Promise<string> {
  const res = await fetch(`${RENDER_API_BASE}/services/${serviceId}`, {
    headers: {
      Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) return "unknown";

  const data = await res.json();
  const state: string = data.serviceDetails?.runningStatus ?? data.status ?? "unknown";

  const map: Record<string, string> = {
    live: "running",
    deploying: "deploying",
    building: "deploying",
    failed: "failed",
    suspended: "failed",
  };

  return map[state.toLowerCase()] ?? "deploying";
}
