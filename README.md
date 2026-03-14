<div align="center">

# 🚀 Mockmate

### AI-Powered Technical Interview & Certification Prep Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-mockmate--delta.vercel.app-4F46E5?style=for-the-badge)](https://mockmate-delta.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**Mockmate** bridges the gap between studying and real interview performance. Powered by a dual AI engine — **Google Gemini** and **Groq Llama 3** — it gives you voice interviews, real-time coding battles, certification quizzes, and an AI career coach, all in one place.

[View Live Demo](https://mockmate-delta.vercel.app/) · [Report a Bug](https://github.com/2300030811/mockmate/issues) · [Request a Feature](https://github.com/2300030811/mockmate/issues)

</div>

---

## 📖 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🧪 Running Tests](#-running-tests)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [🔒 Security](#-security)

---

## ✨ Features

### 🎙️ AI Interview Simulator
Experience a realistic, pressure-tested interview from your browser.
- **Voice-First Experience** — Native Web Speech API for zero-latency transcription.
- **Azure Cognitive Speech** — Premium text-to-speech for natural-sounding AI interviewers.
- **Adaptive AI Feedback** — Gemini analyzes your technical accuracy and behavioral cues.

### ⚔️ The Arena — Live Coding Battles
Real-time peer-to-peer coding competitions.
- **Elo-Based Matchmaking** — Get matched with opponents at your skill level.
- **Multi-Language Support** — Compete in Python, SQL, and more.
- **Badges & Leaderboards** — Win streaks and global rankings to track your standing.

### 🏗️ System Design Canvas
An interactive architecture diagramming tool for cloud solutions.
- **Drag-and-Drop Builder** — Place AWS and Azure components on a live canvas.
- **One-Click AI Audit** — Instantly identify bottlenecks, anti-patterns, and security flaws.
- **Pre-Built Templates** — Serverless, microservices, and web app architecture starters.

### 📄 Resume Roaster
AI-powered career coaching for your resume.
- **Deep Analysis** — Candid, constructive feedback powered by Gemini.
- **Audio Playback** — Listen to your critique with AI-generated speech.
- **ATS Score & Tips** — Actionable optimizations to pass Applicant Tracking Systems.

### ☁️ Certification Hub
Dedicated prep tracks for the most sought-after cloud and tech certifications.

| Certification | Track |
|---|---|
| ☁️ AWS | Cloud Practitioner, Solutions Architect |
| 🔷 Azure | AZ-900 Fundamentals |
| ☁️ Salesforce | Agentforce Specialist |
| 🍃 MongoDB | Developer Associate |
| 🐍 Python (PCAP) | Certified Associate |
| 🔴 Oracle | Database Fundamentals |

All tracks support timed exam simulation and open practice modes.

### 🦁 Bob — Your AI Study Companion
- **Context-Aware Help** — Bob understands what quiz or challenge you're on and assists accordingly.
- **Document-to-Quiz** — Upload any PDF or text file and get a custom quiz in seconds.
- **Dual-Engine Routing** — Automatically routes to Gemini or Groq for the best response speed and quality.

### 🔧 Project Mode — Real-World Engineering Challenges
- **Scenario-Based Bugs** — Tackle pre-configured broken projects in domains like FinTech and Healthcare.
- **In-Browser IDE** — Full Monaco Editor and CodeSandbox Sandpack environment, no setup needed.
- **Senior Reviews** — Compare your fix with expert solutions and learn architectural best practices.
- **Performance Metrics** — Track time-to-solve and hint usage over time.

### 📊 Dashboard & Progress Tracking
- **Daily Streaks** — Build and maintain a consistent preparation habit.
- **Career Path Visualizer** — Track progress toward specific roles (e.g., DevOps Engineer, Full-Stack).
- **Activity Log** — Detailed history of quiz scores, battle outcomes, and completed challenges.

---

## 🛠️ Tech Stack

### Core

| Technology | Purpose |
|---|---|
| **Next.js 14** (App Router) | Full-stack framework with SSR, SSG, and Server Actions |
| **React 18** | UI library |
| **TypeScript 5** (Strict Mode) | Type-safe development |
| **Tailwind CSS 3** | Utility-first styling with dark mode support |
| **Framer Motion** | Animations and transitions |

### AI & Machine Learning

| Provider | Model | Role |
|---|---|---|
| **Google Gemini** | Flash 1.5 / 2.0 | Primary reasoning, quiz generation, resume analysis |
| **Groq** | LLaMA 3 | Ultra-fast real-time chat inference |
| **Vercel AI SDK** | — | Unified streaming and tool-calling abstraction |

> Uses a **Strategy Pattern** (`lib/ai/providers/`) with a shared interface across `gemini-provider.ts`, `groq-provider.ts`, and `openai-provider.ts`.

### Backend & Data

| Service | Purpose |
|---|---|
| **Supabase** | PostgreSQL database, Auth, Row-Level Security (RLS) |
| **Upstash Redis** | Serverless caching and API rate limiting |
| **Azure Blob Storage** | File/document storage for resume uploads |
| **Azure Document Intelligence** | OCR & document parsing |
| **Azure Cognitive Speech** | Speech-to-text / text-to-speech for interviews |
| **Resend** | Transactional email (feedback notifications) |

### Testing

| Tool | Purpose |
|---|---|
| **Vitest** | Unit tests for services, hooks, and utilities |
| **Playwright** | End-to-end tests for critical user flows |
| **Zod** | Runtime schema validation for AI responses |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- A [Groq Cloud](https://console.groq.com) API key

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/2300030811/mockmate.git
cd mockmate
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up environment variables**

Copy the example below into a new `.env.local` file at the project root and fill in your values. See [Environment Variables](#️-environment-variables) for a full reference.

```bash
cp .env.example .env.local   # if .env.example exists, otherwise create manually
```

**4. Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Environment Variables

Create a `.env.local` file in the project root. Only the variables your features require are needed.

```env
# ── App ─────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Supabase (Required) ──────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# ── AI Providers ─────────────────────────────────
GOOGLE_API_KEY=<gemini-api-key>
GROQ_API_KEY=<groq-api-key>

# ── Upstash Redis (Rate Limiting & Cache) ────────
UPSTASH_REDIS_REST_URL=https://<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# ── Azure Services ───────────────────────────────
AZURE_SPEECH_KEY=<azure-speech-key>
AZURE_SPEECH_REGION=eastus
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://<name>.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=<key>
AZURE_STORAGE_CONNECTION_STRING=<connection-string>

# ── Email (Feedback Notifications) ───────────────
RESEND_API_KEY=<resend-api-key>
FEEDBACK_EMAIL=you@example.com

# ── Quiz Data Sources (External URLs) ────────────
AWS_QUESTIONS_URL=<url>
AZURE_QUESTIONS_URL=<url>
SALESFORCE_QUESTIONS_URL=<url>
MONGODB_QUESTIONS_URL=<url>
PCAP_QUESTIONS_URL=<url>
ORACLE_QUESTIONS_URL=<url>
```

---

## 🧪 Running Tests

```bash
# Unit tests (Vitest)
npm test

# Unit tests in watch mode
npm test -- --watch

# End-to-end tests (Playwright)
npx playwright test

# E2E tests with interactive UI
npx playwright test --ui
```

---

## 📁 Project Structure

```
mockmate/
├── app/                    # Next.js App Router pages and layouts
│   ├── (admin)/            # Admin-only routes
│   ├── (immersive)/        # Full-screen quiz & interview routes
│   │   ├── aws-quiz/
│   │   ├── azure-quiz/
│   │   ├── demo/
│   │   └── project-mode/
│   ├── (main)/             # Standard app routes (dashboard, profile)
│   ├── actions/            # Next.js Server Actions
│   └── api/                # API route handlers
├── components/             # Reusable React components
│   ├── quiz/               # Quiz UI components
│   ├── project-mode/       # Project Mode IDE components
│   ├── career-path/        # Career tracking components
│   └── ui/                 # Shared design system primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Core business logic
│   ├── ai/                 # AI provider strategy pattern
│   ├── db/                 # Database helpers
│   ├── services/           # Domain-level services
│   └── strategies/         # Pluggable algorithm strategies
├── utils/                  # Pure utility functions
├── types/                  # Shared TypeScript types
└── e2e/                    # Playwright end-to-end tests
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository.
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add your feature'`
4. **Push** to the branch: `git push origin feat/your-feature-name`
5. **Open** a Pull Request — describe what you changed and why.

Please make sure all tests pass (`npm test`) before submitting.

---

## 🔒 Security

Security vulnerabilities should **not** be reported as public GitHub issues. Please refer to [SECURITY.md](SECURITY.md) for the responsible disclosure process.

---

<div align="center">

Built with ❤️ by Mahesh

⭐ If you find Mockmate useful, please consider starring the repo!

</div>
