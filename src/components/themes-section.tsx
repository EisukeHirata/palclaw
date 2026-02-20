import { Bot, Dumbbell, Brain, Target, Compass, Briefcase } from "lucide-react";

const THEMES = [
  {
    icon: <Bot className="h-6 w-6 text-blue-500" />,
    title: "Language Learning",
    description: "Daily vocabulary habits, speaking practice, and grammar corrections tailored to your level.",
    color: "bg-blue-50 border-blue-100",
  },
  {
    icon: <Dumbbell className="h-6 w-6 text-orange-500" />,
    title: "Fitness & Health",
    description: "Custom workout routines, diet tracking, and hydration nudges to keep you in shape.",
    color: "bg-orange-50 border-orange-100",
  },
  {
    icon: <Brain className="h-6 w-6 text-purple-500" />,
    title: "Skill Acquisition",
    description: "Learn programming, design, or any new skill with a structured curriculum and spaced repetition.",
    color: "bg-purple-50 border-purple-100",
  },
  {
    icon: <Target className="h-6 w-6 text-red-500" />,
    title: "Productivity & Focus",
    description: "Time management techniques, anti-procrastination check-ins, and Pomodoro timer integration.",
    color: "bg-red-50 border-red-100",
  },
  {
    icon: <Compass className="h-6 w-6 text-teal-500" />,
    title: "Mental Wellness",
    description: "Daily journaling prompts, mindfulness reminders, and safe reflection sessions.",
    color: "bg-teal-50 border-teal-100",
  },
  {
    icon: <Briefcase className="h-6 w-6 text-emerald-500" />,
    title: "Career Growth",
    description: "Interview prep, networking goals, and professional reading habits to advance your career.",
    color: "bg-emerald-50 border-emerald-100",
  },
];

export function ThemesSection() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold sm:text-4xl">
            What will you improve today?
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Openclaw is pre-configured to adapt to almost any personal growth goal. Here are a few ways our users are growing.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEMES.map((theme) => (
            <div
              key={theme.title}
              className={`flex flex-col rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-md ${theme.color}`}
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                {theme.icon}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                {theme.title}
              </h3>
              <p className="text-muted-foreground">
                {theme.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
