# Formaker 🚀

Formaker is a premium **AI-powered Text-to-Form engine** that transforms natural language descriptions into professional, functional forms in seconds. Inspired by modern high-performance interfaces (like Grok), it combines a minimalist aesthetic with a powerful logic engine.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)
![OpenAI](https://img.shields.io/badge/AI-OpenAI%20%7C%20Ollama-green)

## UX & Design Highlights

- **Streaming generation UX:** Live "Neural Log" output, stream progress, and a **Stop Generation** control to abort mid-stream.
- **Prompt-to-form flow:** Quick-start prompt cards plus **Enter-to-generate** shortcut for fast iteration.
- **Grok-inspired aesthetic:** Dark zinc palette, glow accents, staggered transitions, and custom scrollbars.
- **History-first navigation:** Sidebar with date-bucketed history (Today/Yesterday/Previous 7 Days/Older), quick "New Form", and inline delete.
- **Builder polish:** Live preview, inline title editing, sticky action header, and guided publish highlight.
- **Submissions clarity:** Table view, per-row details, and one-click CSV/XLSX export.
- **Settings UX:** Provider toggle, model list refresh, manual model entry, and save confirmation.
- **Sharing & feedback:** Public share link + copy, preview button, friendly empty states, and a success confirmation screen.
- **Responsive layout:** Mobile header and layout fallbacks keep the experience usable on small screens.

## Form Capabilities

- **Field types:** text, textarea, number, email, select, checkbox, checkbox-group (multi-select), radio, rating, file, date, date-time.
- **Conditional logic:** Jump rules per field (including "always jump" wildcard) with visible-field filtering on submit.
- **Validation:** Zod-backed requirements, email/number coercion, and rating ranges inferred from placeholders (e.g., 1-10).

## Technical Advantages

- **Dual-provider AI:** OpenAI + Ollama, with base URL config, model list fetch, and manual fallback mode.
- **Streaming API:** Chunked responses with cancellation via `AbortController`.
- **Schema hardening:** Normalizes field types, fills missing IDs, and fixes timestamps to prevent invalid renders.
- **Local-first storage:** File-per-form JSON with per-form submissions; simple to inspect, version, and migrate.
- **Privacy by default:** AI settings persist in browser cookies; no server-side credential storage.
- **Exports built in:** CSV/XLSX download via ExcelJS + FileSaver.
- **Type-safe stack:** Next.js App Router + TypeScript strict mode, Radix/shadcn UI, Zustand store, and React Hook Form.

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

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4 (Dark/Zinc theme) + Radix UI (shadcn/ui)
- **State:** Zustand & React Hook Form
- **Validation:** Zod Schema Validation
- **AI:** OpenAI SDK with streaming & cancellation capabilities (Ollama compatible)
- **Storage:** Local file-based JSON database

## 📂 Project Highlights

- `components/form/FormRenderer.tsx`: Form runtime (rendering, validation, and conditional jumps).
- `lib/db.ts`: File-system adapter for form and submission persistence with normalization.
- `app/api/generate`: Streaming endpoint for AI orchestration and local model VRAM management.
- `app/api/forms`: CRUD for form metadata with schema normalization.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

_Built with precision for the next generation of form building._
