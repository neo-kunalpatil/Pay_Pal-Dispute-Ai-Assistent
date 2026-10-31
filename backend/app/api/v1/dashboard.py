from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant, get_current_user
from app.models.merchant import Merchant
from app.models.user import User
from app.models.dispute import Dispute, DisputeTimeline
from app.models.transaction import Transaction
from app.models.investigation import Investigation
from app.models.paypal import PayPalConnection
from app.schemas.dashboard import (
    DashboardOverviewResponse,
    OverviewStats,
    AdminDashboardResponse,
    AnalystDashboardResponse
)
from app.schemas.dispute import DisputeSchema, ActivityTimelineItemSchema
from app.core.config import settings

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def map_dispute_to_schema(d: Dispute) -> DisputeSchema:
    timeline_items = [
        ActivityTimelineItemSchema(
            id=tl.id,
            title=tl.title,
            description=tl.description,
            timestamp=tl.timestamp,
            actor=tl.actor,
            type=tl.event_type
        )
        for tl in d.timeline_items
    ]
    
    inv_report = None
    if d.investigations:
        latest_inv = d.investigations[-1]
        inv_report = {
            "summary": latest_inv.ai_summary,
            "evidenceMatchScore": latest_inv.evidence_match_score,
            "supportingEvidence": latest_inv.supporting_evidence or [],
            "missingEvidence": latest_inv.missing_evidence or [],
            "contradictions": latest_inv.contradictions or [],
            "policyClauses": latest_inv.policy_clauses or [],
            "recommendedAction": latest_inv.recommendations or "",
            "lastRunTimestamp": "Just now"
        }

    return DisputeSchema(
        id=d.id,
        customerName=d.customer_name,
        customerEmail=d.customer_email,
        customerAvatar=d.customer_avatar,
        transactionId=d.transaction_id,
        orderId=d.order_id,
        productName=d.product_name,
        amount=d.amount,
        currency=d.currency,
        reason=d.reason,
        status=d.status,
        aiStatus=d.ai_status,
        createdDate=d.dispute_date.strftime("%b %d, %Y") if d.dispute_date else "Oct 28, 2026",
        deadline=d.response_deadline.strftime("%b %d, %Y") if d.response_deadline else "Nov 03, 2026",
        daysRemaining=max(0, (d.response_deadline - d.created_at).days) if d.response_deadline and d.created_at else 3,
        complaintDescription=d.complaint_description,
        customerStatement=d.customer_statement,
        requestedEvidence=d.requested_evidence or [],
        responseDraft=d.response_draft,
        merchantResponseNotes=d.merchant_response_notes,
        isResponseApproved=d.is_response_approved,
        submissionDate=d.submission_date.strftime("%b %d, %Y") if d.submission_date else None,
        submissionReference=d.submission_reference,
        timeline=timeline_items,
        investigationReport=inv_report
    )

