from typing import Dict, Any
from app.graph.state import InvestigationState
from app.agents.dispute_understanding import dispute_understanding_agent
from app.agents.evidence_retrieval import evidence_retrieval_agent
from app.agents.policy_analysis import policy_analysis_agent
from app.agents.evidence_verification import evidence_verification_agent
from app.agents.response_generation import response_generation_agent

class DisputeInvestigationWorkflow:
    """LangGraph-style 5-Stage Orchestrator for Dispute Investigation"""

    async def execute(self, state: InvestigationState) -> InvestigationState:
        try:
            # Stage 1: Dispute Understanding Node
            out1 = dispute_understanding_agent.run(state)
            state.claim_type = out1["claim_type"]
            state.target_amount = out1["target_amount"]
            state.evidence_requirements = out1["evidence_requirements"]
            state.key_dates = out1["key_dates"]

            # Stage 2: Evidence Retrieval Node (Neon pgvector RAG)
            out2 = evidence_retrieval_agent.run(state)
            state.retrieved_documents = out2["retrieved_documents"]

            # Stage 3: Policy Analysis Node
            out3 = policy_analysis_agent.run(state)
            state.policy_clauses = out3["policy_clauses"]

            # Stage 4: Evidence Verification Node
            out4 = evidence_verification_agent.run(state)
            state.verified_evidence = out4["verified_evidence"]
            state.missing_evidence = out4["missing_evidence"]
            state.contradictions = out4["contradictions"]
            state.evidence_match_score = out4["evidence_match_score"]

            # Stage 5: Response Generation Node
            out5 = response_generation_agent.run(state)
            state.response_draft = out5["response_draft"]
            state.investigation_summary = out5["investigation_summary"]
            state.recommendations = out5["recommendations"]
            state.workflow_status = "COMPLETED"

        except Exception as exc:
            state.workflow_status = "FAILED"
            state.errors.append(str(exc))

        return state

investigation_workflow = DisputeInvestigationWorkflow()
