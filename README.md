# Resume Builder

AI-assisted resume creation and management platform built with Next.js. Create professional resumes by uploading PDFs, transforming them with AI, and customizing every aspect with an intuitive interface.

## Overview

- **Stack**: Next.js App Router (TypeScript), React 18, Zustand, NextAuth, better-sqlite3, Tailwind CSS
- **LLM Integration**: Groq chat completions power PDF → structured resume transformation
- **Persistence**: SQLite for users/resume history/usage limits + dual localStorage/sessionStorage sync for in-progress editing
- **Deployment Target**: Vercel

## Features

### 📄 PDF Upload & AI Transformation

Upload your existing resume or LinkedIn profile PDF. Our AI-powered resume generator extracts and structures your content instantly using Groq LLM, transforming it into an editable format ready for customization.

- **Client-side PDF extraction** using `pdfjs-dist` and `react-pdftotext`
- **AI-powered transformation** via Groq API to convert unstructured PDF text into structured resume data
- **Usage limit**: 4 PDF transformations per user account
- **Automatic validation** and sanitization of transformed data using Zod schemas

### 🎨 Drag & Drop Section Reordering

Easily reorder and customize your resume sections with intuitive drag and drop functionality powered by `@hello-pangea/dnd`. Create the perfect CV builder layout that highlights your strengths by arranging sections exactly how you want them.

- **Visual drag handles** for easy section reordering
- **Real-time preview** updates as you rearrange sections
- **Persistent section order** saved with your resume

### ✨ AI-Powered Resume Suggestions

Get intelligent, context-aware suggestions for your resume descriptions powered by Groq AI. Enhance your professional resume with optimized content that stands out to recruiters and ATS systems.

- **Context-aware suggestions** that consider job role and company name
- **Multiple suggestion options** per request
- **Usage limit**: 10 AI suggestions per 24-hour period (resets automatically)
- **Real-time usage tracking** displayed in the UI
- **Smart timeout handling** (60-second timeout with graceful error handling)
- **Available for**: Work experience descriptions, project descriptions, activity descriptions, and achievement statements

### 📚 Resume Version Control & History

Maintain a complete history of your resume management with version control. Save and access up to four different resume versions for different job applications, keeping all your variations organized.

- **Save up to 4 resume versions** per user account
- **Automatic cleanup** of older versions when limit is exceeded
- **One-click restore** from history panel
- **Soft delete** with undo functionality (30-second undo window)
- **Resume metadata** tracking (resume ID, timestamps, update history)

### 📝 Comprehensive Resume Sections

Build complete resumes with all essential sections, each with full editing capabilities:

- **Title** - Your name and professional identity
- **Social Handles** - Email, LinkedIn, GitHub, and other professional links (unlimited entries)
- **Work Experience** - Detailed employment history with:
  - Company name, job title, dates
  - Multiple description points per experience
  - Minimum 1 experience required
- **Projects** - Showcase your portfolio and project work with descriptions
- **Education** - Academic qualifications, institutions, and dates
- **Skills** - Organized skill sets with:
  - Custom skill set titles
  - Multiple skills per set
  - Support for technical and soft skills
- **Activities** - Extracurricular activities with detailed descriptions
- **Achievements** - Awards, certifications, recognitions with:
  - Award name, institution, date awarded
  - Detailed descriptions

### 🎨 Theme Customization

Personalize your resume with custom themes and fonts:

- **Color Schemes**:
  - Black (`#000000`)
  - Dark Blue (`#000080`)
  - Additional colors can be enabled in theme config
- **Font Options**:
  - **Cormorant Garamond** - Elegant serif with adaptive scaling
  - **Times New Roman** - Classic professional serif
  - **Inter** - Modern sans-serif
- **Real-time Preview** - See your changes instantly as you customize
- **Persistent Theme** - Your theme preferences are saved with your resume

### 📥 Professional PDF Export

Download your completed resume as a professional PDF file with advanced formatting.

- **High-quality PDF generation** using `@react-pdf/renderer`
- **Adaptive font sizing** based on content density
- **Proper formatting** for print and digital viewing
- **Custom filename** support (auto-generated from your name or custom)
- **Section-aware rendering** respecting your chosen section order
- **Theme preservation** - PDF matches your selected color and font

### 💾 Advanced Auto-Save & Persistence

Never lose your work with multi-layer persistence strategy.

- **Dual Storage Sync**: Automatically syncs to both `localStorage` and `sessionStorage`
- **Server-side persistence**: Resume versions saved to SQLite database
- **Automatic save on edit**: Changes saved as you type
- **Resume ID tracking**: Unique identifiers for each resume version
- **Cross-device access**: Access your resumes from any device when signed in
- **Data recovery**: Protection against data loss on page refresh or browser crashes

