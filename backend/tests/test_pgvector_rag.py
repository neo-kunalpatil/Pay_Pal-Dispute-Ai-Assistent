import pytest
from app.rag.embeddings import embedding_service
from app.rag.pgvector_client import pgvector_client
from app.rag.retrieval import retriever_service
from app.graph.state import InvestigationState
from app.graph.workflow import investigation_workflow
from app.database.session import SessionLocal
from app.database.init_db import init_db

@pytest.fixture(scope="module")
def setup_db():
    init_db()
    db = SessionLocal()
    from app.models.merchant import Merchant
    from app.models.document import Document

    # Ensure test merchants and documents exist to respect foreign keys
    test_merchants = [
        ("mch-test-1", "Test Merchant 1", "test1@example.com"),
        ("mch-tenant-A", "Tenant A Corp", "tenant-a@example.com"),
        ("mch-tenant-B", "Tenant B Corp", "tenant-b@example.com"),
    ]
    for mid, name, email in test_merchants:
        if not db.query(Merchant).filter(Merchant.id == mid).first():
            db.add(Merchant(id=mid, business_name=name, email=email))
    db.commit()

    test_docs = [
        ("doc-t1", "mch-test-1", "invoice_9921.pdf", "Invoices"),
        ("doc-t2", "mch-test-1", "ups_delivery.pdf", "Shipping Documents"),
        ("doc-b-secret", "mch-tenant-B", "secret_b.pdf", "Financial"),
    ]
    for did, mid, fname, cat in test_docs:
        if not db.query(Document).filter(Document.id == did).first():
            db.add(Document(
                id=did,
                merchant_id=mid,
                filename=fname,
                original_filename=fname,
                file_type="pdf",
                file_size="120 KB",
                file_size_bytes=122880,
                document_category=cat,
                storage_path=f"storage/uploads/{fname}"
            ))
    db.commit()

    yield db
    db.close()

def test_embedding_generation_384_dimensions():
    """Verify Sentence Transformers / fallback produces exact 384 dimensions"""
    sample_text = "FedEx tracking number 794829103942 dispatched to recipient address."
    vec = embedding_service.generate_embedding(sample_text)
    assert isinstance(vec, list)
    assert len(vec) == 384, f"Expected 384 dimensions, got {len(vec)}"
    assert all(isinstance(x, float) for x in vec)

def test_pgvector_storage_and_semantic_retrieval(setup_db):
    """Test storing chunks with embeddings and semantic cosine retrieval"""
    db = setup_db
    merchant_id = "mch-test-1"

    chunks = [
        {
            "merchant_id": merchant_id,
            "document_id": "doc-t1",
            "chunk_index": 1,
            "content": "Commercial Invoice ORD-9921 for Pro Gaming Headset $150.00 USD.",
            "embedding": embedding_service.generate_embedding("Commercial Invoice ORD-9921 for Pro Gaming Headset $150.00 USD."),
            "page_number": 1,
            "document_category": "Invoices",
            "filename": "invoice_9921.pdf"
        },
        {
            "merchant_id": merchant_id,
            "document_id": "doc-t2",
            "chunk_index": 1,
            "content": "UPS tracking 1Z9999999999999999 delivered to porch in Dallas TX.",
            "embedding": embedding_service.generate_embedding("UPS tracking 1Z9999999999999999 delivered to porch in Dallas TX."),
            "page_number": 1,
            "document_category": "Shipping Documents",
            "filename": "ups_delivery.pdf"
        }
    ]
    stored = pgvector_client.store_chunks(db, chunks)
    assert stored == 2

    # Query for tracking
    query_vec = embedding_service.generate_embedding("UPS shipment delivery proof tracking")
    hits = pgvector_client.search_semantic(db, merchant_id, query_vec, top_k=2)
    assert len(hits) > 0
    assert "ups_delivery.pdf" in [h["filename"] for h in hits]

def test_keyword_search(setup_db):
    """Test keyword search matching exact tracking identifiers"""
    db = setup_db
    merchant_id = "mch-test-1"

    hits = pgvector_client.search_keyword(db, merchant_id, "1Z9999999999999999", top_k=2)
    assert len(hits) > 0
    assert "1Z9999999999999999" in hits[0]["content"]

def test_hybrid_search_rrf(setup_db):
    """Test hybrid search with Reciprocal Rank Fusion (RRF)"""
    db = setup_db
    merchant_id = "mch-test-1"
    query = "Invoice ORD-9921 Gaming Headset"
    query_vec = embedding_service.generate_embedding(query)

    hits = pgvector_client.search_hybrid(db, merchant_id, query, query_vec, top_k=2)
    assert len(hits) > 0
    assert "rrf_score" in hits[0]
    assert hits[0]["rrf_score"] > 0

def test_tenant_isolation_security(setup_db):
    """CRITICAL: Ensure Merchant A can NEVER retrieve Merchant B's documents"""
    db = setup_db
    merchant_a = "mch-tenant-A"
    merchant_b = "mch-tenant-B"

    # Store sensitive contract for Merchant B
    secret_chunk = [{
        "merchant_id": merchant_b,
        "document_id": "doc-b-secret",
        "chunk_index": 1,
        "content": "CONFIDENTIAL FINANCIAL REPORT FOR MERCHANT B ONLY.",
        "embedding": embedding_service.generate_embedding("CONFIDENTIAL FINANCIAL REPORT FOR MERCHANT B ONLY."),
        "page_number": 1,
        "document_category": "Financial",
        "filename": "secret_b.pdf"
    }]
    pgvector_client.store_chunks(db, secret_chunk)

    # Merchant A searches for "confidential financial report"
    a_hits = retriever_service.retrieve(
        merchant_id=merchant_a,
        query="CONFIDENTIAL FINANCIAL REPORT",
        search_type="hybrid",
        db=db
    )
    # Must NOT return Merchant B's document
    assert not any("secret_b.pdf" in h.get("filename", "") for h in a_hits)
    assert not any(h.get("merchant_id") == merchant_b for h in a_hits)

def test_langgraph_5_agent_pipeline_with_pgvector(setup_db):
    """Test the complete 5-agent LangGraph pipeline using Neon pgvector retrieval"""
    import asyncio

    state = InvestigationState(
        merchant_id="mch-001",
        dispute_id="PP-D-12345",
        dispute_details={
            "id": "PP-D-12345",
            "order_id": "ORD-1001",
            "customer_name": "Rahul Sharma",
            "customer_email": "rahul.sharma@example.com",
            "product_name": 'Pro UltraBook Laptop 15"',
            "amount": 800.00,
            "reason": "Product Not Received",
            "complaint_description": "Buyer claims package never arrived.",
            "customer_statement": "Carrier marked it as delivered on Oct 22, but I checked my cameras and no courier stopped by."
        },
        buyer_complaint="Carrier marked it as delivered on Oct 22, but I checked my cameras and no courier stopped by."
    )

    final_state = asyncio.run(investigation_workflow.execute(state))
    assert final_state.workflow_status == "COMPLETED"
    assert len(final_state.evidence_requirements) >= 3
    assert len(final_state.policy_clauses) >= 2
    assert final_state.evidence_match_score > 0
    assert "Dear PayPal Dispute Resolution Specialist" in final_state.response_draft
    # Contradiction should be detected (dispatch Oct 25 vs claim Oct 22)
    assert len(final_state.contradictions) > 0
