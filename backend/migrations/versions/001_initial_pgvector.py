"""Initial schema with Neon pgvector

Revision ID: 001_initial_pgvector
Revises: 
Create Date: 2026-10-31

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial_pgvector'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. Enable pgvector extension
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Document chunks with VECTOR(384)
    op.execute("""
    CREATE TABLE IF NOT EXISTS document_chunks (
        id VARCHAR(50) PRIMARY KEY,
        merchant_id VARCHAR(36) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
        document_id VARCHAR(50) NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
        dispute_id VARCHAR(50) REFERENCES disputes(id) ON DELETE SET NULL,
        chunk_index INTEGER NOT NULL DEFAULT 1,
        chunk_text TEXT NOT NULL,
        embedding vector(384),
        page_number INTEGER DEFAULT 1,
        document_category VARCHAR(100) NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # 3. Create HNSW index for cosine distance
    op.execute("""
    CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding
    ON document_chunks
    USING hnsw (embedding vector_cosine_ops);
    """)

    # 4. Multi-tenant and query indexes
    op.execute("""
    CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_doc ON document_chunks(merchant_id, document_id);
    CREATE INDEX IF NOT EXISTS idx_document_chunks_tenant_dispute ON document_chunks(merchant_id, dispute_id);
    CREATE INDEX IF NOT EXISTS idx_document_chunks_category ON document_chunks(merchant_id, document_category);
    """)

def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS document_chunks CASCADE;")