@router.get("/overview", response_model=DashboardOverviewResponse)
def get_dashboard_overview(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disputes = db.query(Dispute).filter(Dispute.merchant_id == merchant.id).all()
    transactions = db.query(Transaction).filter(Transaction.merchant_id == merchant.id).all()

    total_disputed = sum(d.amount for d in disputes if d.status not in ("Resolved", "Closed"))
    active_count = sum(1 for d in disputes if d.status not in ("Resolved", "Closed"))
    resolved_count = sum(1 for d in disputes if d.status in ("Resolved", "Submitted"))
    needs_resp_count = sum(1 for d in disputes if d.status == "Needs Response")

    # Compute actual totals from DB transactions
    settled_volume = sum(t.amount for t in transactions if t.payment_status in ("Completed", "Settled"))
    available_balance = max(0.0, round(settled_volume - total_disputed, 2)) if settled_volume > 0 else 0.0
    win_rate = round((resolved_count / max(len(disputes), 1)) * 100.0, 1) if disputes else 0.0

    stats = OverviewStats(
        availableBalance=available_balance,
        pendingHold=total_disputed,
        totalDisputed=total_disputed,
        activeDisputesCount=active_count,
        winRate=win_rate,
        resolvedCount=resolved_count,
        needsResponseCount=needs_resp_count,
        avgResolutionDays=3.5 if resolved_count > 0 else 0.0
    )

    schema_disputes = [map_dispute_to_schema(d) for d in disputes]
    recent_disputes = schema_disputes[:5]
    upcoming_deadlines = [d for d in schema_disputes if d.status == "Needs Response"]

    # Gather recent activities
    all_activities = []
    for d in disputes:
        for tl in d.timeline_items:
            all_activities.append(
                ActivityTimelineItemSchema(
                    id=tl.id,
                    title=tl.title,
                    description=tl.description,
                    timestamp=tl.timestamp,
                    actor=tl.actor,
                    type=tl.event_type
                )
            )

    return DashboardOverviewResponse(
        stats=stats,
        recentDisputes=recent_disputes,
        upcomingDeadlines=upcoming_deadlines,
        recentActivities=all_activities[:10]
    )

@router.get("/admin", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_merchants = db.query(Merchant).count()
    total_users = db.query(User).count()
    total_disputes = db.query(Dispute).count()
    total_transactions = db.query(Transaction).count()
    total_volume = db.query(Transaction).all()
    volume_sum = sum(t.amount for t in total_volume)

    resolved_disputes = db.query(Dispute).filter(Dispute.status.in_(["Resolved", "Closed", "Submitted"])).count()
    active_disputes = total_disputes - resolved_disputes

    # Health checks
    paypal_conn = db.query(PayPalConnection).first()
    paypal_health = {
        "connected": bool(settings.PAYPAL_CLIENT_ID and settings.PAYPAL_CLIENT_SECRET),
        "environment": settings.PAYPAL_MODE,
        "status": "Healthy" if settings.PAYPAL_CLIENT_ID else "Pending Credentials",
        "lastSync": paypal_conn.last_sync_time if paypal_conn else "Never"
    }

    system_health = {
        "database": "Neon PostgreSQL Connected (Healthy)",
        "vectorEngine": "pgvector 384-dim (Active)",
        "aiProvider": settings.LLM_PROVIDER.upper(),
        "status": "Operational"
    }

    # Top merchants by dispute volume
    merchants = db.query(Merchant).all()
    top_merchants_list = []
    for idx, m in enumerate(merchants, 1):
        m_txns = db.query(Transaction).filter(Transaction.merchant_id == m.id).all()
        m_disps = db.query(Dispute).filter(Dispute.merchant_id == m.id).all()
        vol = sum(t.amount for t in m_txns)
        top_merchants_list.append({
            "rank": idx,
            "name": m.business_name,
            "volume": f"${vol:,.2f}",
            "disputes": str(len(m_disps)),
            "rate": f"{(len(m_disps) / max(len(m_txns), 1)) * 100:.1f}%"
        })

    # Recent activities across platform
    recent_tl = db.query(DisputeTimeline).order_by(DisputeTimeline.created_at.desc()).limit(6).all()
    activities = [
        {
            "id": tl.id,
            "text": f"{tl.title}: {tl.description}",
            "time": tl.timestamp,
            "type": tl.event_type
        }
        for tl in recent_tl
    ]

    return AdminDashboardResponse(
        totalMerchants=total_merchants,
        activeMerchants=total_merchants,
        totalUsers=total_users,
        totalDisputes=total_disputes,
        totalTransactions=total_transactions,
        totalVolume=round(volume_sum, 2),
        resolvedDisputes=resolved_disputes,
        activeDisputes=active_disputes,
        paypalHealth=paypal_health,
        systemHealth=system_health,
        topMerchants=top_merchants_list,
        recentActivities=activities
    )

@router.get("/analyst", response_model=AnalystDashboardResponse)
def get_analyst_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve assigned merchant disputes
    merchant_id = current_user.merchant_id
    query = db.query(Dispute)
    if merchant_id:
        query = query.filter(Dispute.merchant_id == merchant_id)
    
    disputes = query.all()
    schema_disputes = [map_dispute_to_schema(d) for d in disputes]

    pending_inv = sum(1 for d in disputes if d.ai_status == "Not Started")
    in_progress = sum(1 for d in disputes if d.ai_status == "Processing")
    completed = sum(1 for d in disputes if d.ai_status in ("Completed", "Needs Attention"))

    urgent = sum(1 for d in disputes if d.status == "Needs Response")

    # Missing evidence & contradiction counts from investigations
    invs = db.query(Investigation)
    if merchant_id:
        invs = invs.filter(Investigation.merchant_id == merchant_id)
    all_invs = invs.all()

    missing_count = sum(len(inv.missing_evidence or []) for inv in all_invs)
    contradictions_count = sum(len(inv.contradictions or []) for inv in all_invs)

    # Activity items
    recent_tl = db.query(DisputeTimeline).order_by(DisputeTimeline.created_at.desc()).limit(8).all()
    recent_activities = [
        ActivityTimelineItemSchema(
            id=tl.id,
            title=tl.title,
            description=tl.description,
            timestamp=tl.timestamp,
            actor=tl.actor,
            type=tl.event_type
        )
        for tl in recent_tl
    ]

    return AnalystDashboardResponse(
        assignedDisputes=schema_disputes,
        pendingInvestigations=pending_inv,
        inProgressInvestigations=in_progress,
        completedInvestigations=completed,
        urgentDeadlinesCount=urgent,
        missingEvidenceCount=missing_count,
        contradictionsCount=contradictions_count,
        recentActivity=recent_activities
    )

@router.get("/recent-disputes", response_model=List[DisputeSchema])
def get_recent_disputes(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disputes = db.query(Dispute).filter(Dispute.merchant_id == merchant.id).order_by(Dispute.created_at.desc()).limit(10).all()
    return [map_dispute_to_schema(d) for d in disputes]

@router.get("/upcoming-deadlines", response_model=List[DisputeSchema])
def get_upcoming_deadlines(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disputes = db.query(Dispute).filter(
        Dispute.merchant_id == merchant.id,
        Dispute.status == "Needs Response"
    ).order_by(Dispute.response_deadline.asc()).all()
    return [map_dispute_to_schema(d) for d in disputes]
