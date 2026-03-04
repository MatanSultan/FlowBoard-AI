# Architecture Decisions

## Why Supabase?

Supabase gives us a production-grade PostgreSQL database, an auth system, and real-time capabilities without managing infrastructure. The hosted PostgREST API means we can query the database directly from server-side code using the type-safe JS client, and Row Level Security (RLS) lets us enforce data isolation at the database layer rather than trusting application-level checks.

---

## Why Server Actions?

Next.js Server Actions let us call server-side logic directly from client components without manually writing API routes. This keeps the data-access layer co-located with the UI and eliminates boilerplate fetch wrappers. The trade-off is that server actions always run on the server, so they can't be used for streaming; for that we use route handlers (the AI endpoints).

All mutations go through server actions. Queries happen in React Server Components via the same action functions — no client-side fetching for initial data.

---

## How RLS Works

Row Level Security is enabled on `projects` and `tasks`. Every SELECT, INSERT, UPDATE, and DELETE policy checks `auth.uid() = user_id`. This means:

- Even if a client sends a forged `user_id`, the database rejects it.
- The application never needs to filter by `user_id` manually — the database does it.
- The Supabase JS client automatically attaches the session JWT, so `auth.uid()` is always the authenticated user's ID.

The `profiles` table uses `auth.uid() = id` since the primary key is the auth user ID.

---

## Optimistic UI with Rollback

The kanban drag-and-drop performs an optimistic state update before the server action completes. If the action fails, the previous column snapshot is restored and a toast error is shown. This avoids the 200-500ms lag that would appear if we waited for the server before updating the UI, while still guaranteeing eventual consistency.

---

## AI Route Design

`/api/generate-tasks` and `/api/improve-task` are standard Route Handlers (not server actions) because they benefit from full HTTP semantics — response codes for rate limits (429), 422 for validation errors, and 503 when the API key is missing. Each route:

1. Authenticates the user via Supabase server client.
2. Validates the request body with Zod.
3. Calls `generateObject` from the Vercel AI SDK with a typed Zod schema — this enforces JSON structure at the OpenAI level.
4. Returns typed JSON or a structured error response.

---

## Why @hello-pangea/dnd?

It is a maintained fork of `react-beautiful-dnd` that supports React 18/19. It provides a stable drag-and-drop API with accessible keyboard support and smooth animations out of the box. The `Draggable` and `Droppable` primitives map naturally onto a kanban column layout.

---

## Dark Mode

`next-themes` wraps the app with a `ThemeProvider` at the root layout. `suppressHydrationWarning` on `<html>` prevents the flash of unstyled content during SSR. The theme toggle component uses a mount guard (`useEffect + mounted` flag) to prevent hydration mismatches when the initial server-rendered theme differs from the client's system preference.

---

## Date Handling

All `due_date` values are stored as PostgreSQL `DATE` (no time, no timezone). On the client, dates are parsed with `date-fns/parseISO` to avoid the UTC/local timezone off-by-one issue that occurs when passing a date-only string (`"2025-12-01"`) directly to `new Date()`. `created_at` and `updated_at` are `TIMESTAMPTZ` and are safe to pass directly to `new Date()` or `parseISO`.
