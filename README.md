# 🚀 Mockmate - AI-Powered Interview Excellence

<div align="center">

![Mockmate Banner](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vitest](https://img.shields.io/badge/Vitest-Tested-green?style=for-the-badge&logo=vitest)
![Playwright](https://img.shields.io/badge/Playwright-E2E-orange?style=for-the-badge&logo=playwright)

**Your Intelligent Partner for Technical Interview Prep & Cloud Certification**

[View Live Demo](https://mockmate-delta.vercel.app/) • [Report Bug](https://github.com/2300030811/mockmate/issues) • [Request Feature](https://github.com/2300030811/mockmate/issues)

</div>

---

## 🌟 Introduction

**Mockmate** is a state-of-the-art platform designed to supercharge your technical preparation. Whether you're aiming for a top-tier software engineering role or chasing cloud certifications, Mockmate bridges the gap between study and practice.

Powered by a dual-engine AI core (**Google Gemini Pro** & **Groq Llama 3**), it delivers:

- **Instant Quizzes** generated from your own study materials.
- **Real-time Voice Interviews** that feel natural and authentic.
- **Dedicated Cloud Prep** for both **AWS** and **Azure** certifications.

## ✨ Key Features

### ☁️ Certification Hub

Detailed preparation tracks for major technical certifications:

- **AWS Quiz**: Targeted practice for Cloud Practitioner & Solutions Architect.
- **Azure Quiz**: Comprehensive questions for Azure Fundamentals (AZ-900) and beyond.
- **PCAP Quiz**: Python Certified Associate in Programming prep with code-heavy labs.
- **Salesforce Quiz**: Specialist preparation for the Agentforce certification.
- **MongoDB Quiz**: Database skills verification and practice scenarios.
- **Customizable Modes**: Choose strictly timed exams or relaxed practice modes.

### 🦁 Bob Assistant

Your personal AI study companion, integrated directly into every quiz:

- **Instant Clarification**: Stuck on a question? Just ask Bob! He can explain complex concepts simply.
- **Context-Aware**: Bob knows exactly which question you are looking at and provides tailored help.
- **Mobile-Ready**: Featuring a smart collaborative interface (floating on desktop, bottom-sheet on mobile).
- **Interactive Learning**: Ask for examples, why other options are wrong, or deep dives into specific topics.

### 🤖 Intelligent Quiz Generator

Turn any document into a test:

- **Upload & Generate**: Support for PDFs and raw text.
- **Smart Context**: Extracts high-yield concepts, not just random keywords.
- **Resilient Architecture**: Uses a robust **Strategy Pattern** to automatically switch between AI providers (Gemini -> Groq) if one is busy or rate-limited.

### 🎙️ AI Interview Simulator

Experience the pressure of a real interview from home:

- **Voice-First Experience**: Utilizes **Native Web Speech API** for zero-latency transcription and browser-native TTS.
- **Zero Latency**: No server round-trips for speech processing means instant feedback.
- **Adaptive Feedback**: The AI analyzes your answers for technical accuracy and behavioral cues, providing constructive critique.

## 🛠️ Tech Stack & Quality

### ⚙️ Core Architecture

- **Next.js 13** (App Router)
- **TypeScript** (Strict Mode enables)
- **Tailwind CSS** (Responsive & Dark Mode optimized)
- **Server Actions**: Clean separation of business logic and UI.

### 🧪 Testing & Reliability

- **Vitest**: Comprehensive unit testing for logic (QuizService, Hooks).
- **Playwright**: End-to-End (E2E) testing for critical user flows.
- **Zod**: Runtime schema validation for AI responses.
- **Lucide React**: Standardized, lightweight iconography.

### 🧠 AI & Data

- **Google Gemini**: Primary reasoning engine (Flash 1.5 & 2.0).
- **Groq**: Uber-fast inference for real-time chat (Llama 3).
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

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Run the Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000` to start your prep!

## 🧪 Running Tests

Ensure the reliability of the application with our full test suite.

**Unit Tests (Logic & Components)**

```bash
npm test
# or
npx vitest run
```

**End-to-End Tests (Browser Flows)**

```bash
npx playwright test
```

## 🤝 Contributing

We love contributions! Whether it's adding a new quiz mode, improving AI prompts, or fixing a typo, your help is welcome.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<div align="center">
  Built with ❤️ by Bhima
</div>
