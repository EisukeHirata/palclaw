import crypto from "crypto";

const RAILWAY_GQL = "https://backboard.railway.app/graphql/v2";

async function gql<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(RAILWAY_GQL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RAILWAY_API_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Railway API: ${json.errors[0].message}`);
  }
  return json.data as T;
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Our model id → openclaw model name
const MODEL_NAMES: Record<string, string> = {
  claude: "claude-sonnet-4-6",
  gpt: "gpt-4o",
  gemini: "gemini-2.0-flash",
};

// Our model id → env var name for the API key
const MODEL_API_KEY_ENV: Record<string, string> = {
  claude: "ANTHROPIC_API_KEY",
  gpt: "OPENAI_API_KEY",
  gemini: "GOOGLE_API_KEY",
};

interface CreateServiceParams {
  name: string;
  channel: string;
  model: string;
  userId: string;
  botToken?: string;
}

/**
 * Build openclaw.json config for headless deployment.
 * Docs: https://docs.openclaw.ai/gateway/configuration
 */
function buildOpenclawConfig(params: {
  channel: string;
  model: string;
  botToken?: string;
}): string {
  const config: Record<string, unknown> = {
    agents: {
      defaults: {
        model: {
          primary: MODEL_NAMES[params.model] || "claude-sonnet-4-6",
        },
      },
    },
    channels: {} as Record<string, unknown>,
  };

  if (params.channel === "telegram") {
    (config.channels as Record<string, unknown>).telegram = {
      enabled: true,
      botToken: params.botToken || "",
      dmPolicy: "open",
    };
  }

  return JSON.stringify(config);
}

export async function createOpenclaw(
  params: CreateServiceParams
): Promise<{ serviceId: string; serviceUrl: string; token: string }> {
  const token = generateToken();
  const projectName = `palclaw-${params.userId.slice(0, 8)}-${Date.now()}`;
  const imageUrl =
    process.env.RAILWAY_OPENCLAW_IMAGE || "node:22";

  // Build the openclaw.json config, base64-encode to avoid all shell quoting issues
  const configJson = buildOpenclawConfig({
    channel: params.channel,
    model: params.model,
    botToken: params.botToken,
  });
  const configBase64 = Buffer.from(configJson).toString("base64");

  // 1. Create project
  const { projectCreate } = await gql<{
    projectCreate: {
      id: string;
      environments: { edges: { node: { id: string; name: string } }[] };
    };
  }>(
    `mutation Create($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        id
        environments { edges { node { id name } } }
      }
    }`,
    { input: { name: projectName } }
  );

  const projectId = projectCreate.id;
  const envId = projectCreate.environments.edges[0].node.id;

  // 2. Create service from Docker image
  const { serviceCreate } = await gql<{ serviceCreate: { id: string } }>(
    `mutation Create($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id }
    }`,
    {
      input: {
        projectId,
        name: "openclaw",
        source: { image: imageUrl },
      },
    }
  );

  const serviceId = serviceCreate.id;

  // 3. Configure service instance with startup command
  await gql(
    `mutation Update($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) {
      serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input)
    }`,
    {
      serviceId,
      environmentId: envId,
      input: {
        numReplicas: 1,
        // sh -c wrapper is required for Railway to execute && chains.
        // Config is base64-encoded to avoid all quoting issues.
        startCommand: `sh -c "apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/* && npm install -g openclaw@latest && mkdir -p /root/.openclaw && echo $OPENCLAW_CONFIG_B64 | base64 -d > /root/.openclaw/openclaw.json && openclaw gateway --port 18789"`,
      },
    }
  );

  // 4. Set environment variables
  const apiKeyEnv = MODEL_API_KEY_ENV[params.model];
  const apiKeyValue = apiKeyEnv ? process.env[apiKeyEnv] || "" : "";

  const variables: Record<string, string> = {
    OPENCLAW_CONFIG_B64: configBase64,
    PORT: "18789",
  };

  // AI provider API key (openclaw reads natively from env)
  if (apiKeyEnv && apiKeyValue) {
    variables[apiKeyEnv] = apiKeyValue;
  }

  // Telegram bot token (openclaw reads natively as fallback)
  if (params.botToken) {
    variables.TELEGRAM_BOT_TOKEN = params.botToken;
  }

  await gql(
    `mutation Upsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }`,
    {
      input: {
        projectId,
        environmentId: envId,
        serviceId,
        variables,
        skipDeploys: true,
      },
    }
  );

  // 5. Create Railway domain
  const { serviceDomainCreate } = await gql<{
    serviceDomainCreate: { domain: string };
  }>(
    `mutation Domain($input: ServiceDomainCreateInput!) {
      serviceDomainCreate(input: $input) {
        domain
      }
    }`,
    { input: { serviceId, environmentId: envId } }
  );

  // 6. Trigger first deployment
  await gql(
    `mutation Redeploy($serviceId: String!, $environmentId: String!) {
      serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
    }`,
    { serviceId, environmentId: envId }
  );

  return {
    serviceId: `${projectId}::${serviceId}::${envId}`,
    serviceUrl: `https://${serviceDomainCreate.domain}`,
    token,
  };
}

export async function deleteProject(compositeId: string): Promise<void> {
  const parts = compositeId.split("::");
  if (parts.length < 3) return;
  const [projectId] = parts;

  await gql(
    `mutation Delete($id: String!) {
      projectDelete(id: $id)
    }`,
    { id: projectId }
  );
}

export async function getServiceStatus(compositeId: string): Promise<string> {
  const parts = compositeId.split("::");
  if (parts.length < 3) return "unknown";
  const [, serviceId, envId] = parts;

  try {
    const data = await gql<{
      serviceInstance: {
        latestDeployment: { status: string } | null;
      } | null;
    }>(
      `query Status($serviceId: String!, $environmentId: String!) {
        serviceInstance(serviceId: $serviceId, environmentId: $environmentId) {
          latestDeployment { status }
        }
      }`,
      { serviceId, environmentId: envId }
    );

    const status =
      data.serviceInstance?.latestDeployment?.status ?? "BUILDING";

    const map: Record<string, string> = {
      SUCCESS: "running",
      DEPLOYING: "deploying",
      BUILDING: "deploying",
      INITIALIZING: "deploying",
      FAILED: "failed",
      CRASHED: "failed",
      REMOVED: "failed",
    };
    return map[status] ?? "deploying";
  } catch {
    return "deploying";
  }
}
