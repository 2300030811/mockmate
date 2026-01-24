# Mockmate - AI-Powered Interview Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-13.4-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3.3-38bdf8" alt="Tailwind" />
</p>

## 🎯 Overview

Mockmate is a comprehensive AI-powered platform for interview preparation, featuring:

- **AI Quiz Generator** - Upload PDFs and generate intelligent quizzes
- **Mock Interviews** - Practice with AI-powered interview sessions
- **AWS Certification Prep** - Specialized quizzes for AWS exams
- **Real-time Transcription** - Voice-to-text with Gemini AI
- **Dark Mode** - Beautiful dark/light theme support

## ✨ Features

### 🤖 AI-Powered

- Google Gemini integration for quiz generation
- Real-time audio transcription
- Intelligent question generation from documents

### 🎨 Modern UI

- Gradient-based design system
- Smooth animations with Framer Motion
- Fully responsive across all devices
- Dark mode support

### 🚀 Performance

- Optimized Next.js 13 App Router
- Edge-ready API routes
- Efficient state management

## 🛠️ Tech Stack

### Frameworks

- **Next.js 13** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling

### AI & APIs

- **Google Gemini** - Quiz generation & transcription
- **Groq (Optional)** - Alternative transcription service

### UI Libraries

- **Framer Motion** - Smooth animations
- **HeadlessUI** - Accessible components
- **Tailwind Merge** - Class name utilities

### File Processing

- **PDF Parse** - Extract text from PDFs
- **Formidable** - File upload handling

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd mockmate

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env.local` file:

```env
# Google Gemini API Key (Required)
GOOGLE_API_KEY=your_gemini_api_key_here

# Optional: Groq API for transcription
GROQ_API_KEY=your_groq_api_key_here

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Get your API keys:

- **Gemini**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Groq**: [Groq Console](https://console.groq.com)

## 🚀 Usage

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
mockmate/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── convert/       # PDF conversion
│   │   ├── quiz/          # Quiz generation
│   │   └── interview/     # Interview APIs
│   ├── demo/              # Interview demo pages
│   ├── upload/            # Quiz upload page
│   └── page.tsx           # Homepage
├── components/            # Reusable components
├── styles/                # Global styles
├── public/                # Static assets
└── utils/                 # Utility functions
```

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#3B82F6) to Purple (#A855F7)
- **Secondary**: Cyan (#06B6D4) to Pink (#EC4899)
- **Background (Dark)**: Gray-950 → Blue-950
- **Background (Light)**: Gray-50 → Blue-50

### Components

- Gradient buttons with hover effects
- Glass morphism cards
- Animated backgrounds
- Consistent spacing (4px, 8px, 16px, 24px)

## 📊 Features Breakdown

### Quiz Generator (`/upload`)

1. Upload PDF or TXT files
2. AI extracts and analyzes content
3. Generates multiple-choice questions
4. Interactive quiz interface with progress tracking
5. Instant feedback and explanations

### Mock Interview (`/demo`)

1. Choose interview type (Behavioral/Technical)
2. Real-time AI conversation
3. Voice or text input
4. Live transcription
5. Professional interview simulation

### AWS Quiz (`/aws-quiz`)

- Curated AWS certification questions
- Multiple quiz modes
- Progress tracking
- Detailed explanations

## 🔧 Optimization

### Size Reduction

The project has been optimized from 1200MB to ~500MB:

- Removed `.next` build cache
- Cleaned unnecessary files
- Optimized dependencies

### Performance

- Lazy loading for heavy components
- GPU-accelerated animations
- Efficient API routes
- Optimized bundle size

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Other Platforms

- **Netlify**: Compatible with Next.js
- **Azure**: See `AZURE_DEPLOYMENT.md`
- **Custom Server**: Use `npm run build && npm start`

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Gemini API has rate limits on free tier
- Large PDFs may take longer to process
- Audio transcription requires microphone permissions

## 💡 Tips

- Use smaller PDF files for faster processing
- Gemini API quota resets daily
- Dark mode preference persists across sessions
- All API keys should be kept in `.env.local`

## 📞 Support

For issues or questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js and Google Gemini AI**
