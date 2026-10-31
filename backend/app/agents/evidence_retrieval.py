from typing import Dict, Any, List
from app.graph.state import InvestigationState
from app.rag.retrieval import retriever_service

class EvidenceRetrievalAgent:
    """Agent 2: Retrieves relevant invoices, shipping receipts, policies, and communications using Neon pgvector hybrid search"""

    def run(self, state: InvestigationState) -> Dict[str, Any]:
        merchant_id = state.merchant_id
        order_id = state.dispute_details.get("order_id", "")
        customer_name = state.dispute_details.get("customer_name", "")
        reason = state.claim_type

        query = f"order {order_id} customer {customer_name} {reason} shipment tracking delivery invoice policy"

        hits = retriever_service.retrieve(
            merchant_id=merchant_id,
            query=query,
            dispute_id=state.dispute_id,
            top_k=8,
            search_type="hybrid"
        )

        return {"retrieved_documents": hits}

evidence_retrieval_agent = EvidenceRetrievalAgent()
