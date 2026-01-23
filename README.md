# Olleey Frontend

Olleey is a next-generation multi-language content management and distribution platform tailored for content creators. It enables seamless management of YouTube channels, automated video translation, and voice cloning to reach global audiences.

This is the frontend repository, built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

## 🚀 Key Features

*   **Dashboard**: Centralized hub for managing master and satellite channels.
*   **YouTube Integration**: Seamless OAuth connection to YouTube channels for upload and management.
*   **Multi-Language Support**: Manage content across multiple languages with ease.
*   **Voice Cloning**: Integration for voice training and quality checks.
*   **Modern UI/UX**:
    *   Responsive design with a "Spotify-like" dark/light theme aesthetic.
    *   Fluid animations using Framer Motion.
    *   Custom typography (Montserrat) and branding (Olleey Yellow).
*   **Authentication**: Secure login and user management.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **State/Data Fetching**: React Hooks, Custom API hooks.

## 🏁 Getting Started

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/olleey-frontend.git
    cd olleey-frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add:
    ```env
    NEXT_PUBLIC_API_URL=https://olleey-backend.onrender.com
    ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🧪 Scripts

*   `npm run dev`: Starts the local development server.
*   `npm run build`: Standard Next.js build.
*   `npm run lint`: Runs ESLint to check for code quality issues.
*   `npm run type-check`: Runs TypeScript compiler to check for type errors.
*   `npm run pages:build`: Builds the application for **Cloudflare Pages** (using `@cloudflare/next-on-pages`).
*   `npm run preview`: Builds and previews the Worker locally using Wrangler.

## ☁️ Deployment (Cloudflare Pages)

This project is configured for deployment on Cloudflare Pages.

1.  **Build the project:**
    ```bash
    npm run pages:build
    ```

2.  **Deploy using Wrangler:**
    ```bash
    npx wrangler pages deploy .vercel/output/static
    ```

## 📂 Project Structure

*   `/app`: Next.js App Router pages and layouts.
    *   `/app/api`: Edge-compatible API routes (e.g., logging).
    *   `/app/channels`: Channel management routes.
    *   `/app/youtube`: YouTube OAuth callback handlers.
*   `/components`: Reusable UI components.
    *   `/components/ui`: Core design system components (buttons, inputs, etc.).
    *   `/components/LandingPage`: Components specific to the landing page.
*   `/lib`: Utility functions, API wrappers (`api.ts`), and hooks (`useTheme`, `useVideos`).
*   `/public`: Static assets (images, fonts).

## 🎨 Theme & Branding

The application uses a custom color palette defined in `tailwind.config.js`, featuring the signature **Olleey Yellow**. The global font is set to **Montserrat** for a modern, clean look.

## 📝 License

[Add License Here]
