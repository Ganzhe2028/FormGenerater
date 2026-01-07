# Formaker 🚀

Formaker is a premium **AI-powered Text-to-Form engine** that transforms natural language descriptions into professional, functional forms in seconds. Inspired by modern high-performance interfaces (like Grok), it combines a minimalist aesthetic with a powerful logic engine.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)
![OpenAI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Ollama-green)

## ✨ Key Features

- **🤖 Dual AI Support:** Seamlessly toggle between **OpenAI (Cloud)** and **Ollama (Local)**. Includes resilience handling and manual model entry.
- **💬 Grok-Style UI:** A clean, distraction-free chat interface with real-time "Neural Log", streaming generation, and **Stop Generation** control.
- **⚡ Smart Builder:** 
  - **Live Preview:** High-fidelity form rendering as you build.
  - **Logic Engine:** Complex conditional branching and "Always Jump" logic.
  - **New Field Types:** Now supports **File Uploads**, **Date Pickers**, and **Checkbox Groups**.
- **📊 Data & Analytics:**
  - Dedicated **Submissions Dashboard** with tabular view.
  - One-click export to **Excel/CSV**.
- **💾 Local First:**
  - File-per-form storage architecture.
  - Browser-based settings persistence (Cookies).
- **📱 Mobile Ready:** Fully responsive design using Tailwind's latest v4 engine.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- (Optional) Ollama installed for local generation.

### Installation

1. **Clone & Install:**

   ```bash
   git clone https://github.com/your-username/formaker.git
   cd formaker
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
- **Validation:** Zod Schema Validation
- **AI:** OpenAI SDK with streaming & cancellation capabilities
- **Storage:** Local File-based JSON Database

## 📂 Project Highlights

- `components/form/FormRenderer.tsx`: The heart of the application, managing form state, jump logic, and field rendering (11+ types).
- `lib/db.ts`: A robust file-system adapter for form and submission persistence.
- `app/api/generate`: Streaming endpoint that handles AI orchestration and local model VRAM management.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

_Built with precision for the next generation of form building._