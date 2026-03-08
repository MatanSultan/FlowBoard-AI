# FlowBoard AI

AI-powered project planning on a clean Kanban board.

FlowBoard AI is a full-stack SaaS Kanban app that lets you create projects, manage tasks with drag-and-drop, and generate (or improve) tasks using AI. All data is protected with Supabase Auth + Row Level Security (RLS), scoped per user.

**Live Demo:** https://flow-board-ai.vercel.app

---

## Why this project stands out

- **Production-style security:** Supabase **RLS** enforces per-user data isolation at the database layer.
- **Modern Next.js architecture:** Next.js 15 App Router + Server Actions for clean, scalable patterns.
- **AI done responsibly:** AI endpoints return **strict JSON** validated with **Zod** (robust parsing + error handling).
- **Great UX:** Drag-and-drop Kanban with optimistic updates and a polished shadcn/ui interface.

---

## Features

- **Auth** (Supabase): Email/password + session handling + protected routes
- **Projects:** Create & delete projects (scoped by RLS)
- **Kanban board:** 3 columns (To Do / In Progress / Done) with drag-and-drop
- **Tasks:** Create / edit / delete tasks, set priority, tags, and details
- **AI task generation:** Turn a plain-English goal into 3–6 actionable tasks
- **AI task improvement:** Rewrite a task into a clearer, more actionable version
- **Dark mode:** System-aware theme toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Actions) |
| Language | TypeScript |
| Database/Auth | Supabase (PostgreSQL + Auth + RLS) |
| UI | Tailwind CSS + shadcn/ui |
| AI | Vercel AI SDK + Groq |
| Drag & Drop | @hello-pangea/dnd |
| Notifications | Sonner |
| Deployment | Vercel |

---
## Architecture Overview

```
app/
  page.tsx              # Landing page (public)
  auth/
    login/              # Sign in form
    sign-up/            # Sign up form
    callback/           # Supabase auth redirect handler
    error/              # Auth error display
  dashboard/            # Protected: project list
  board/[id]/           # Protected: kanban board for a project
  settings/             # Protected: user profile
  api/
    generate-tasks/     # POST: AI task generation (Groq)
    improve-task/       # POST: AI task improvement (Groq)

components/
  app-navbar.tsx        # Server component: user avatar, nav, sign-out
  kanban-board.tsx      # Client: DnD board with optimistic updates
  task-card.tsx         # Client: draggable card + Sheet modal + AI improve
  add-task-dialog.tsx   # Client: new task form
  ai-generate-dialog.tsx# Client: AI task generation flow
  project-card.tsx      # Client: project card with delete confirm
  new-project-dialog.tsx# Client: create project form
  theme-toggle.tsx      # Client: dark/light toggle

lib/
  supabase/
    client.ts           # Browser Supabase client (singleton)
    server.ts           # Server Supabase client (per-request)
    middleware.ts       # Auth session refresh + route protection
  actions/
    auth.ts             # signIn, signUp, signOut, getUser
    projects.ts         # CRUD for projects
    tasks.ts            # CRUD for tasks
  types.ts              # Shared TypeScript types

middleware.ts           # Protects /dashboard and /board routes
```

---

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd taskr
pnpm install
```

### 2. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a project, and note your **Project URL** and **anon key**.

### 3. Run the database migration

In the Supabase SQL editor (or via the Supabase CLI), run the contents of:

```
scripts/001_create_schema.sql
```

This creates the `profiles`, `projects`, and `tasks` tables with RLS policies and triggers.

### 4. Set environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
```

> AI features (task generation, improve task) require `OPENAI_API_KEY`. If it is not set, those endpoints return a 503 with a clear message — the rest of the app works without it.

### 5. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Features

- **Auth**: Email/password via Supabase Auth with email confirmation and auto-profile creation via database trigger.
- **Projects**: Create and delete projects; each scoped to the authenticated user via RLS.
- **Kanban board**: Three columns (To Do, In Progress, Done) with drag-and-drop; optimistic updates with rollback on failure.
- **Task management**: Create, edit, and delete tasks; tasks have title, description, priority, due date, and tags.
- **AI task generation**: Describe goals in plain English, review and select AI-generated tasks, add to board in one click.
- **AI task improvement**: Open any task's Sheet modal and click "Improve with AI" to rewrite it with better title, description, and tags.
- **Dark mode**: System-aware with manual toggle via `next-themes`.

---

<img width="2554" height="1301" alt="image" src="https://github.com/user-attachments/assets/f76c4241-06ed-4852-928a-ba400d6eebd0" />



Notes on AI implementation

Groq models may not support json_schema structured outputs.
To keep the app reliable, the AI endpoints use:

generateText(...)

strict JSON extraction

Zod validation

clear error messages + safe fallbacks

This makes AI features stable in production.
---

## License

MIT
