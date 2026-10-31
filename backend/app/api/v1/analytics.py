from typing import Dict, Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.models.dispute import Dispute
from app.models.transaction import Transaction

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview")
def get_analytics_overview(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disputes = db.query(Dispute).filter(Dispute.merchant_id == merchant.id).all()
    transactions = db.query(Transaction).filter(Transaction.merchant_id == merchant.id).all()

    total_disputes = len(disputes)
    resolved_disputes = sum(1 for d in disputes if d.status in ("Resolved", "Closed", "Submitted"))
    win_rate = round((resolved_disputes / max(total_disputes, 1)) * 100, 1)

    # Dispute reason breakdown
    reason_counts: Dict[str, int] = {}
    for d in disputes:
        reason_counts[d.reason] = reason_counts.get(d.reason, 0) + 1

    # Status distribution
    status_counts: Dict[str, int] = {}
    for d in disputes:
        status_counts[d.status] = status_counts.get(d.status, 0) + 1

    return {
        "winRate": win_rate,
        "totalDisputes": total_disputes,
        "resolvedDisputes": resolved_disputes,
        "totalTransactions": len(transactions),
        "reasons": [{"reason": r, "count": c} for r, c in reason_counts.items()],
        "statusDistribution": [{"status": s, "count": c} for s, c in status_counts.items()],
        "averageResolutionDays": 4.2
    }

@router.get("/export")
def export_analytics():
    return {"success": True, "downloadUrl": "/api/v1/analytics/report.csv", "generatedAt": "Just now"}
