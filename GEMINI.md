# Project Context: AI Form Generator

## 1. Project Overview
This project is a **Text-to-Form** web application built with **Next.js 16 (App Router)** and **React 19**. It allows users to generate functional, interactive HTML forms by describing them in natural language. The application uses an LLM (via OpenAI SDK) to generate a strict JSON schema which is then rendered into a UI. Forms and submissions are persisted server-side.

**Goal:** Create a clean, SaaS-like "Makeform.ai" clone.

## 2. Technology Stack
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **UI Library:** Shadcn/UI (Radix UI based) + Lucide React (Icons)
*   **Persistence:** JSON File DB (`data/db.json`) for forms and submissions.
*   **Export:** `xlsx` for CSV/Excel export.
*   **State Management:** Zustand (Client-side), API (Server-side).
*   **Form Handling:** React Hook Form + Zod.
*   **AI Integration:** OpenAI SDK (Targeting strict JSON output).

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
*   **Generator (`app/page.tsx`)**: Accepts user prompt, calls API to generate and save form.
*   **Builder (`app/builder/[id]/page.tsx`)**: 
    *   **Tab 1 (Builder):** Displays form preview and share link.
    *   **Tab 2 (Submissions):** Displays submission table with **CSV/Excel Export**.
*   **Viewer (`app/view/[id]/page.tsx`)**: Public-facing page. Fetches form from API, submits data to API.
*   **FormRenderer (`components/form/FormRenderer.tsx`)**: The engine that takes a `FormSchema` and renders the corresponding UI components.

### Data Storage (`lib/db.ts`)
*   **Backend:** Simple JSON-based database located at `data/db.json`.
*   **Entities:** Stores `forms` and `submissions`.
*   **Usage:** Ensures data persistence across server restarts and accessibility across different devices.

### API Routes
*   `POST /api/generate`: Generates form schema via AI and saves to DB.
*   `GET /api/forms/[id]`: Retrieves a specific form.
*   `POST /api/submit`: Saves a new form submission.
*   `GET /api/forms/[id]/submissions`: Retrieves all submissions for a specific form.

## 4. Key Directories
*   `app/`: App Router pages and API routes.
*   `components/ui/`: Reusable Shadcn UI components.
*   `components/form/`: Application-specific form components (`FormRenderer`).
*   `lib/`: Utility functions (`cn`, `db`).
*   `data/`: Contains `db.json` (runtime database).
*   `types/`: TypeScript interfaces/types.
*   `PRD.md`: Product Requirements Document.

## 5. Development Workflow

### Scripts
*   **Start Dev Server:** `npm run dev` (Default port 3000, or `npm run dev -- -p 3001 -H 0.0.0.0` for network access)
*   **Build:** `npm run build`
*   **Lint:** `npm run lint`

### Conventions
*   **Type Safety:** Strict adherence to `FormSchema`.
*   **Styling:** Mobile-first, using Tailwind utility classes and `cn()` helper.
*   **Components:** Modular, "V0-compatible" code style.