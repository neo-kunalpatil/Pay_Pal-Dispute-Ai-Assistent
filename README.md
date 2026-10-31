# DisputePilot AI — Full-Stack PayPal Payment Dispute Management Platform

DisputePilot AI is an autonomous payment dispute investigation and rebuttal platform designed for the PayPal ecosystem. It features a modern **React 19 + TypeScript + Vite + Tailwind CSS** frontend, a high-performance **FastAPI (Python 3.12)** backend, **Neon Serverless PostgreSQL with pgvector** dense semantic search, **PayPal Sandbox API** integration, and an autonomous **5-Stage LangGraph AI Multi-Agent Pipeline** powered by Google Gemini.

---

## 🌟 Key Features

- **5-Stage Autonomous AI Pipeline**:
  - **Stage 1 (Dispute Understanding)**: Ingests buyer statement, parses dispute reason (INR/SNAD), and assesses monetary exposure.
  - **Stage 2 (Evidence Retrieval)**: Semantic similarity search across merchant documents using 384-dimensional pgvector embeddings.
  - **Stage 3 (Evidence Verification)**: Detects chronological contradictions between buyer claims and carrier transit timestamps.
  - **Stage 4 (Policy Analysis)**: Evaluates claims against PayPal Seller Protection mandates (e.g. signature requirements on transactions ≥ $750).
  - **Stage 5 (Response Generation)**: Synthesizes a structured rebuttal citing verified evidence.
- **Three Role-Based Portals**:
  - **Merchant Workspace**: Manage active disputes, review AI recommendations, inspect the evidence vault, and submit approved rebuttals.
  - **Buyer Portal**: Browse order history, track claim status with a 4-step live stepper, and open INR/SNAD disputes.
  - **Admin & Analyst Center**: Oversee platform metrics, dispute win-loss ratios, webhook health, and AI audit trails.
- **Real JWT Authentication & Registration**: Controlled onboarding with Argon2/bcrypt password hashing, stateless Bearer tokens, and database tenant isolation.
- **PayPal Sandbox Ready**: Automated token generation, order sync, and simulated dispute webhook listeners.
- **Render Deployment Ready**: Pre-configured `render.yaml` with zero-downtime full-stack deployment.

---

## 🏗️ Architecture

```
DisputePilot AI Full-Stack
├── frontend/                     # React 19 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/           # UI Components (Sidebar, Topbar, Modals)
│   │   ├── context/              # AppContext & State Management
│   │   ├── pages/                # Role Dashboards & Public Interactive Hubs
│   │   └── services/api.ts       # Centralized REST API Service Layer
│   ├── public/_redirects         # SPA Routing Rewrites
│   └── vercel.json               # Optional Vercel SPA Config
├── backend/                      # Python 3.12 + FastAPI + SQLAlchemy 2.0
│   ├── app/
│   │   ├── api/v1/               # REST Endpoints (auth, disputes, paypal, etc.)
│   │   ├── core/                 # Config & Security Dependencies
│   │   ├── database/             # Neon PostgreSQL Session & pgvector Engine
│   │   ├── models/               # SQLAlchemy ORM Models (18 tables)
│   │   ├── schemas/              # Pydantic v2 Request/Response Schemas
│   │   └── services/             # AI Agents, PayPal Sandbox, Document OCR
│   ├── alembic/                  # Database Migrations
│   └── requirements.txt          # Python Dependencies
├── render.yaml                   # Unified Render Blueprint Configuration
└── .gitignore                    # Secrets & Build Artifact Exclusion
```

---

## 🚀 Quickstart (Local Development)

### Prerequisites
- Python 3.12+
- Node.js 20+ & npm
- PostgreSQL (Neon Serverless with pgvector recommended)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL, GEMINI_API_KEY, and PAYPAL credentials

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be available at: `http://localhost:8000/docs`

### 2. Frontend Setup
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Frontend will be running at: `http://localhost:5173`

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **Platform Admin** | `admin@disputepilot.demo` | `Admin@12345` |
| **Merchant Owner** | `merchant@disputepilot.demo` | `Merchant@12345` |
| **Merchant (Kunal)** | `kunalpatil3435@gmail.com` | `Merchant@12345` |
| **Dispute Analyst** | `analyst@disputepilot.demo` | `Analyst@12345` |
| **Personal Buyer** | `rahul.sharma@example.com` | `password123` |

---

## ☁️ Deployment on Render

This repository includes a `render.yaml` blueprint:
1. Push this repository to GitHub.
2. In Render, select **New +** &rarr; **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically configure:
   - `disputepilot-backend`: Python Web Service with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - `disputepilot-frontend`: Static Site with `npm run build`, `dist` directory, and SPA rewrite rules.
5. Add your environment variables in the Render dashboard:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `SECRET_KEY`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`

---

## 📄 License
MIT License. Built for modern payment dispute automation.

