# AI Form Generator

A modern **Text-to-Form** web application built with Next.js 16, Tailwind CSS, and OpenAI. Users can generate functional, interactive forms simply by describing them, share them publicly, and collect responses with built-in analytics and export features.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-cyan)
![OpenAI](https://img.shields.io/badge/OpenAI-API-green)

## ✨ Features

-   **🤖 AI-Powered Generation:** Describe your form (e.g., "A registration form for a yoga class") and get a ready-to-use form in seconds.
-   **🎨 Dynamic Rendering:** Forms are rendered instantly using a robust JSON schema engine.
-   **🌐 Public Sharing:** generated forms get a unique public URL (`/view/[id]`) accessible from any device.
-   **💾 Data Persistence:** Forms and submissions are saved to a local JSON database, ensuring data is not lost.
-   **📊 Submission Management:**
    -   View all submissions in a clean data table.
    -   **Export to CSV** and **Export to Excel** for external analysis.
-   **💅 Modern UI:** Built with Shadcn/UI and Tailwind CSS for a sleek, responsive design.

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   OpenAI API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/nextjs-form-generator.git
    cd nextjs-form-generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=sk-your-api-key-here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

    > **Note:** To test on other devices in your network, run:
    > ```bash
    > npm run dev -- -H 0.0.0.0
    > ```

## 🛠️ Tech Stack

-   **Framework:** Next.js 16 (App Router)
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS
-   **UI Components:** Shadcn/UI, Radix UI, Lucide React
-   **Forms:** React Hook Form, Zod
-   **Database:** Local JSON (MVP)
-   **Excel Export:** SheetJS (xlsx)

## 📂 Project Structure

-   `app/api/generate`: AI generation logic.
-   `components/form/FormRenderer`: Core component that turns JSON schema into HTML.
-   `lib/db.ts`: Simple file-based database adapter.
-   `data/db.json`: Stores all forms and submissions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.