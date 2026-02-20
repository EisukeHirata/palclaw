const ROWS = [
  { label: "Proactivity", palclaw: "✅ Proactive (HEARTBEAT nudges)", manual: "❌ Passive (Waits for prompts)" },
  { label: "Memory", palclaw: "✅ Structured goals & weaknesses", manual: "❌ Limited context window" },
  { label: "Personality", palclaw: "✅ Deeply customized (SOUL.md)", manual: "❌ One-size-fits-all" },
  { label: "Privacy", palclaw: "✅ 100% Private (Self-hosted)", manual: "❌ Cloud data collection" },
  { label: "Focus", palclaw: "✅ Your personal growth", manual: "❌ General assistance" },
];

export function ComparisonTable() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
            Openclaw Coach vs. Generic AI
          </h2>
          <p className="text-muted-foreground">
            Why settle for a generic assistant when you can have a dedicated coach?
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-4 text-left font-medium text-muted-foreground">Feature</th>
                <th className="p-4 text-center font-semibold text-primary">
                  🐾 Palclaw
                </th>
                <th className="p-4 text-center font-medium text-muted-foreground">
                  Manual Setup
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.label}
                  className={`border-b last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                >
                  <td className="p-4 font-medium">{row.label}</td>
                  <td className="p-4 text-center text-green-700 font-medium">{row.palclaw}</td>
                  <td className="p-4 text-center text-muted-foreground">{row.manual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
