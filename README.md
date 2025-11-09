# Resume Builder

AI-assisted resume creation and management platform built with Next.js. Users can upload a PDF (resume or LinkedIn export), transform it into structured resume data with Groq, edit the content in an intuitive side-panel UI, and manage up to four saved versions per account.

## Overview

- **Stack**: Next.js App Router (TypeScript), React 18, Zustand, NextAuth, better-sqlite3, Tailwind CSS
- **LLM Integration**: Groq chat completions power PDF → structured resume transformation
- **Persistence**: SQLite for users/resume history/usage limits + dual localStorage/sessionStorage sync for in-progress editing
- **Deployment Target**: Vercel

## Key Features

- **PDF Parsing** – Extract text client-side (`react-pdftotext`) and transform it server-side via Groq.
- **Authenticated Editing** – Access to the builder and Groq usage is restricted to signed-in users (Credentials + Google OAuth).
- **Side Panel UX** – Collapsible edit/history tabs with matching styling and responsive behavior.
- **Resume Versioning** – Save and restore up to four resume snapshots per user; hydrated straight into the Zustand store.
- **Usage Limits** – Groq transform endpoint enforces four total conversions per user.
- **Auto-Persisted State** – Resume data syncs to both localStorage and sessionStorage, preventing data loss on refresh.
- **Theme Controls** – Switch resume fonts/colors dynamically via a dedicated theme control UI.

## Low-Level Design (LLD)

```text
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts      # NextAuth configuration
│   │   ├── past-resumes/route.ts            # Fetch/save resume history
│   │   └── transform-pdf-string/route.ts    # Groq transform API (usage-limited)
│   ├── auth/page.tsx                        # Auth form with Suspense + URL error handling
│   ├── layout.tsx                           # Global layout + SessionProvider + Navbar
│   ├── page.tsx                             # Landing page shell
│   └── resume-builder/page.tsx              # Builder wrapper
│
├── components/
│   └── resume-builder/
│       ├── Home.tsx                         # Landing page logic & CTA flows
│       ├── ResumeBuilderHome.tsx            # Main layout with side panel + preview
│       ├── components/edit-panel/           # Section editors, save button, etc.
│       ├── components/history/              # Past resume list + restore logic
│       ├── context/                         # Layout, History, ResumeTheme contexts
│       ├── store/                           # Zustand store + persistence helpers
│       └── types/                           # Resume schema & sanitizers
│
├── lib/
│   ├── db.ts                                # better-sqlite3 setup, CRUD helpers
│   └── llm/transform-pdf-utils.ts           # JSON extraction + sanitize LLM response
│
└── utils/
    ├── fetchWithTimeout.ts                  # Fetch wrapper with abort + timeout
    └── withTimeout.ts                       # Promise timeout helper (Groq integration)
```

### Data Flow

1. **Upload** – `Home.tsx` reads PDF → text, keeps pending uploads in sessionStorage for post-login continuity.
2. **Transform** – Authenticated POST to `/api/transform-pdf-string`; endpoint checks user-specific usage limit, calls Groq, sanitizes output, increments usage.
3. **Hydrate** – Resume data hydrates Zustand via `hydrateResume` and generates a new `resumeId`.
4. **Edit** – Editing occurs in the side-panel, reflecting in the preview in real time.
5. **Save** – `EditPanel` Save posts to `/api/past-resumes`; server persists to SQLite (up to 4 per user) and returns refreshed history.
6. **Restore** – History tab hydrates selection into the store, syncing with local/session storage.

### State Management

- `resumeStore` (Zustand) holds structured resume data plus `resumeId`.
- `dualStorage` middleware writes to both localStorage and sessionStorage.
- `HistoryContext` fetches/refreshes server history entries and exposes them to `HistoryPanel`.
- `LayoutContext` coordinates side-panel state and active sections, auto-unselecting empty sections.

### Database Schema (SQLite)

- `users` – NextAuth credential storage
- `user_resumes` – Historical resume entries (`resumeId`, serialized data, timestamps, limited to four newest)
- `user_usage` – Tracks per-user Groq transform counts (max 4)

## API Surface

| Endpoint                    | Method   | Auth | Description                                                  |
| --------------------------- | -------- | ---- | ------------------------------------------------------------ |
| `/api/auth/[...nextauth]`   | GET/POST | –    | NextAuth routes (credentials + Google)                       |
| `/api/past-resumes`         | GET      | ✅   | Retrieve latest resume history (max 4) for the current user  |
| `/api/past-resumes`         | POST     | ✅   | Save/overwrite resume history entry                          |
| `/api/transform-pdf-string` | POST     | ✅   | Transform raw resume text using Groq (limited to 4 per user) |

### `/api/transform-pdf-string` Payload

```json
{
  "input": "Plain text extracted from PDF"
}
```

Responses:

- `200` – `{ "data": ResumeOutput }` (sanitized structured resume)
- `401` – Not signed in
- `429` – Usage limit reached (4 transformations)
- `4xx/5xx` – Error message in `{ "error": string }`

## Getting Started

```bash
yarn install
```

Create `.env.local`:

```bash
NEXTAUTH_SECRET=your_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GROQ_API_KEY=...
DATABASE_PATH=./data/database.sqlite # optional override
```

Initialize database directory if needed:

```bash
mkdir -p data
```

Run dev server:

```bash
yarn dev
```

Run tests:

```bash
yarn test
```

Run lint/type checks:

```bash
yarn lint
```

Build production bundle:

```bash
yarn build
```

## Deployment (Vercel)

1. Push to a Git repository and import into Vercel.
2. Configure environment variables in Project Settings → Environment Variables.
3. Set **Install Command** to `yarn install` and **Build Command** to `yarn build`.
4. Default `Output Directory` remains `.next`.
5. For persistent data, consider migrating SQLite tables to a hosted database (PlanetScale, Supabase, etc.) or attach Vercel KV/File solutions.

## Usage Guidelines

- **Resume Limit**: Each saved resume history is capped at 4 per user. Oldest entries are pruned automatically.
- **Transformation Limit**: Groq usage is capped at 4 transforms per user. Extend by adjusting `MAX_TRANSFORM_USAGE` in `db.ts` and usage messages.
- **Auth Required**: Resume builder route and APIs rely on NextAuth middleware; unauthenticated users are redirected to `/auth`.
- **Storage Sync**: Clearing browser storage purges local drafts but server-stored histories remain accessible via the history tab.

## Development Notes

- Aliases: All internal imports use `@resume-builder/...` (configured in `tsconfig.json`).
- Suspense: The `/auth` page wraps `useSearchParams` usage in `<Suspense>` to satisfy Next.js prerender requirements.
- Styling: Tailwind classes adhere to consistent spacing and typography for the edit/history panels.

---

Enjoy building polished resumes with an efficient editing workflow and Groq-powered transformations.
