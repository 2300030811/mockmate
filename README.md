# 🚀 Mockmate - AI-Powered Interview Excellence

<div align="center">

![Mockmate Banner](https://img.shields.io/badge/AI-Powered-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-13-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Google Gemini](https://img.shields.io/badge/Google-Gemini-8E75B2?style=for-the-badge)
![Groq](https://img.shields.io/badge/Groq-Fast_Inference-orange?style=for-the-badge)

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

### ☁️ Cloud Certification Hub (New!)

Detailed preparation tracks for major cloud providers:

- **AWS Quiz**: Targeted practice for Cloud Practitioner & Solutions Architect.
- **Azure Quiz**: Comprehensive questions for Azure Fundamentals (AZ-900) and beyond.
- **Customizable Modes**: Choose strictly timed exams or relaxed study modes.

### 🤖 Intelligent Quiz Generator

Turn any document into a test:

- **Upload & Generate**: Support for PDFs and raw text.
- **Smart Context**: Extracts high-yield concepts, not just random keywords.
- **Resilient Architecture**: Uses a robust **Strategy Pattern** to automatically switch between AI providers (Gemini -> Groq) if one is busy or rate-limited.

### 🎙️ AI Interview Simulator

Experience the pressure of a real interview from home:

- **Voice-First Experience**: Utilizes **Web Speech API** for zero-latency transcription, falling back to **Groq Whisper** for complex audio.
- **Human-Like TTS**: Browser-native text-to-speech for natural conversational flow.
- **Adaptive Feedback**: The AI analyzes your answers for technical accuracy and behavioral cues, providing constructive critique.

## 🛠️ Tech Stack

### Framework & Core

- **Next.js 13** (App Router)
- **TypeScript** (Strict Mode)
- **Tailwind CSS** (Responsive & Dark Mode optimized)
- **Framer Motion** (Smooth animations)

### AI & Data

- **Google Gemini**: Primary reasoning engine (Flash 1.5 & 2.0).
- **Groq**: Uber-fast inference for real-time chat (Llama 3, Mixtral).
- **Zod**: Type-safe schema validation.
- **Redis (Upstash)**: Rate limiting and caching.

### Deployment

- **Vercel**: Edge-ready deployment.

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
