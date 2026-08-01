# DeutschLernen — German Learning Platform

A modern, responsive platform for Arabic-speaking learners to master German through CEFR-aligned lessons, vocabulary, grammar, quizzes, flashcards, and AI-powered practice.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Components:** shadcn/ui
- **Animation:** Framer Motion
- **Auth:** Supabase Auth (SSR)
- **ORM:** Prisma
- **Database:** PostgreSQL (Supabase)

## Project Structure

```
C:\Users\Metwaky\Documents\GermanLearningPlatform
├── prisma/             # Prisma schema and migrations
├── supabase/           # Supabase config and migrations
├── docs/               # Project documentation
├── public/             # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   ├── components/     # React components (ui, layout, auth, dashboard, theme, locale)
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities, Prisma, Supabase clients
│   ├── server/         # Server actions
│   └── types/          # Shared TypeScript types
├── .env.example        # Environment variable template
└── README.md           # This file
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment template and fill in your Supabase credentials:
   ```bash
   copy .env.example .env.local
   ```

3. Validate the Prisma schema:
   ```bash
   npx prisma validate
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:validate` | Validate the Prisma schema |
| `npm run prisma:migrate` | Run Prisma migrations |
| `npm run prisma:generate` | Regenerate the Prisma client |
| `npm run prisma:studio` | Open Prisma Studio |

## Connecting Supabase

1. Create a new project at [https://supabase.com](https://supabase.com).
2. Go to **Project Settings > API** and copy the URL and anon key.
3. Go to **Project Settings > Database** and copy the connection strings.
4. Paste them into `.env.local`.

## Features

- Light / dark / system theme toggle
- LTR / RTL language toggle (English / Arabic)
- Responsive glassmorphism shell with navbar, sidebar, and footer
- Supabase-powered authentication (login / register / logout)
- Landing page and dashboard with animated stat cards
- Comprehensive Prisma schema for courses, lessons, quizzes, flashcards, and more

## License

MIT
