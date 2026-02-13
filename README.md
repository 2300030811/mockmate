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

### 🏆 Global Leaderboard & Profiles

Compete with others and track your growth:

- **Authenticated Profiles**: Create an account via Email, **Google**, or **GitHub** to save your progress permanently.
- **Global Leaderboard**: Claim your spot in the "Hall of Fame" for each certification category.
- **Guest-First Design**: Start practicing immediately as a guest with a session-based nickname; your progress seamlessly syncs if you decide to join.
- **Cross-Device History**: Log in from anywhere to see your previous quiz scores and career path analysis.

### ☁️ Certification Hub

Detailed preparation tracks for major technical certifications:

- **AWS Quiz**: Targeted practice for Cloud Practitioner & Solutions Architect.
- **Azure Quiz**: Comprehensive questions for Azure Fundamentals (AZ-900).
- **PCAP Quiz**: Python Certified Associate in Programming prep.
- **Salesforce Quiz**: Specialist preparation for the Agentforce certification.
- **Oracle & MongoDB**: Specialized database and backend certification paths.
- **Customizable Modes**: Choose strictly timed exams or relaxed practice modes.

### 🦁 Bob Assistant

Your personal AI study companion, integrated directly into every quiz:

- **Instant Clarification**: Stuck on a question? Just ask Bob! He can explain complex concepts simply.
- **Context-Aware**: Bob knows exactly which question you are looking at and provides tailored help.
- **Interactive Learning**: Ask for examples, why other options are wrong, or deep dives into specific topics.

### 🤖 Intelligent Quiz Generator

Turn any document into a test:

- **Upload & Generate**: Support for PDFs and raw text.
- **Smart Context**: Extracts high-yield concepts, not just random keywords.
- **Resilient Architecture**: Uses a robust **Strategy Pattern** to automatically switch between AI providers (Gemini -> Groq).

### 🎙️ AI Interview Simulator

Experience the pressure of a real interview from home:

- **Voice-First Experience**: Utilizes **Native Web Speech API** for zero-latency transcription.
- **Adaptive Feedback**: AI analyzes technical accuracy and behavioral cues, providing constructive critique.

## 🛠️ Tech Stack & Quality

### ⚙️ Core Architecture

- **Next.js 14** (App Router)
- **TypeScript** (Strict Mode enabled)
- **Tailwind CSS** (Responsive & Dark Mode optimized)
- **Supabase**: Authentication, Database, and Row Level Security (RLS).
- **Server Actions**: Clean separation of business logic and UI.

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
  Built with ❤️ by Bhima
</div>
