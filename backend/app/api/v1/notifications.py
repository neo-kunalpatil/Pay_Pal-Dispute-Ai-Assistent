from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def list_notifications(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(Notification.merchant_id == merchant.id).order_by(Notification.created_at.desc()).limit(20).all()
    return [
        {
            "id": n.id,
            "title": n.title,
            "time": n.time,
            "read": n.read
        }
        for n in notifs
    ]

@router.post("/mark-read")
def mark_notifications_read(
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(Notification.merchant_id == merchant.id).update({"read": True})
    db.commit()
    return {"success": True, "message": "All notifications marked as read."}
