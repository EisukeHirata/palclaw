const FEATURES = [
  {
    icon: "🎭",
    title: "Dynamic Personality",
    description:
      "Configure your agent's SOUL to be a strict coach, a gentle mentor, or anything in between. It adapts to your preferred learning style.",
  },
  {
    icon: "💓",
    title: "Proactive Check-ins",
    description:
      "Your agent doesn't just wait for prompts. It uses its HEARTBEAT to autonomously send scheduled nudges, review reminders, and progress reports.",
  },
  {
    icon: "🧠",
    title: "Structured Long-term Memory",
    description:
      "Never repeat yourself. Your agent retains your goals, deadlines, and weaknesses across all sessions in its MEMORY.",
  },
  {
    icon: "🎯",
    title: "Learning-Specific Skills",
    description:
      "Built-in tools for spaced repetition, daily goal tracking, and detailed weakness analysis to accelerate your growth.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description:
      "Your personal growth data is yours. Each deployment is isolated, ensuring your conversations never leave your own instance.",
  },
  {
    icon: "📱",
    title: "Chat Where You Are",
    description:
      "Seamless integration with Telegram (WhatsApp coming soon). Your trusted coach is always in your pocket, right where you already chat.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
            A coach that truly understands you
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            More than just a chatbot. Palclaw empowers you with Openclaw's deep personalization features.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
