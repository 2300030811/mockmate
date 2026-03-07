# 🚀 Mockmate - AI-Powered Interview Excellence

<div align="center">

![Mockmate Banner](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green?style=for-the-badge&logo=supabase)

**Your Intelligent Partner for Technical Interview Prep & Cloud Certification**

[View Live Demo](https://mockmate-delta.vercel.app/) • [Report Bug](https://github.com/2300030811/mockmate/issues) • [Request Feature](https://github.com/2300030811/mockmate/issues)

</div>

---

## 🌟 Introduction

**Mockmate** is a state-of-the-art platform designed to supercharge your technical preparation. Whether you're aiming for a top-tier software engineering role or chasing cloud certifications, Mockmate bridges the gap between study and practice.

Powered by a dual-engine AI core (**Google Gemini Pro** & **Groq Llama 3**), it delivers:

- **Instant Quizzes** generated from your own study materials.
- **Real-time Voice Interviews** that feel natural and authentic.
- **Dedicated Cloud Prep** for AWS, Azure, Salesforce, and more.

## ✨ Key Features

### ⚔️ The Arena (Multiplayer)

**Real-time coding battles** to test your speed and accuracy:

- **Ranked Matchmaking**: Elo-based system to find your perfect opponent.
- **Live Battles**: Compete in Python, SQL, and specific tech stacks.
- **Win Streaks & Rewards**: Earn badges and climb the global leaderboards.

### 🏗️ System Design Canvas

**Interactive Architecture Designer** for modern cloud solutions:

- **Drag-and-Drop Interface**: Build professional diagrams with AWS/Azure components.
- **AI Audit**: One-click architecture review by our AI to find bottlenecks and security flaws.
- **Microservices Templates**: Mobile-ready templates for Serverless and Web App architectures.

### 📄 Resume Roaster

**AI-Powered Career Coach**:

- **Deep Analysis**: Get brutal yet constructive feedback on your resume.
- **Audio Feedback**: Listen to your critique with natural-sounding AI speech.
- **ATS Optimization**: Actionable tips to beat the Applicant Tracking Systems.

### ☁️ Certification Hub

Detailed preparation tracks for major technical certifications:

- **AWS Quiz**: Cloud Practitioner & Solutions Architect.
- **Azure Quiz**: Azure Fundamentals (AZ-900).
- **Salesforce Quiz**: Agentforce Specialist preparation.
- **Oracle, MongoDB, & Python**: Specialized certification paths.
- **Customizable Modes**: Choose strictly timed exams or relaxed practice modes.

### 📊 Professional Dashboard

- **Daily Streaks**: Track your consistency and habit building.
- **Career Path Tracking**: Visualize your progress towards specific roles (e.g., DevOps Engineer).
- **Recent Activity**: detailed logs of your past battles and quiz scores.

### 🦁 Bob Assistant & Quiz Generator

- **Personal AI Tutor**: Context-aware help during any quiz or battle.
- **Document to Quiz**: Upload PDFs/Text to generate custom study materials instantly.
- **Dual-Engine AI**: Seamlessly switches between **Gemini** and **Groq** for optimal performance.

### 🎙️ AI Interview Simulator

Experience the pressure of a real interview from home:

- **Voice-First Experience**: Utilizes **Native Web Speech API** for zero-latency transcription.
- **Adaptive Feedback**: AI analyzes technical accuracy and behavioral cues, providing constructive critique.

### ⚔️ Project Mode

**Real-world engineering challenges**:

- **Real-world Scenarios**: Fix bugs in pre-configured project environments (Blood Banking, FinTech).
- **Senior Solution Reviews**: Compare your code with expert solutions and learn architectural best practices.
- **Success Metrics**: Track time-to-solve and hint usage to measure growth.

## 🛠️ Tech Stack & Quality

### ⚙️ Core Architecture

- **Next.js 14** (App Router)
- **TypeScript** (Strict Mode enabled)
- **Tailwind CSS** (Responsive & Dark Mode optimized)
- **Framer Motion**: Complex animations for Arena & System Design.
- **Supabase**: Authentication, Database, and Row Level Security (RLS).
- **Server Actions**: Clean separation of business logic and UI.

### ⚡ Performance & Optimization (Recent)

- **Dynamic Imports**: Code splitting for heavy components like `BobAssistant` to reduce TTI.
- **Memoized Rendering**: Custom `MemoizedMarkdown` and `SyntaxHighlighter` implementations to minimize re-renders.
- **Modular Refactoring**: Decoupled monolithic components (`SettingsForm`, `BobAssistant`) into single-responsibility sub-components.
- **Asset Optimization**: Strategic use of Next.js Image component and layout stability.

### 🧪 Testing & Reliability

- **Vitest**: Comprehensive unit testing for logic (QuizService, Hooks).
- **Playwright**: End-to-End (E2E) testing for critical user flows.
- **Zod**: Runtime schema validation for AI responses.

### 🧠 AI & Data

- **Google Gemini**: Primary reasoning engine (Flash 1.5 & 2.0).
- **Groq**: Uber-fast inference for real-time chat (Llama 3).
- **Supabase PostgREST**: High-performance data fetching.
- **Redis (Upstash)**: Rate limiting and caching.

## 🚀 Getting Started

Follow these steps to set up Mockmate locally:

### 1. Clone the Repository

```bash
git clone https://github.com/2300030811/mockmate.git
cd mockmate
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env.local` file in the root directory:

```env
# AI API Keys
GOOGLE_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Supabase (Auth & Database)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start your prep!

## 🧪 Running Tests

```bash
npm test              # Run Unit Tests
npx playwright test   # Run E2E Tests
```

---

<div align="center">
  Built with ❤️ by Mahesh
</div>
