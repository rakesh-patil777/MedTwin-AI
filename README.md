# MedTwin AI 🧬

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Groq API](https://img.shields.io/badge/Groq_API-000000?style=for-the-badge&logo=ai&logoColor=white)](https://groq.com/)

A premium, state-of-the-art Medical AI interface that transforms unstructured PDF clinical logs and medical data into interactive, strictly-parsed Generative Insights using ultra-fast Groq (Llama 3.1) endpoints.

## 🚀 Key Features

*   **SaaS-Grade Architecture**: Designed using a gorgeous Light Beige (`#faf0e6`) canvas, glassmorphism layouts, and deep Mocha espresso borders to completely eliminate harsh tech aesthetics and build trust.
*   **Procedural 3D Visuals**: Incorporates a pure mathematical rendering of an anatomical organ via `@react-three/fiber` without heavy external `.glb` dependencies.
*   **Hardware Accelerated Scrolling**: Natively integrated `@studio-freight/lenis` providing butter-smooth 120Hz synchronized scrolling throughout the application.
*   **Split-Workspace Dashboard**: A dual-column architecture allowing users to constantly view their file queue while the AI natively streams diagnostic analytics to the master pane.
*   **Absolute Context Mapping**: Instantly extracts NLP data bounds from complex medical jargon right down to specific glucose arrays.

## 🛠️ Technology Stack

**Frontend Intelligence**
*   React 18 + Vite (ESM routing)
*   React Router v6
*   Tailwind CSS v4 (Procedural arbitrary custom token compilation)
*   Lucide React, Framer Motion, Lenis Scroll
*   React Three Fiber + Drei (Three.js Engine)

**Backend Orchestration**
*   Node.js (Express.js)
*   Multer memory buffer allocations
*   PDF-Parse logic bounds
*   Groq API Node SDK for hyper-fast Llama-3 parsing

## ⚙️ Local Development Quickstart

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/MedTwin-AI.git
   cd MedTwin AI
   ```

2. **Configure the Backend**
   Navigate to the backend and insert your Groq API key:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   GROQ_API_KEY=gsk_your_key_here
   ```
   Start the Node server:
   ```bash
   npm run dev
   ```

3. **Configure the Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   > The application will instantly mount at `http://localhost:5173`.

## 🛡️ Security Infrastructure
MedTwin AI is currently a conceptual model for interpreting personal PDFs locally using Groq instances. It explicitly ignores PHI extraction natively to prevent HIPAA violations unless properly vaulted inside enterprise logic controllers.

---
*Built intricately for next-generation clinical workflows.* ⚡
