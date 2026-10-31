# DisputePilot AI — Backend

AI-Powered Payment Dispute Investigation and Evidence Management Platform.

## Technology Stack
- **FastAPI** + **Uvicorn** (Python 3.12+)
- **Neon PostgreSQL** + **SQLAlchemy 2.0**
- **Vector Search & RAG**: `pgvector` extension (`VECTOR(384)` with HNSW cosine similarity index)
- **Embeddings**: Sentence Transformers (`all-MiniLM-L6-v2`, 384 dimensions)
- **PayPal REST API** (Sandbox OAuth 2.0, Orders v2, Customer Disputes API, Webhooks)
- **Document Processing**: PyMuPDF, python-docx, pandas, openpyxl, Tesseract OCR
- **AI Agent Orchestration**: 5-Agent LangGraph-style pipeline with contradiction detection and merchant approval

---

## Neon PostgreSQL & pgvector Setup

### 1. Connection String
In `backend/.env`, set your Neon PostgreSQL database URL:
```ini
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2. Enable pgvector & Initialize Tables
The database initialization script automatically runs:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
And builds all relational models plus the `document_chunks` table with HNSW index:
```sql
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
ON document_chunks
USING hnsw (embedding vector_cosine_ops);
```

Run:
```powershell
python -m app.database.init_db
```

---

## Getting Started (Windows PowerShell)

### 1. Create Virtual Environment & Activate
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Configure PayPal Sandbox Credentials
Open `.env` and fill in your PayPal Sandbox credentials:
```ini
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

### 4. Initialize Database
```powershell
python -m app.database.init_db
```

### 5. Run Backend Server
```powershell
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## PayPal Webhook Registration
To register webhooks in PayPal Developer Dashboard:
1. Log into [PayPal Developer Dashboard](https://developer.paypal.com).
2. Go to **Apps & Credentials** -> Select your Sandbox App.
3. Scroll to **Webhooks** -> Click **Add Webhook**.
4. Set Webhook URL: `https://<your-ngrok-or-domain>/api/v1/webhooks/paypal`
5. Select events:
   - `CUSTOMER.DISPUTE.CREATED`
   - `CUSTOMER.DISPUTE.RESOLVED`
   - `CUSTOMER.DISPUTE.UPDATED`
   - `PAYMENT.CAPTURE.COMPLETED`
6. Copy Webhook ID and paste into `backend/.env` as `PAYPAL_WEBHOOK_ID`.
