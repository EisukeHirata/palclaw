const ROWS = [
  { label: "Deploy time", palclaw: "< 60 seconds", manual: "60+ minutes" },
  { label: "Server setup", palclaw: "✅ Automated", manual: "❌ Manual SSH + config" },
  { label: "Openclaw install", palclaw: "✅ Pre-installed", manual: "❌ npm install + setup" },
  { label: "Channel config", palclaw: "✅ 1-click", manual: "❌ API keys + webhooks" },
  { label: "Updates", palclaw: "✅ Managed", manual: "❌ Manual" },
  { label: "Monitoring", palclaw: "✅ Dashboard", manual: "❌ Self-managed" },
];

export function ComparisonTable() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
            Palclaw vs. Manual Setup
          </h2>
          <p className="text-muted-foreground">
            Why spend an hour on DevOps when you could spend it learning?
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
