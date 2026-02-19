# 🐾 Palclaw

Deploy Openclaw — your AI learning companion — in 1 click.

## What is Palclaw?

Palclaw is a platform that lets you deploy [Openclaw](https://openclaw.ai) (an open-source autonomous AI agent) to Telegram or WhatsApp with a single click. Powered by Render for hosting, Supabase for auth/database, and Vercel for the frontend.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Auth & Database**: Supabase (Google OAuth, Postgres)
- **AI Agent Hosting**: Render (Docker)
- **Deployment**: Vercel

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd palclaw
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API |
| `RENDER_API_KEY` | Render Dashboard → Account Settings → API Keys |
| `RENDER_OWNER_ID` | Render Dashboard → Account Settings → Account ID |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` for local |

### 3. Set up Supabase

Run the migration in your Supabase SQL editor:
`supabase/migrations/001_initial.sql`

Enable Google OAuth in: Supabase Dashboard → Authentication → Providers → Google

Set redirect URL to: `https://your-project.supabase.co/auth/v1/callback`

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
vercel --prod
```

Set all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── dashboard/page.tsx    # Dashboard
│   ├── agents/page.tsx       # Agent management
│   ├── chats/page.tsx        # Chat sessions
│   ├── auth/callback/        # OAuth callback
│   └── api/
│       ├── deploy/           # Deploy API
│       └── agents/           # Agents API
├── components/
│   ├── deploy-flow.tsx       # 3-step deploy UI
│   ├── dashboard-content.tsx # Dashboard client
│   ├── agents-content.tsx    # Agents client
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── supabase/             # Supabase clients
│   └── render.ts             # Render API integration
supabase/
└── migrations/001_initial.sql
```

## License

MIT
