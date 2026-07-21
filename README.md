# StratifyAI - AI-Powered Product Management Platform

StratifyAI is a secure, collaborative, full-stack B2B product management workspace designed to align company strategic goals with customer feedback. The platform automatically processes customer comments and documents, parses sentiment and category structures, and builds prioritized roadmaps and task backlogs.

---

## 🚀 Core Features

### 🔐 1. User Authentication & Authorization
* Complete Register/Login flow with password hashing using **Bcryptjs**.
* Route protection and secure session management using **JSON Web Tokens (JWT)**.
* Role-based access control (RBAC) supporting `Admin`, `Product Manager`, and `Developer` permissions.

### 📊 2. Project Workspace Dashboard
* Central workspace to create and manage product projects (Title, Description, and Objectives).
* Visual statistics tracking total project counts, feedback entries, and roadmap completion rates.
* Manual specification configuration or document processing (PDF/DOCX/TXT) to initialize project guidelines.

### 🔍 3. AI Feedback Ingestion & NLP Engine
* File ingestion pipeline supporting upload of feedback surveys, support logs, or reviews (PDF, DOCX, TXT).
* Automated NLP extraction using **Google Gemini AI** to determine:
  * **Sentiment**: Positive, Neutral, or Negative.
  * **Category**: Bug Report, Feature Request, Improvement, Question, or Praise.
  * **Priority Level**: Critical, High, Medium, or Low.
  * **Insights**: Key keywords, thematic summaries, and actionable suggestions.
* Responsive charts displaying sentiment and category distributions using **Recharts**.

### 🗺️ 4. AI Roadmap Generator
* Interactive Now/Next/Later prioritized roadmap planning board.
* Strategy allocation parameters to customize AI prioritizing formulas (Balanced, Strategic, Customer-Driven).
* One-click task generation to convert roadmap items directly into the execution backlog.

### 🤖 5. AI Copilot & Task Enhancer
* Interactive conversational assistant trained on project context and customer feedback.
* Starter prompts to instantly parse customer pain points.
* **Task Enhancer**: Sidebar tool that converts raw, single-sentence task descriptions into complete engineering cards with Acceptance Criteria and technical suggestions.

---

## 🛠️ Tech Stack

### Backend
* **Runtime**: Node.js with Express.js
* **Database**: MongoDB with Mongoose ODM
* **Authentication**: JWT & Bcryptjs
* **File Processing**: Multer, PDF-Parse, Mammoth (Word document parsing)
* **AI Inferences**: Google Gemini API & Vertex AI SDK

### Frontend
* **Core**: React 18, TypeScript, Tailwind CSS
* **State Management**: React Query (API Cache) & React Router
* **Visual Data**: Recharts (Dynamic Bar/Pie charts)
* **Text Formatting**: React-Markdown for AI replies

---

## 🚀 Getting Started

### 1. Environment Configuration

Create a `.env` file in the `server` directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/stratifyai
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=your_google_gemini_api_key_here
NODE_ENV=development
```

Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 2. Installation & Running

**Install Dependencies:**
```bash
# In the project root
cd server && npm install
cd ../client && npm install
```

**Start Development Servers:**
```bash
# Start backend server (runs on port 5001)
cd server && npm run dev

# In another terminal window, start client (runs on port 3000)
cd client && npm start
```

Visit `http://localhost:3000` to register your account!
