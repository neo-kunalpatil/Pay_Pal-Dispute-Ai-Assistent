import io
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, Form, Query, HTTPException, status
from fastapi.responses import Response as FastApiResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.dependencies import get_current_merchant
from app.models.merchant import Merchant
from app.schemas.document import DocumentResponse, DocumentLinkRequest
from app.services.document_service import document_service
from app.storage.local_storage import storage

router = APIRouter(prefix="/documents", tags=["Documents"])

def map_doc_to_schema(doc) -> DocumentResponse:
    linked_dispute = doc.dispute_links[0].dispute_id if doc.dispute_links else None
    return DocumentResponse(
        id=doc.id,
        name=doc.filename,
        category=doc.document_category,
        fileType=doc.file_type,
        size=doc.file_size,
        uploadDate=doc.uploaded_at.strftime("%b %d, %Y") if doc.uploaded_at else "Just now",
        status=doc.processing_status,
        linkedDisputeId=linked_dispute,
        extractedText=doc.extracted_text,
        summary=doc.summary,
        extractedMetadata=doc.extracted_metadata or {}
    )

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    category: str = Form("Invoices"),
    linkedDisputeId: Optional[str] = Form(None),
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    content = await file.read()
    doc = await document_service.upload_document(
        db=db,
        merchant_id=merchant.id,
        file_bytes=content,
        filename=file.filename or "uploaded_document.pdf",
        category=category,
        linked_dispute_id=linkedDisputeId
    )
    return map_doc_to_schema(doc)

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    docs = document_service.list_documents(db, merchant.id, category=category, search=search)
    return [map_doc_to_schema(d) for d in docs]

@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    doc = document_service.get_document(db, merchant.id, document_id)
    return map_doc_to_schema(doc)

@router.get("/{document_id}/download")
async def download_document(
    document_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    doc = document_service.get_document(db, merchant.id, document_id)
    file_bytes = await storage.get_file(doc.storage_path)
    return FastApiResponse(
        content=file_bytes,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{doc.filename}"'}
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    await document_service.delete_document(db, merchant.id, document_id)
    return {"success": True, "message": f"Document {document_id} deleted."}

@router.post("/{document_id}/link")
def link_document(
    document_id: str,
    req: DocumentLinkRequest,
    merchant: Merchant = Depends(get_current_merchant),
    db: Session = Depends(get_db)
):
    document_service.link_document(db, merchant.id, document_id, req.dispute_id)
    return {"success": True, "message": f"Linked document {document_id} to dispute {req.dispute_id}"}
