# Phase 1 — Foundation Notes

## What Was Delivered

This phase establishes the foundation of the German Learning Platform. It includes a runnable Next.js 15 project, a responsive glassmorphism UI shell, Supabase auth wiring, Prisma schema, dark/light mode, RTL Arabic support, a landing page, and a dashboard layout.

## Architecture Decisions

- **Next.js App Router**: Chosen for server components, server actions, and modern routing. All data-heavy pages can later be server-rendered.
- **Supabase Auth with SSR**: Uses `@supabase/ssr` with cookie-based sessions. Middleware refreshes tokens on each request.
- **Prisma ORM**: Provides type-safe database access. The schema targets PostgreSQL (Supabase) and uses UUID primary keys.
- **Tailwind CSS 4 + shadcn/ui**: Latest Tailwind with CSS-first configuration; shadcn/ui provides accessible, composable components.
- **Framer Motion**: Used for landing page and dashboard entrance animations.
- **Theme / Locale**: `next-themes` handles light/dark/system; a custom `LocaleProvider` toggles English/Arabic and updates `dir`/`lang` on `<html>`.

## Database Schema Summary

The Prisma schema (`prisma/schema.prisma`) includes models for:

- `User` — learner profiles linked to Supabase auth.
- `CEFRLevel` — A1, A2, B1, B2, C1, C2 levels.
- `Lesson` — lessons belonging to a CEFR level.
- `GrammarTopic` — grammar explanations and examples.
- `VocabularyWord` — German words with English/Arabic translations.
- `Flashcard` — user-specific spaced-repetition cards.
- `Quiz` / `QuizQuestion` — quizzes and their questions.
- `Exercise` — listening, writing, speaking, reading, grammar drills.
- `UserProgress` — per-lesson completion and scores.
- `Achievement` / `UserAchievement` — gamification badges.
- `Exam` — official-style CEFR exams.
- `AIChat` — conversation history with an AI tutor.
- `Note` — user notes tied to lessons.
- `Bookmark` — saved lessons, grammar topics, or vocabulary words.

## Auth Flow

1. Users sign up or log in via server actions in `src/server/actions/auth-actions.ts`.
2. Supabase creates/verifies the session and sets HTTP-only cookies.
3. Middleware refreshes expired sessions automatically.
4. `useSession` hook provides the current user to client components.

## Theme and RTL Setup

- The root layout wraps the app with `ThemeProvider` (class-based) and `LocaleProvider`.
- `ThemeToggle` lets users switch between light, dark, and system modes.
- `LocaleToggle` switches between English (LTR) and Arabic (RTL). The Arabic font `Noto Sans Arabic` is loaded via `next/font/google`.
- `suppressHydrationWarning` is set on `<html>` to avoid mismatches caused by theme scripts.

## Environment Variables

See `.env.example` for the required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` -- must point at Supabase's transaction pooler (port 6543)
  with `?pgbouncer=true&connection_limit=1`, not the direct connection.
  Vercel functions are short-lived and run in parallel, so a `connection_limit`
  above 1 (or missing `pgbouncer=true`) exhausts Postgres connections fast.
- `DIRECT_URL` -- the direct connection (port 5432), used only for
  migrations (`prisma migrate`), never at runtime.
- `REVALIDATE_SECRET` / `REVALIDATE_URL` -- optional. Grammar lesson content
  is cached indefinitely (`unstable_cache`, tag `grammar-content`) since it
  only changes on a re-seed. `REVALIDATE_SECRET` authorizes
  `POST /api/revalidate-grammar` to drop that cache; `REVALIDATE_URL` (the
  deployment's base URL) lets `scripts/seed-grammar.ts` call it automatically
  after seeding. Without these two, re-seeding still works, it just won't
  refresh the live site's cache until it expires on its own (it doesn't --
  it must be triggered manually via the curl command in
  `scripts/seed-grammar.ts`'s `triggerRevalidation()`).

No real credentials are committed; fill them in after creating a Supabase project.

## Acceptance Criteria Checklist

- [x] Next.js 15 project scaffolded with shadcn/ui.
- [x] Enterprise folder structure created.
- [x] Complete Prisma schema written.
- [x] Supabase auth set up with login/register forms and middleware.
- [x] Dark/light mode and RTL Arabic support implemented.
- [x] Responsive glassmorphism shell (navbar, sidebar, footer) built.
- [x] Landing page and dashboard page created.
- [x] README.md and .env.example written.
- [x] Phase 1 notes documented.

## Next Steps

- Connect a real Supabase project and run `npx prisma migrate dev`.
- Seed CEFR levels, lessons, vocabulary, and grammar topics.
- Implement lesson detail pages and quiz interactions.
- Add the AI chat integration (OpenAI / Gemini via API routes).
