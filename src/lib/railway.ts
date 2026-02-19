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

const MODEL_ENV: Record<string, string> = {
  claude: "anthropic",
  gpt: "openai",
  gemini: "google",
};

interface CreateServiceParams {
  name: string;
  channel: string;
  model: string;
  userId: string;
}

export async function createOpenclaw(
  params: CreateServiceParams
): Promise<{ serviceId: string; serviceUrl: string; token: string }> {
  const token = generateToken();
  const projectName = `palclaw-${params.userId.slice(0, 8)}-${Date.now()}`;
  const repoUrl =
    process.env.RAILWAY_OPENCLAW_REPO ||
    "https://github.com/EisukeHirata/palclaw";

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

  // 2. Create service from GitHub repo
  const { serviceCreate } = await gql<{ serviceCreate: { id: string } }>(
    `mutation Create($input: ServiceCreateInput!) {
      serviceCreate(input: $input) { id }
    }`,
    {
      input: {
        projectId,
        name: "openclaw",
        source: { repo: repoUrl },
      },
    }
  );

  const serviceId = serviceCreate.id;

  // 3. Configure Dockerfile path
  await gql(
    `mutation Update($serviceId: String!, $environmentId: String!, $input: ServiceInstanceUpdateInput!) {
      serviceInstanceUpdate(serviceId: $serviceId, environmentId: $environmentId, input: $input)
    }`,
    {
      serviceId,
      environmentId: envId,
      input: {
        buildConfig: { dockerfilePath: "docker/Dockerfile" },
        numReplicas: 1,
      },
    }
  );

  // 4. Set environment variables
  await gql(
    `mutation Upsert($input: VariableCollectionUpsertInput!) {
      variableCollectionUpsert(input: $input)
    }`,
    {
      input: {
        projectId,
        environmentId: envId,
        serviceId,
        variables: {
          OPENCLAW_TOKEN: token,
          OPENCLAW_AI_PROVIDER: MODEL_ENV[params.model] || "anthropic",
          OPENCLAW_CHANNEL: params.channel,
          PORT: "18789",
        },
      },
    }
  );

  // 5. Create Railway domain
  const { serviceDomainCreate } = await gql<{
    serviceDomainCreate: { domain: string };
  }>(
    `mutation Domain($serviceId: String!, $environmentId: String!) {
      serviceDomainCreate(serviceId: $serviceId, environmentId: $environmentId) {
        domain
      }
    }`,
    { serviceId, environmentId: envId }
  );

  return {
    // Store as composite key: projectId::serviceId::envId
    serviceId: `${projectId}::${serviceId}::${envId}`,
    serviceUrl: `https://${serviceDomainCreate.domain}`,
    token,
  };
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
