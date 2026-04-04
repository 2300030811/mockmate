<div align="center">

# 🚀 MockMate

### The Ultimate AI-Powered Technical Interview & Certification Prep Platform

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-mockmate--delta.vercel.app-4F46E5?style=for-the-badge)](https://mockmate-delta.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38BDF8?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**MockMate** bridges the gap between studying and real interview performance. Powered by a highly-optimized dual AI engine — **Google Gemini** and **Groq LLaMA 3** — it provides interactive voice interviews, real-time coding battles, rigorous certification quizzes, and an intelligent career coach, all in one state-of-the-art platform.

[View Live Demo](https://mockmate-delta.vercel.app/) · [Report a Bug](https://github.com/2300030811/mockmate/issues) · [Request a Feature](https://github.com/2300030811/mockmate/issues)

</div>

---

## 📖 Table of Contents

- [✨ Core Features](#-core-features)
- [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
- [🚀 Getting Started](#-getting-started)
- [⚙️ Environment Variables](#️-environment-variables)
- [🧪 Testing](#-testing)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [👥 Meet the Team](#-meet-the-team)

---

## ✨ Core Features

### 🎙️ AI Interview Simulator
Experience a realistic, pressure-tested interview directly from your browser.
- **Voice-First Experience**: Native Web Speech API integration for zero-latency, highly accurate transcription.
- **Natural Conversations**: Premium text-to-speech for lifelike, responsive AI interviewers.
- **Adaptive AI Feedback**: Gemini strictly analyzes your technical accuracy, clarity, and behavioral cues, providing actionable post-interview metrics.

### ⚔️ The Arena — Live Coding Battles
Enhance your problem-solving skills through real-time peer-to-peer coding competitions.
- **Elo-Based Matchmaking**: Instantly match with opponents at your skill level.
- **Multi-Language Support**: Compete in Python, JavaScript, SQL, and more.
- **Gamification**: Badges, leaderboards, win streaks, and global rankings keep the adrenaline pumping.

### 🏗️ System Design Canvas
An interactive, infinite-canvas architecture diagramming tool for evaluating scalable cloud solutions.
- **Drag-and-Drop Editor**: Build solutions using AWS, Azure, and generic cloud components.
- **One-Click AI Architecture Audit**: Instantly identify bottlenecks, anti-patterns, single points of failure, and security flaws with Gemini's reasoning engine.
- **Pre-Built Templates**: Start fast with Serverless, Microservices, and Event-Driven architecture boilerplates.

### 📄 Resume Roaster & ATS Scorer
AI-powered career coaching designed specifically for your resume.
- **Deep Resume Analysis**: Candid, hyper-critical constructive feedback identifying weak bullet points.
- **Meme Audio Playback**: Listen to your critique roasted with hilarious AI-generated meme audio feedback.
- **ATS Parsing & Scoring**: Deep insights on how Applicant Tracking Systems read your resume, complete with actionable optimizations to boost your match rate.

### ☁️ Certification Hub
Dedicated, exhaustive prep tracks for the most sought-after tech certifications.

| Provider | Certification Track |
|---|---|
| ☁️ **AWS** | Cloud Practitioner, Solutions Architect Associate |
| 🔷 **Azure** | AZ-900 Fundamentals |
| ☁️ **Salesforce** | Agentforce Specialist |
| 🍃 **MongoDB** | Developer Associate |
| 🐍 **Python** | PCAP Certified Associate |
| 🔴 **Oracle** | Database Fundamentals |

### 🦁 Bob — Your AI Study Companion
- **Context-Aware Assistance**: Bob inherently understands what quiz, question, or challenge you're currently working on and assists without giving the answer away directly.
- **PDF-to-Quiz Generator**: Upload any PDF document or study guide, and Bob will extract the core concepts and convert them into a custom multiple-choice test in seconds.
- **Dual-Engine Routing**: Automatically routes tasks to **Gemini** (for deep, analytical reasoning) or **Groq** (for blazing fast inference) depending on the workload.

### 🔧 Project Mode 
Tackle real-world engineering challenges instead of LeetCode algorithms.
- **Scenario-Based Bugs**: Fix pre-configured, intentionally broken projects in domains like FinTech, E-Commerce, and Healthcare.
- **In-Browser IDE**: Full Monaco Editor and CodeSandbox Sandpack integration requiring zero local setup.
- **Senior Code Reviews**: Compare your implemented fix against expert solutions to learn architectural best practices.

### 📊 Career Pathfinder Dashboard
- **Role Progression Tracker**: Visual roadmap tracking your progress mapped to specific roles (e.g., Cloud Architect, Full-Stack Engineer).
- **Daily Dev Streaks**: Heatmap and streak-tracker to build a consistent coding habit.

---

## 🛠️ Tech Stack & Architecture

### Core Frameworks
- **Next.js 14** (App Router, Server Actions, SSR/SSG)
- **React 18**
- **TypeScript 5** (Strict Mode)
- **Tailwind CSS 3** & **Framer Motion**

### AI & Machine Learning Pipeline
- **Google Gemini** (Flash 1.5 / 2.0): Primary deterministic reasoning, quiz generation, and profound resume analysis.
- **Groq LLaMA 3**: Ultra-fast LLM inference utilized primarily for real-time chat interactions.
- **Vercel AI SDK**: Unified streaming and tool-calling abstraction layer.

### Backend Infrastructure
- **Supabase**: PostgreSQL database, Row-Level Security (RLS), and unified Authentication.
- **Upstash Redis**: Serverless deterministic caching and rigorous API rate limiting.
- **Azure Blob Storage**: Secure document retention for resume uploads.
- **Azure Cognitive Services**: Document Intelligence (OCR) & Speech SDK.

```mermaid
graph TD;
    Client[Next.js Client Components] -->|Server Actions| NextRoutes[Next.js API & Actions];
    
    Subgraph Backend
        NextRoutes -->|Auth & DB| Supabase[(Supabase PostgreSQL)];
        NextRoutes -->|Rate Limit / Cache| Upstash[(Upstash Redis)];
        NextRoutes -->|Storage| AzureBlob[(Azure Blob Storage)];
    End
    
    Subgraph AI Services
        NextRoutes -->|Vercel AI SDK| Gemini[Google Gemini API];
        NextRoutes -->|Vercel AI SDK| Groq[Groq LLaMA API];
        NextRoutes -->|Transcription/TTS| AzureSpeech[Azure Cognitive Speech];
    End
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ & **npm** v9+
- A [Supabase](https://supabase.com) project
- API Keys: [Google AI Studio](https://aistudio.google.com) (Gemini), [Groq Cloud](https://console.groq.com)

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

**3. Configure Environment Variables**
Copy the sample config and populate it:
```bash
cp .env.example .env.local
```

**4. Start the development server**
```bash
npm run dev
```

Browse to [http://localhost:3000](http://localhost:3000) inside your browser.

---

## ⚙️ Environment Variables

A `.env.local` file is required. Example configuration:

```env
# ── Routing ─────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Database & Auth (Supabase) ─────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# ── AI Agents ─────────────────────────────────
GOOGLE_API_KEY=<gemini-api-key>
GROQ_API_KEY=<groq-api-key>

# ── Upstash Cache/Redis ────────
UPSTASH_REDIS_REST_URL=https://<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<token>

# ── APIs & Vendors ───────────────────────────────
AZURE_SPEECH_KEY=<azure-speech-key>
AZURE_SPEECH_REGION=eastus
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://<name>.cognitiveservices.azure.com/
AZURE_DOCUMENT_INTELLIGENCE_KEY=<key>
AZURE_STORAGE_CONNECTION_STRING=<connection-string>

```

---

## 🧪 Testing

We ensure platform resilience via robust testing workflows:

```bash
# Unit & Integration Tests (Vitest)
npm test
npm test -- --watch

# End-to-End browser UI Tests (Playwright)
npx playwright test
npx playwright test --ui
```

---

## 📁 Project Structure

```text
mockmate/
├── app/                    # Next.js App Router (Pages, Layouts, API)
│   ├── (immersive)/        # Full-window interactive routes (Arena, Quizzes)
│   ├── (main)/             # Standard site layout with Header/Footer
│   └── actions/            # Server actions
├── components/             # Reusable UI building blocks
│   ├── career-path/        # ATS dashboard & progression UI
│   ├── project-mode/       # Web-based IDE components
│   └── ui/                 # Design system primitives 
├── lib/                    # Core backend logic
│   ├── ai/                 # Gemini/Groq Strategy Providers
│   └── services/           # Controller & Domain services
├── types/                  # Global TypeScript Interfaces
└── utils/                  # Helper utilities and validators
```

---

## 🤝 Contributing

We welcome community contributions. Let's build the best interview platform together!

1. **Fork** the repository.
2. **Create** a branch: `git checkout -b feature/awesome-addition`
3. **Commit** changes: `git commit -m 'feat: added awesome addition'`
4. **Push** to the branch: `git push origin feature/awesome-addition`
5. **Open** a Pull Request pointing to `main`.

Please ensure `npm test` and formatting scripts pass successfully before merging.

---

## 👥 Meet the Team

MockMate was built by passionate engineers dedicated to making technical interviewing less terrifying and more accessible.

| Name | Role | Links |
| :--- | :--- | :--- |
| **Bhima Mahesh Sai** | Full Stack Developer | [GitHub](https://github.com/2300030811) • [LinkedIn](https://www.linkedin.com/in/mahesh-sai-bhima-038243286) |
| **Kondaveti Tejaswanth** | Full Stack Developer | [GitHub](https://github.com/ktejaswanth) • [LinkedIn](https://www.linkedin.com/in/ktejaswanth/) |

---

<div align="center">

Built with ❤️ and AI.  

**[View the /about page live!](https://mockmate-delta.vercel.app/about)**

⭐ If MockMate helped you secure an interview, please consider starring the repository! ⭐

</div>
