#!/bin/sh
set -e

# 1. Decode openclaw config from env
echo "$OPENCLAW_CONFIG_B64" | base64 -d > /root/.openclaw/openclaw.json
chmod 600 /root/.openclaw/openclaw.json

# 2. Start gateway in background
openclaw gateway --port 18789 &
GW_PID=$!

# 3. Wait for gateway to initialize and create its files
sleep 5

# 4. Write auth AFTER gateway has created its directories/files
node -e '
const fs = require("fs");
const path = require("path");

const auth = {};
if (process.env.ANTHROPIC_API_KEY) auth.anthropic = { apiKey: process.env.ANTHROPIC_API_KEY };
if (process.env.OPENAI_API_KEY) auth.openai = { apiKey: process.env.OPENAI_API_KEY };
if (process.env.GEMINI_API_KEY) auth.google = { apiKey: process.env.GEMINI_API_KEY };

const content = JSON.stringify(auth, null, 2);

// Find all auth files that gateway created and overwrite them
const { execSync } = require("child_process");
const files = execSync("find /root/.openclaw -name \"auth*json\" 2>/dev/null || true").toString().trim().split("\n").filter(Boolean);
console.log("[entrypoint] Found auth files:", files);

for (const f of files) {
  fs.writeFileSync(f, content);
  fs.chmodSync(f, 0o600);
  console.log("[entrypoint] Wrote auth to:", f);
}

// Also write to known paths in case they do not exist yet
const knownPaths = [
  "/root/.openclaw/agents/main/agent/auth-profiles.json",
  "/root/.openclaw/agents/main/agent/auth.json"
];
for (const p of knownPaths) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
  fs.chmodSync(p, 0o600);
}

console.log("[entrypoint] Auth configured with providers:", Object.keys(auth).join(", "));
'

# 5. Wait for gateway process
wait $GW_PID
