from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.schemas.dispute import DisputeSchema, DisputeCreateRequest, ActivityTimelineItemSchema
from app.schemas.document import DocumentResponse
from app.services.dispute_service import dispute_service
from app.api.v1.dashboard import map_dispute_to_schema

router = APIRouter(prefix="/disputes", tags=["Disputes"])

@router.get("", response_model=List[DisputeSchema])
def list_disputes(
    status: Optional[str] = Query(None),
    reason: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disputes = dispute_service.list_disputes(db, merchant.id, status=status, reason=reason, search=search)
    return [map_dispute_to_schema(d) for d in disputes]

@router.get("/{dispute_id}", response_model=DisputeSchema)
def get_dispute(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disp = dispute_service.get_dispute(db, merchant.id, dispute_id)
    return map_dispute_to_schema(disp)

@router.get("/{dispute_id}/timeline", response_model=List[ActivityTimelineItemSchema])
def get_dispute_timeline(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disp = dispute_service.get_dispute(db, merchant.id, dispute_id)
    return [
        ActivityTimelineItemSchema(
            id=tl.id,
            title=tl.title,
            description=tl.description,
            timestamp=tl.timestamp,
            actor=tl.actor,
            type=tl.event_type
        )
        for tl in disp.timeline_items
    ]

@router.get("/{dispute_id}/documents", response_model=List[DocumentResponse])
def get_dispute_documents(
    dispute_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disp = dispute_service.get_dispute(db, merchant.id, dispute_id)
    docs = [dd.document for dd in disp.dispute_documents if dd.document]
    return [
        DocumentResponse(
            id=d.id,
            name=d.filename,
            category=d.document_category,
            fileType=d.file_type,
            size=d.file_size,
            uploadDate="Just now",
            status=d.processing_status,
            linkedDisputeId=dispute_id,
            extractedText=d.extracted_text,
            summary=d.summary,
            extractedMetadata=d.extracted_metadata or {}
        )
        for d in docs
    ]

@router.post("/buyer-create", response_model=DisputeSchema)
def create_buyer_dispute(
    req: DisputeCreateRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    disp = dispute_service.create_buyer_dispute(
        db=db,
        merchant_id=merchant.id,
        order_number=req.orderNumber,
        reason=req.reason,
        statement=req.statement,
        amount=req.amount,
        product_name=req.productName
    )
    return map_dispute_to_schema(disp)
