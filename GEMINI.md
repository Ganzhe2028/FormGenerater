# Project Context: AI Form Generator

## 1. Project Overview
This project is a **Text-to-Form** web application built with **Next.js 16 (App Router)** and **React 19**. It allows users to generate functional, interactive HTML forms by describing them in natural language. The application uses an LLM (via OpenAI SDK) to generate a strict JSON schema which is then rendered into a UI.

**Goal:** Create a clean, SaaS-like "Makeform.ai" clone.

## 2. Technology Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **UI Library:** Shadcn/UI (Radix UI based) + Lucide React (Icons)
*   **State Management:** Zustand (persisted to `localStorage` for MVP)
*   **Form Handling:** React Hook Form + Zod
*   **AI Integration:** OpenAI SDK (Targeting strict JSON output)
*   **Validation:** Zod (for both user input and AI response validation)

## 3. Architecture & Data Model

### Data Model (`types/index.ts`)
The application is driven by a strict JSON schema. The core interface is `FormSchema`:
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
  type: 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio';
  required: boolean;
  options?: string[];
}
```

### Core Components
*   **Generator (`app/page.tsx`)**: Accepts user prompt, calls API, and redirects to builder.
*   **Builder (`app/builder/[id]/page.tsx`)**: Displays the generated form and allows sharing.
*   **Viewer (`app/view/[id]/page.tsx`)**: Public-facing page for users to fill out the form.
*   **FormRenderer (`components/form/FormRenderer.tsx`)**: The engine that takes a `FormSchema` and renders the corresponding UI components using `react-hook-form`.

### State Management (`store/formStore.ts`)
*   Uses `zustand` with `persist` middleware.
*   Acts as a client-side database (MVP) storing all generated forms in `localStorage`.

### AI Integration (`app/api/generate/route.ts`)
*   Endpoint that receives a prompt.
*   Instructs LLM to return **only** valid JSON matching `FormSchema`.
*   Validates response before sending to client.

## 4. Key Directories
*   `app/`: App Router pages and API routes.
*   `components/ui/`: Reusable Shadcn UI components.
*   `components/form/`: Application-specific form components (`FormRenderer`).
*   `lib/`: Utility functions (`cn` for Tailwind).
*   `store/`: Zustand store definitions.
*   `types/`: TypeScript interfaces/types.
*   `PRD.md`: Product Requirements Document (Source of Truth for features).

## 5. Development Workflow

### Scripts
*   **Start Dev Server:** `npm run dev`
*   **Build:** `npm run build`
*   **Lint:** `npm run lint`

### Conventions
*   **Type Safety:** Strict adherence to `FormSchema`.
*   **Styling:** Mobile-first, using Tailwind utility classes and `cn()` helper.
*   **Components:** Modular, "V0-compatible" code style.