### 👤 Secure User Authentication

Secure access with NextAuth.js supporting multiple authentication methods.

- **Credentials Authentication**: Email/password with bcrypt password hashing
- **Google OAuth**: One-click sign-in with Google account
- **Session Management**: Secure session handling with JWT tokens
- **Protected Routes**: Resume builder requires authentication
- **User Data Isolation**: Each user's data is securely separated

### 🔄 Real-Time Editing Experience

Smooth, responsive editing with optimized performance.

- **Live Preview**: Instant updates as you type
- **Optimized Re-renders**: Memoized components and context values
- **Efficient State Management**: Zustand with Immer for immutable updates
- **Structural Sharing**: Minimal re-renders with optimized array operations
- **Responsive UI**: Works seamlessly on desktop and mobile devices

### 🧪 Comprehensive Test Coverage

Robust testing infrastructure ensuring code quality and reliability.

- **Test Framework**: Vitest with React Testing Library
- **Test Coverage**: 87%+ pass rate with 293+ test cases
- **Test Categories**:
  - Unit tests for utilities, hooks, and stores
  - Integration tests for API routes
  - Component tests for UI components
  - Context tests for React contexts
- **Test Commands**:
  - `yarn test` - Run all tests
  - `yarn test:watch` - Watch mode for development
  - `yarn test:ui` - Interactive test UI
  - `yarn test:coverage` - Generate coverage reports

### ⚡ Performance Optimizations

Built with performance and scalability in mind.

- **Code Optimizations**:
  - Immer.js for efficient immutable state updates
  - React.memo for component memoization
  - useMemo and useCallback for expensive computations
  - Optimized database queries with efficient cleanup
- **API Optimizations**:
  - Centralized authentication middleware
  - Standardized API response formats
  - Request timeout handling
  - Usage limit tracking with 24-hour reset windows
- **State Management**:
  - Zustand for lightweight state management
  - Structural sharing for array operations
  - Dual storage for redundancy

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

## Usage Guidelines & Limits

### Account Limits

- **Resume Versions**: Save up to 4 resume versions per account. Older versions are automatically pruned when you exceed this limit (keeps the 4 most recent).
- **PDF Transformations**: AI-powered PDF transformations are limited to **4 per user account** to manage resource usage. This limit does not reset automatically.
- **AI Suggestions**: Get up to **10 AI suggestions per 24-hour period**. The limit resets automatically after 24 hours from your first suggestion of the day.

### Requirements

- **Authentication Required**: You must be signed in to access the resume builder and save your work.
- **Minimum Sections**:
  - At least 1 work experience entry is required
  - At least 1 description point per experience/activity is required

### Data & Persistence

- **Dual Storage**: Your resume data is saved both locally (in your browser) and on the server, ensuring you can access it from any device.
- **Auto-Save**: All changes are saved automatically as you edit - no manual save required.
- **Real-time Preview**: All changes are reflected immediately in the preview panel as you edit.
- **Cross-Device Sync**: Sign in from any device to access your saved resumes.

## Development Notes

### Code Organization

- **Path Aliases**: All internal imports use `@resume-builder/...` (configured in `tsconfig.json` and `vitest.config.ts`).
- **Type Safety**: Full TypeScript coverage with strict type checking.
- **Code Quality**: ESLint and Prettier configured for consistent code style.

### Next.js Specifics

- **Suspense Boundaries**: The `/auth` page wraps `useSearchParams` usage in `<Suspense>` to satisfy Next.js prerender requirements.
- **App Router**: Uses Next.js 15 App Router with React Server Components where appropriate.
- **API Routes**: All API routes use standardized error handling and authentication middleware.

### Styling

- **Tailwind CSS**: Utility-first CSS with consistent spacing and typography.
- **Component Styling**: Edit/history panels use consistent design patterns.
- **Responsive Design**: Mobile-first approach with breakpoint optimizations.

### Testing

- **Test Setup**: Vitest with jsdom environment for React component testing.
- **Test Utilities**: Custom render functions with provider wrappers for consistent test setup.
- **Mocking**: Comprehensive mocks for API routes, database operations, and external dependencies.
- **Coverage**: Aim for high test coverage across utilities, components, and API routes.

### Performance

- **State Management**: Zustand stores with Immer for efficient immutable updates.
- **Memoization**: Strategic use of React.memo, useMemo, and useCallback.
- **Database**: Optimized SQLite queries with efficient cleanup operations.
- **Logging**: Environment-aware logging (development only for info logs).

---

Enjoy building polished resumes with an efficient editing workflow and Groq-powered transformations.
