# Monk Form 🚀

Monk Form is a premium **AI-powered Text-to-Form engine** that transforms natural language descriptions into professional, functional forms in seconds. Inspired by modern high-performance interfaces (like Grok), it combines a minimalist aesthetic with a powerful logic engine.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)
![OpenAI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Ollama-green)

## ✨ Key Features

- **🤖 Dual AI Support:** Seamlessly toggle between **OpenAI (Cloud)** and **Ollama (Local)**.
- **💬 Grok-Style UI:** A clean, distraction-free chat interface with a real-time "Neural Log" console.
- **⚡ Streaming Generation:** Watch your form's JSON structure being built in real-time.
- **🔗 Conditional Logic:** Support for complex branching and "Always Jump" logic (e.g., skip questions based on answers).
- **📊 Data Management:**
  - File-per-form storage for better scalability.
  - Export submissions to **Excel/CSV** using ExcelJS.
- **⭐ Premium Components:** Includes visual 1-5 rating systems, advanced select inputs, and more.
- **📱 Mobile Ready:** Fully responsive design using Tailwind's latest v4 engine.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- (Optional) Ollama installed for local generation.

### Installation

1. **Clone & Install:**

   ```bash
   git clone https://github.com/your-username/monk-form.git
   cd monk-form
   npm install
   ```

2. **Configuration:**
   Open the app and navigate to the **Settings** (top-right icon) to configure your AI provider (API Keys, Base URLs, Model selection).

3. **Run Dev:**

```bash
npm run dev
```

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4 (Dark/Zinc theme)
- **State:** Zustand & React Hook Form
- **AI:** OpenAI SDK with streaming capabilities
- **Storage:** Local File-based JSON Database

## 📂 Project Highlights

- `components/form/FormRenderer.tsx`: The heart of the application, managing form state and jump logic.
- `lib/db.ts`: A robust file-system adapter for form and submission persistence.
- `app/api/generate`: Streaming endpoint that handles AI orchestration and local model VRAM management.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

_Built with precision for the next generation of form building._
