# Project Context: Monk Form (AI Form Engine)

## 1. Project Overview

**Monk Form** is a high-performance, AI-powered **Text-to-Form** engine built with **Next.js 16 (App Router)** and **React 19**. It features a **Grok-inspired UI** (minimalist, dark-themed, chat-centric) and allows users to generate complex, multi-logic forms via natural language.

**Core Vision:** A lightning-fast, visually premium form builder that bridges the gap between natural language prompts and functional web applications.

## 2. Technology Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4 (Custom Zinc/Dark palette)
- **UI Library:** Shadcn/UI (Radix UI) + Lucide React (Icons)
- **Persistence:** File-per-item architecture (`data/forms/` and `data/submissions/`).
- **AI Integration:** OpenAI SDK supporting both OpenAI and local Ollama models.
- **Export:** `exceljs` for XLSX/CSV generation.
- **State Management:** Zustand (Client) + API (Server).

## 3. Architecture & Data Model

### Data Model (`types/index.ts`)

```typescript
interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: number;
}

interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "select"
    | "checkbox"
    | "radio"
    | "rating";
  required: boolean;
  options?: string[];
  logic?: Array<{
    condition: string; // The trigger value, or '*' for "Always Jump"
    destination: string; // The target field ID
  }>;
}
```

### Core Components

- **Landing Page (`app/page.tsx`)**: Grok-style chat interface with a scrolling history sidebar and a "Neural Log" console for AI generation visibility.
- **Builder (`app/builder/[id]/page.tsx`)**: Management interface with live preview, logic configuration, and submission tracking.
- **FormRenderer (`components/form/FormRenderer.tsx`)**: The core logic engine handling dynamic field rendering, conditional jumps, and form submission.

### Data Storage (`lib/db.ts`)

- **Strategy:** Decentralized JSON files.
- `data/forms/[id].json`: Stores form definitions.
- `data/submissions/[formId].json`: Stores an array of submissions for that specific form.

## 4. Key Directories

- `app/`: App Router pages and API routes.
- `components/form/`: Application-specific logic (`FormRenderer`).
- `lib/db.ts`: File-system CRUD operations.
- `data/`: Persistent storage (git-ignored for data safety, except placeholders).
- `store/`: Client-side state (Zustand).

## 5. Development Workflow

### AI Configuration

Controlled via the `/settings` page. Users can toggle between OpenAI and Ollama.

- **Ollama Support:** Includes automatic VRAM unloading (`keep_alive: 0`) after generation to save local resources.

### Scripts

- `npm run dev`: Development server with Turbopack.
- `npm run build`: Production build and type checking.
- `npm run lint`: ESLint check.

### Typography & Design

- **Primary Font:** Sans-serif (Geist/Inter).
- **Title Style:** `font-extrabold tracking-tight` for a premium SaaS feel.
- **Color Palette:** Zinc-based dark mode (`#09090b` background).
