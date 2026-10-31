from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict
from app.schemas.investigation import AIInvestigationReportSchema

class ActivityTimelineItemSchema(BaseModel):
    id: str
    title: str
    description: str
    timestamp: str
    actor: str
    type: str

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class DisputeSchema(BaseModel):
    id: str
    customerName: str = Field(default="", validation_alias="customer_name")
    customerEmail: str = Field(default="", validation_alias="customer_email")
    customerAvatar: Optional[str] = Field(default=None, validation_alias="customer_avatar")
    transactionId: Optional[str] = Field(default=None, validation_alias="transaction_id")
    orderId: str = Field(default="", validation_alias="order_id")
    productName: str = Field(default="", validation_alias="product_name")
    amount: float = 0.0
    currency: str = "USD"
    reason: str = ""
    status: str = ""
    aiStatus: str = Field(default="Not Started", validation_alias="ai_status")
    createdDate: str = Field(default="", validation_alias="created_date")
    deadline: str = ""
    daysRemaining: int = Field(default=7, validation_alias="days_remaining")
    complaintDescription: Optional[str] = Field(default=None, validation_alias="complaint_description")
    customerStatement: Optional[str] = Field(default=None, validation_alias="customer_statement")
    requestedEvidence: List[str] = Field(default_factory=list, validation_alias="requested_evidence")
    responseDraft: Optional[str] = Field(default=None, validation_alias="response_draft")
    merchantResponseNotes: Optional[str] = Field(default=None, validation_alias="merchant_response_notes")
    isResponseApproved: bool = Field(default=False, validation_alias="is_response_approved")
    submissionDate: Optional[str] = Field(default=None, validation_alias="submission_date")
    submissionReference: Optional[str] = Field(default=None, validation_alias="submission_reference")
    timeline: List[ActivityTimelineItemSchema] = Field(default_factory=list)
    investigationReport: Optional[AIInvestigationReportSchema] = Field(default=None, validation_alias="investigation_report")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class DisputeCreateRequest(BaseModel):
    orderNumber: str
    reason: str
    statement: str
    amount: float
    productName: str
