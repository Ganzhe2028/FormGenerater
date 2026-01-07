# Project Role
You are an expert Full-Stack Engineer specializing in Next.js, React, and AI integration. You are tasked with building a "Text-to-Form" application similar to Makeform.ai.

# Product Goal
Build a web application where users can input a natural language description (e.g., "A registration form for a coding workshop"), and the system uses an LLM to generate a functional, interactive HTML form. The form can be published via a unique URL for others to fill out.

# Tech Stack (Mandatory)
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI (This is crucial for the "Vibe" and modern look)
- **Form Handling:** React Hook Form + Zod
- **AI Integration:** OpenAI SDK (or Vercel AI SDK)
- **Database (MVP):** Use LocalStorage or a mock JSON file for now (but structure code for Prisma/PostgreSQL later).
- **Icons:** Lucide React

# Core Features & Requirements

## 1. Data Model (The "Brain")
The application relies on a strict JSON Schema. All forms must follow this structure.
*Definition:*
```typescript
type FieldType = 'text' | 'textarea' | 'number' | 'email' | 'select' | 'checkbox' | 'radio';

interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // Only for select, checkbox, radio
}

interface FormSchema {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  createdAt: number;
}


## 2. Key Pages & Components

### A. Landing Page / Generator (`/`)

- A clean, centered input area (textarea).
- A "Generate" button with a loading state.
- **Logic:**
  1. User types prompt.
  2. Call API `/api/generate`.
  3. Validate response against `FormSchema`.
  4. Redirect to Editor (`/builder/[id]`).

### B. Form Editor / Builder (`/builder/[id]`)

- **Left/Center:** Live preview of the generated form.
- **Right Sidebar (Optional):** Ability to manually edit field labels or add new fields (JSON Editor or GUI).
- **Action:** A "Publish" button that saves the form state and gives a public share link.

### C. Public View Page (`/view/[id]`)

- A minimal layout (different from the builder).
- Renders the form based on the ID.
- Submits data to a `/api/submit` endpoint (log to console for MVP).
- Must look professional (Card layout, shadows, nice typography).

## 3. The AI Generation Logic (System Prompt)

When calling the LLM, use a system prompt similar to this:

> "You are a form generation assistant. Output ONLY valid JSON matching the following TypeScript schema: {schema_definition}. Do not include markdown code blocks. Create a form based on this user request: {user_prompt}."

# Step-by-Step Implementation Plan for You

## Step 1: Setup & UI Scaffolding

- Initialize Next.js project.
- Install Tailwind and Shadcn UI (button, input, textarea, card, label, select, radio-group, checkbox).
- Create the layout wrapper.

## Step 2: The Core "FormRenderer" Component

- Create a component `<FormRenderer schema={data} />`.
- It must map through `schema.fields`.
- Switch based on `field.type` to render the correct Shadcn component.
- Use `react-hook-form` to handle validation.

## Step 3: API & AI Integration

- Create `app/api/generate/route.ts`.
- Use OpenAI to transform the prompt into the JSON structure defined in Section 1.
- Use `zod` to validate the AI response (retry if schema is invalid).

## Step 4: State Management (MVP)

- Use a global Context or Zustand store to hold the list of generated forms (simulating a database).
- Ensure that refreshing the `/view/[id]` page works by reading from this store (persist to LocalStorage for now).

# Design Vibe

- **Clean, Minimalist, SaaS-like.**
- Use heavy roundness (rounded-xl).
- Subtle borders and shadows.
- Font: Inter or Geist Sans.