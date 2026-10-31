from typing import Optional
from pydantic import BaseModel

class ResponseDraftUpdateRequest(BaseModel):
    draft: str
    merchant_notes: Optional[str] = None

class ResponseApprovalRequest(BaseModel):
    approved: bool = True

class ResponseSubmissionResult(BaseModel):
    success: bool
    submissionRef: str
    message: str
    dispute_id: str
