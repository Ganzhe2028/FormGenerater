# Project Context: Formaker (AI Form Engine)

## 1. Project Overview

**Formaker** is a high-performance, AI-powered **Text-to-Form** engine built with **Next.js 16 (App Router)** and **React 19**. It features a **Grok-inspired UI** (minimalist, dark-themed, chat-centric) and allows users to generate complex, multi-logic forms via natural language.

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
export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'email' 
  | 'select' 
  | 'checkbox' 
  | 'radio' 
  | 'rating' 
  | 'file' 
  | 'date' 
  | 'checkbox-group';

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Only for select, checkbox, radio, checkbox-group
  logic?: Array<{
    condition: string; // The trigger value, or '*' for "Always Jump"
    destination: string; // The target field ID
  }>;
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: number;
}

export interface Submission {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  submittedAt: string; // ISO String
}
```

### Core Components

- **Landing Page (`app/page.tsx`)**: Grok-style chat interface with a scrolling history sidebar, "Neural Log" console, and **Stop Generation** capability.
- **Builder (`app/builder/[id]/page.tsx`)**: 
  - Dual-mode interface: **Builder** (visual preview) and **Submissions** (data table).
  - Features: Title editing, high-fidelity live preview, Excel/CSV export, and guided "Share/Preview" actions.
- **FormRenderer (`components/form/FormRenderer.tsx`)**: The core logic engine handling dynamic field rendering, conditional jumps, validation (Zod), and form submission. Supports all 11 field types.
- **Settings (`app/settings/page.tsx`)**: Configuration for AI providers (OpenAI/Ollama), API keys, and model selection. Persists to cookies.

### Data Storage (`lib/db.ts`)

- **Strategy:** Decentralized JSON files.
- `data/forms/[id].json`: Stores form definitions.
- `data/submissions/[formId].json`: Stores an array of submissions for that specific form.

## 4. Key Directories

- `app/`: App Router pages and API routes.
  - `api/generate/`: AI streaming endpoint with cancellation support.
  - `api/ollama/`: Proxy for local Ollama model fetching.
- `components/form/`: Application-specific logic (`FormRenderer`).
- `lib/db.ts`: File-system CRUD operations.
- `data/`: Persistent storage (git-ignored for data safety, except placeholders).
- `store/`: Client-side state (Zustand).

## 5. Development Workflow

### AI Configuration

Controlled via the `/settings` page. Users can toggle between OpenAI and Ollama.

- **Ollama Support:** Includes automatic VRAM unloading (`keep_alive: 0`) after generation to save local resources.
- **Resilience:** Auto-fallback to manual model entry if local Ollama instance is unreachable.

### Scripts

- `npm run dev`: Development server with Turbopack.
- `npm run build`: Production build and type checking.
- `npm run lint`: ESLint check.

### Typography & Design

- **Primary Font:** Sans-serif (Geist/Inter).
- **Title Style:** `font-extrabold tracking-tight` for a premium SaaS feel.
- **Color Palette:** Zinc-based dark mode (`#09090b` background).