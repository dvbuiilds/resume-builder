# Resume Builder

AI-assisted resume creation and management platform built with Next.js. Create professional resumes by uploading PDFs, transforming them with AI, and customizing every aspect with an intuitive interface.

## Overview

- **Stack**: Next.js App Router (TypeScript), React 18, Zustand, NextAuth, better-sqlite3, Tailwind CSS
- **LLM Integration**: Groq chat completions power PDF → structured resume transformation
- **Persistence**: SQLite for users/resume history/usage limits + dual localStorage/sessionStorage sync for in-progress editing
- **Deployment Target**: Vercel

## Features

### 📄 Upload PDF Resume

Upload your existing resume or LinkedIn profile PDF. Our AI-powered resume generator extracts and structures your content instantly, transforming it into an editable format ready for customization.

### 🎨 Drag & Drop Sections

Easily reorder and customize your resume sections with intuitive drag and drop functionality. Create the perfect CV builder layout that highlights your strengths by arranging sections exactly how you want them.

### ✨ AI Resume Suggestions

Get intelligent suggestions for your resume descriptions powered by AI. Enhance your professional resume with optimized content that stands out to recruiters and ATS systems.

### 🤖 Improvised AI Suggestions for Descriptions

Get improvised AI suggestions specifically tailored for resume descriptions. The AI analyzes your existing content and provides creative, professional alternatives that improve clarity, impact, and keyword optimization. Perfect for refining work experience, project descriptions, and achievement statements to make them more compelling.

### 📚 Resume Version Control

Maintain a complete history of your resume management with version control. Save and access up to four different resume versions for different job applications, keeping all your variations organized.

### 📝 Comprehensive Resume Sections

Build complete resumes with all essential sections:

- **Title** - Your name and professional identity
- **Social Handles** - Email, LinkedIn, and other professional links
- **Work Experience** - Detailed employment history with descriptions
- **Projects** - Showcase your portfolio and project work
- **Education** - Academic qualifications and achievements
- **Skills** - Technical and soft skills
- **Activities** - Extracurricular activities and involvement
- **Achievements** - Awards, certifications, and recognitions

### 🎨 Theme Customization

Personalize your resume with custom themes:

- **Colors**: Choose from Black or Dark Blue color schemes (Disabled currently)
- **Fonts**: Select from Cormorant Garamond, Times New Roman, or Inter fonts
- **Real-time Preview**: See your changes instantly as you customize

### 📥 PDF Export

Download your completed resume as a professional PDF file. The export includes adaptive font sizing and proper formatting to ensure your resume looks perfect on any device or when printed.

### 💾 Auto-Save & Persistence

Never lose your work. Resume data automatically syncs to both localStorage and sessionStorage, preventing data loss on page refresh. All changes are saved automatically as you edit.

### 👤 User Authentication

Secure access with NextAuth supporting both Credentials and Google OAuth authentication. Your resume data is safely stored and accessible across sessions.

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

### User Workflow

1. **Upload** – Users upload a PDF resume or LinkedIn profile export on the home page.
2. **Transform** – The PDF is extracted client-side and sent to the AI transformation service to convert it into structured resume data.
3. **Edit** – Users can edit all resume sections in the intuitive side panel with real-time preview.
4. **Customize** – Apply custom themes, fonts, and colors to match personal preferences.
5. **Organize** – Drag and drop sections to reorder them for optimal presentation.
6. **Enhance** – Use AI suggestions to improve resume descriptions and content.
7. **Save** – Resume versions are automatically saved, with up to 4 versions stored per user.
8. **Export** – Download the final resume as a professional PDF file.

### State Management

- `resumeStore` (Zustand) holds structured resume data plus `resumeId`.
- `dualStorage` middleware writes to both localStorage and sessionStorage.
- `HistoryContext` fetches/refreshes server history entries and exposes them to `HistoryPanel`.
- `LayoutContext` coordinates side-panel state and active sections, auto-unselecting empty sections.

### Database Schema (SQLite)

- `users` – NextAuth credential storage
- `user_resumes` – Historical resume entries (`resumeId`, serialized data, timestamps, limited to four newest)
- `user_usage` – Tracks per-user Groq transform counts (max 4)

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

- **Resume Versions**: You can save up to 4 resume versions per account. Older versions are automatically pruned when you exceed this limit.
- **PDF Transformations**: AI-powered PDF transformations are limited to 4 per user account to manage resource usage.
- **Authentication Required**: You must be signed in to access the resume builder and save your work.
- **Data Persistence**: Your resume data is saved both locally (in your browser) and on the server, ensuring you can access it from any device.
- **Real-time Editing**: All changes are reflected immediately in the preview panel as you edit.

## Development Notes

- Aliases: All internal imports use `@resume-builder/...` (configured in `tsconfig.json`).
- Suspense: The `/auth` page wraps `useSearchParams` usage in `<Suspense>` to satisfy Next.js prerender requirements.
- Styling: Tailwind classes adhere to consistent spacing and typography for the edit/history panels.

---

Enjoy building polished resumes with an efficient editing workflow and Groq-powered transformations.
