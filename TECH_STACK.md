# MockMate — Full Tech Stack

## 🏗️ Framework & Core

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | ^14.2.35 | Full-stack React framework (App Router, Server Actions, SSR/SSG) |
| **React** | ^18.3.1 | UI library |
| **React DOM** | ^18.3.1 | DOM rendering |
| **TypeScript** | 5.0.4 | Type-safe JavaScript |

---

## 🎨 Styling & UI

| Technology | Version | Purpose |
|---|---|---|
| **Tailwind CSS** | ^3.3.2 | Utility-first CSS framework |
| **@tailwindcss/typography** | ^0.5.9 | Prose styling plugin |
| **PostCSS** | ^8.4.24 | CSS processing |
| **Autoprefixer** | ^10.4.14 | CSS vendor prefixing |
| **Framer Motion** | ^10.18.0 | Animations & transitions |
| **Lucide React** | ^0.563.0 | Icon library |
| **class-variance-authority** | ^0.7.1 | Component variant management |
| **clsx** | ^1.2.1 | Conditional classNames |
| **tailwind-merge** | ^3.4.0 | Tailwind class conflict resolution |
| **next-themes** | ^0.4.6 | Dark/Light mode theming |
| **@headlessui/react** | ^1.7.14 | Accessible headless UI components |
| **@radix-ui/react-tabs** | ^1.1.13 | Accessible tab components |
| **Sonner** | ^2.0.7 | Toast notifications |
| **focus-trap-react** | ^12.0.0 | Focus trapping for modals |
| **react-remove-scroll** | ^2.7.2 | Scroll locking for modals |
| **Google Fonts** (Inter, Outfit) | — | Typography |

---

## 🤖 AI / Machine Learning

| Technology | Version | Purpose |
|---|---|---|
| **Google Generative AI (Gemini)** | ^0.24.1 | Primary AI provider — quiz generation, transcription, career analysis |
| **Groq SDK** | ^0.37.0 | Secondary AI provider — fast LLM inference (LLaMA models) |
| **Vercel AI SDK** (`ai`) | ^3.4.33 | Unified AI streaming & tool-calling abstraction |
| **OpenAI Provider** | (via Vercel AI SDK) | Third AI provider option (configured in code) |

> **Multi-provider architecture**: `lib/ai/providers/` implements a **Strategy Pattern** with `gemini-provider.ts`, `groq-provider.ts`, and `openai-provider.ts` behind a common `ai-provider.ts` interface.

---

## 🗄️ Database & Backend Services

| Technology | Version | Purpose |
|---|---|---|
| **Supabase** (`@supabase/supabase-js`) | ^2.95.3 | PostgreSQL database, Auth, Row-Level Security |
| **Supabase SSR** (`@supabase/ssr`) | ^0.8.0 | Server-side Supabase auth with cookies |
| **Upstash Redis** (`@upstash/redis`) | ^1.36.2 | Serverless Redis (caching, quiz cache) |
| **Upstash Ratelimit** (`@upstash/ratelimit`) | ^2.0.8 | API rate limiting via middleware |

---

## ☁️ Cloud & Azure Services

| Technology | Version | Purpose |
|---|---|---|
| **Azure Blob Storage** (`@azure/storage-blob`) | ^12.29.1 | File/blob storage (resume uploads, etc.) |
| **Azure AI Form Recognizer** (`@azure/ai-form-recognizer`) | ^5.1.0 | OCR & document intelligence |
| **Azure Cognitive Services Speech SDK** | ^1.47.0 | Speech-to-text / text-to-speech for mock interviews |

---

## 📧 Email

| Technology | Version | Purpose |
|---|---|---|
| **Resend** | ^6.9.2 | Transactional email (feedback notifications) |

---

## 🧑‍💻 Code Editor / Sandbox

| Technology | Version | Purpose |
|---|---|---|
| **CodeSandbox Sandpack** (`@codesandbox/sandpack-react`) | ^2.20.0 | In-browser code editor/sandbox (Project Mode "DevCube") |
| **Monaco Editor** (`@monaco-editor/react`) | ^4.7.0 | VS Code-based code editor |
| **react-simple-code-editor** | ^0.14.1 | Lightweight code editor |
| **PrismJS** | ^1.30.0 | Syntax highlighting |
| **react-syntax-highlighter** | ^16.1.0 | Syntax highlighted code blocks |

---

## 📄 Document Processing

| Technology | Version | Purpose |
|---|---|---|
| **pdf-parse** | ^1.1.4 | PDF text extraction (resume parsing) |
| **react-markdown** | ^10.1.0 | Markdown rendering |
| **eventsource-parser** | ^1.1.2 | SSE stream parsing for AI responses |

---

## 📷 Media

| Technology | Version | Purpose |
|---|---|---|
| **react-webcam** | ^7.0.1 | Webcam access for AI mock interviews |

---

## ✅ Validation & Data

| Technology | Version | Purpose |
|---|---|---|
| **Zod** | ^3.25.76 | Runtime schema validation |
| **uuid** | ^13.0.0 | Unique ID generation |
| **dotenv** | ^17.2.3 | Environment variable management |

---

## 🔄 State Management & Data Fetching

| Technology | Version | Purpose |
|---|---|---|
| **TanStack React Query** | ^5.90.20 | Server state management, caching, data fetching |

---

## 🧪 Testing

| Technology | Version | Purpose |
|---|---|---|
| **Vitest** | ^4.0.18 | Unit test runner |
| **Playwright** | ^1.58.1 | End-to-end browser testing |
| **Testing Library (React)** | ^16.3.2 | Component testing utilities |
| **Testing Library (jest-dom)** | ^6.9.1 | Custom DOM matchers |
| **jsdom** | ^28.0.0 | DOM environment for tests |

---

## 🔒 Security

- **Next.js Middleware** — Rate limiting + Supabase session management
- **Security Headers** — CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Supabase RLS** — Row-Level Security on database
- **Zod Validation** — Input sanitization on all server actions
- **Upstash Rate Limiting** — IP-based fixed-window rate limiter

---

## 🏛️ Architecture & Design Patterns

- **Next.js App Router** with route groups: `(main)`, `(immersive)`, `(admin)`
- **Server Actions** — 21 action files covering auth, quizzes, interviews, career, projects, resume, etc.
- **Strategy Pattern** — AI providers & quiz sources (`lib/strategies/`)
- **Factory Pattern** — `QuizFactory.ts` for quiz source creation
- **Multi-provider AI** — Gemini (primary), Groq, OpenAI with fallback

---

## 📦 Key Modules / Features

| Module | Key Files |
|---|---|
| **Certification Quizzes** | AWS, Azure, MongoDB, Salesforce, PCAP, Oracle |
| **AI Mock Interviews** | `interview.ts`, Speech SDK, webcam |
| **Arena Mode** | `arena.ts`, competitive battling |
| **Project Mode** | Sandpack IDE, `project-analysis.ts` |
| **Career Path Analysis** | `career-analysis.ts`, `roadmap.ts` |
| **Resume Roaster** | `resume.ts`, PDF parsing, Azure OCR |
| **System Design** | `system-design.ts` |
| **Dashboard & Analytics** | `dashboard.ts`, leaderboard, streaks, XP |
| **Daily Challenges** | `challenge.ts` |
