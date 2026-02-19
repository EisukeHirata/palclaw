"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Deployment {
  id: string;
  channel: string;
  model: string;
  status: string;
}

interface Agent {
  id: string;
  name: string;
  personality: string;
  goal: string;
  deployment_id: string;
  deployments?: Deployment;
  created_at: string;
}

interface AgentsContentProps {
  deployments: Deployment[];
  agents: Agent[];
}

const PERSONALITIES = [
  { id: "friendly", label: "😊 Friendly", description: "Encouraging and supportive" },
  { id: "strict", label: "💪 Strict", description: "Holds you accountable" },
  { id: "motivational", label: "🔥 Motivational", description: "High energy, push harder" },
];

const CHANNEL_ICONS: Record<string, string> = { telegram: "✈️", whatsapp: "💬" };
const MODEL_ICONS: Record<string, string> = { claude: "🧠", gpt: "⚡", gemini: "💡" };

export function AgentsContent({ deployments, agents: initialAgents }: AgentsContentProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ deployment_id: "", name: "", personality: "friendly", goal: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingId) {
        const res = await fetch(`/api/agents/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, personality: form.personality, goal: form.goal }),
        });
        if (!res.ok) throw new Error("Failed to update");
        const updated = await res.json();
        setAgents((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a)));
      } else {
        const res = await fetch("/api/agents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to create");
        const newAgent = await res.json();
        setAgents((prev) => [newAgent, ...prev]);
      }

      setShowForm(false);
      setEditingId(null);
      setForm({ deployment_id: "", name: "", personality: "friendly", goal: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(agent: Agent) {
    setForm({
      deployment_id: agent.deployment_id,
      name: agent.name,
      personality: agent.personality,
      goal: agent.goal,
    });
    setEditingId(agent.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this agent?")) return;
    await fetch(`/api/agents/${id}`, { method: "DELETE" });
    setAgents((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agents</h1>
          <p className="text-sm text-muted-foreground">Configure your AI learning companions</p>
        </div>
        {deployments.length > 0 && (
          <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ deployment_id: "", name: "", personality: "friendly", goal: "" }); }}>
            + New Agent
          </Button>
        )}
      </div>

      {/* Agent Form */}
      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Agent" : "Configure New Agent"}</CardTitle>
            <CardDescription>Set your agent&apos;s personality and learning goal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {!editingId && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Deployment</label>
                  <select
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form.deployment_id}
                    onChange={(e) => setForm((f) => ({ ...f, deployment_id: e.target.value }))}
                    required
                  >
                    <option value="">Select a deployment...</option>
                    {deployments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {CHANNEL_ICONS[d.channel]} {d.channel} — {MODEL_ICONS[d.model]} {d.model}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium">Agent Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="e.g. Sensei, Coach, Study Buddy"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Personality</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {PERSONALITIES.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, personality: p.id }))}
                      className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${
                        form.personality === p.id
                          ? "border-primary bg-violet-50"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="font-medium">{p.label}</div>
                      <div className="text-xs text-muted-foreground">{p.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Learning Goal</label>
                <textarea
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="e.g. Pass TOEIC 900 by June 2026. Currently at 750 level."
                  value={form.goal}
                  onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Save Changes" : "Create Agent"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Agents List */}
      {agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 text-5xl">🤖</div>
            <h3 className="mb-2 font-semibold">No agents configured</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {deployments.length === 0
                ? "Deploy an Openclaw instance first, then configure your agent."
                : "Create your first agent to start personalizing your AI coach."}
            </p>
            {deployments.length === 0 ? (
              <Link href="/#deploy">
                <Button>Deploy Openclaw</Button>
              </Link>
            ) : (
              <Button onClick={() => setShowForm(true)}>Create Agent</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <Badge variant="secondary" className="capitalize">
                    {agent.personality}
                  </Badge>
                </div>
                {agent.deployments && (
                  <CardDescription className="flex items-center gap-1">
                    <span>{CHANNEL_ICONS[agent.deployments.channel]}</span>
                    <span className="capitalize">{agent.deployments.channel}</span>
                    <span className="mx-1">·</span>
                    <span>{MODEL_ICONS[agent.deployments.model]}</span>
                    <span className="capitalize">{agent.deployments.model}</span>
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {agent.goal && (
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-3">{agent.goal}</p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(agent)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(agent.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
