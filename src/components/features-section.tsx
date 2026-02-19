const FEATURES = [
  {
    icon: "⚡",
    title: "1-Click Deploy",
    description:
      "No servers, no SSH, no config files. Select your channel and model, hit deploy. Your AI coach is live in under 60 seconds.",
  },
  {
    icon: "🎯",
    title: "Learning-Focused",
    description:
      "Built on Openclaw's powerful agent system. Preconfigured for study sessions, goal tracking, spaced repetition, and daily check-ins.",
  },
  {
    icon: "📱",
    title: "Chat Where You Are",
    description:
      "Works directly in Telegram and WhatsApp. No new apps to install — your AI coach lives in the messenger you already use.",
  },
  {
    icon: "🔒",
    title: "Private & Secure",
    description:
      "Each deployment is isolated in its own container. Your conversations and data never leave your own Render instance.",
  },
  {
    icon: "🤖",
    title: "Powered by Top AI",
    description:
      "Choose Claude, GPT-4o, or Gemini as your model. Switch anytime from the dashboard without redeploying.",
  },
  {
    icon: "📈",
    title: "Progress Tracking",
    description:
      "Your agent remembers your goals, tracks streaks, and sends proactive nudges when you need them most.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-gray-50 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
            Everything you need to grow
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Palclaw handles all the infrastructure so you can focus on learning.
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
