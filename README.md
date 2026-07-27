# StratifyAI — AI-Driven Customer Signal & Product Roadmap Studio

> A full-stack B2B SaaS platform for product managers and engineering teams. Automatically transforms raw customer feedback, support tickets, and product specification documents into multi-horizon release roadmaps, prioritized task backlogs, and real-time analytics.

---

## 🌟 Key Features

- 🔐 **JWT Authentication & Security**: Complete signup/login flow with Bcrypt password hashing, role-based authorization (Admin, Product Manager, Developer), and secure JWT token verification.
- 📊 **Pulse Hub Workspaces**: Multi-tenant product workspace dashboard for tracking active projects, feedback volumes, roadmap progress, and CSV data exports.
- 🔍 **NLP Signal Engine**: Ingests raw customer comments and documents (`PDF`, `DOCX`, `TXT`), parsing sentiment, category clusters (Bug, Feature, Improvement), and priority scores using **Google Gemini AI**.
- 🗺️ **Release Horizons Roadmap Board**: Generates prioritized **Now / Next / Later** delivery horizons using strategy allocation models (Balanced, Strategic, Customer-Driven). Converts roadmap cards to task backlogs in one click.
- 🤖 **Aura PM Copilot & Task Enhancer**: AI conversational assistant with context memory. Features an AI task enhancer that auto-generates engineering acceptance criteria.
- 📈 **Analytics Console**: Real-time SVG charts built with **Recharts** for sentiment distribution, category breakdowns, and task completion metrics.
- ⚡ **Optimized UX/UI**: Cyber-slate dark mode theme built with **Tailwind CSS**, atomic components (`Card`, `Button`, `Badge`, `Skeleton`), **Framer Motion** animations, toast alerts, and route-based `React.lazy()` code splitting.

---

## 🏗️ Architecture Overview

```
[ React 18 + TypeScript + Tailwind CSS ]  <--- HTTP / REST --->  [ Express.js + Node.js API ]
           │                                                                 │
   Framer Motion (UI)                                           JWT Auth & Rate Limiter
    Recharts (Viz)                                                            │
    Axios Interceptors                                               Mongoose ODM
           │                                                                 │
           └─────────────────────────────────────────────────────────►  MongoDB Database
                                                                             │
                                                                   Google Gemini AI API
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS & Glassmorphic Dark Design System
- **Animations**: Framer Motion
- **Data Visualization**: Recharts (Pie & Bar SVG Charts)
- **Routing**: React Router v6 (with `React.lazy()` code splitting)
- **HTTP Client**: Axios with JWT Bearer token interceptors & rate-limit retry logic

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose 7 ODM
- **Authentication**: JSON Web Tokens (JWT) & Bcryptjs
- **Document Parsing**: `pdf-parse`, `mammoth` (Word `.docx`), `multer`
- **AI Processing**: `@google/generative-ai` (Gemini API)
- **Security**: Helmet, Compression, Express Rate Limit, CORS

---

## 📁 Repository Structure

```
StratifyAI/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/         # Atomic UI Library (Card, Button, Badge, Skeleton, Toast, ConfirmModal)
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── pages/              # Dashboard, FeedbackManagement, RoadmapView, ChatInterface, Analytics, TaskManagement
│   │   ├── services/           # Axios API Interceptor & Endpoints
│   │   ├── App.tsx             # Route Configuration with Lazy Loading
│   │   └── index.css           # Global Theme Tokens & Custom Scrollbars
│   ├── .env.example
│   └── package.json
├── server/                     # Express Node.js Backend API
│   ├── controllers/            # Auth, Project, Feedback, Task, Roadmap, Chat Controllers
│   ├── middleware/             # Auth JWT Protect & Global Error Handler
│   ├── models/                 # Mongoose Schemas (User, Project, Feedback, Task, Roadmap, ChatSession)
│   ├── routes/                 # Express API Router Definitions
│   ├── services/               # Gemini AI Service & NLP Agent Orchestrator
│   ├── server.js               # Express & Socket.io Server Entrypoint
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: `v16+` or `v18+`
- **MongoDB**: Local instance running on `mongodb://localhost:27017` or MongoDB Atlas URI
- **Google Gemini API Key**: Obtain from [Google AI Studio](https://aistudio.google.com/)

### 1. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/stratifyai
JWT_SECRET=your_custom_jwt_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

Start the backend dev server:
```bash
npm run dev
```

### 2. Frontend Setup

In a new terminal window:
```bash
cd client
npm install
```

Create a `.env` file in the `client` folder:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

Start the React development server:
```bash
npm start
```

Visit `http://localhost:3000` to register your account!

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new PM or SDE account | No |
| `POST` | `/api/auth/login` | Authenticate user & return JWT | No |
| `GET` | `/api/projects` | Fetch user workspace projects | Yes |
| `POST` | `/api/projects` | Create a new product workspace | Yes |
| `POST` | `/api/projects/upload` | Initialize workspace via PRD upload | Yes |
| `GET` | `/api/feedback/project/:id` | Fetch customer signal logs | Yes |
| `POST` | `/api/feedback` | Log raw user comment & run AI analysis | Yes |
| `POST` | `/api/feedback/upload` | Batch ingest signals from PDF/DOCX | Yes |
| `POST` | `/api/roadmap/generate` | Formulate Now/Next/Later AI roadmap | Yes |
| `POST` | `/api/roadmap/:id/convert-to-tasks` | Convert horizon cards to task backlog | Yes |
| `POST` | `/api/tasks/enhance` | Generate AI acceptance criteria | Yes |

---

## 💬 Interview Pitch Script (2 Minutes)

> *"I built **StratifyAI**, an AI-driven B2B product management workspace that addresses a common pain point for product teams: turning unstructured customer feedback into prioritized release plans.*
>
> *Technically, on the frontend I built a responsive React 18 application in TypeScript using Tailwind CSS and Framer Motion. I created an atomic UI component library for consistent styling, implemented React.lazy code-splitting to minimize bundle size, and used native Blob APIs for CSV data exports.*
>
> *On the backend, I built a Node.js Express REST API connected to MongoDB. I integrated the Google Gemini API to parse sentiment, categories, and priority scores from uploaded PDF and Word documents using Multer, pdf-parse, and Mammoth. I secured all routes using JWT authentication and Bcrypt password hashing, and handled error states using a custom toast notification system and Promise.allSettled for API resilience."*
