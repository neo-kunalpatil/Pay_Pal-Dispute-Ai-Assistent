from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

class DocumentResponse(BaseModel):
    id: str
    name: str
    category: str
    fileType: str = Field(default="pdf", validation_alias="file_type")
    size: str = Field(default="120 KB", validation_alias="file_size")
    uploadDate: str = "Just now"
    status: str = Field(default="Indexed", validation_alias="processing_status")
    linkedDisputeId: Optional[str] = None
    previewUrl: Optional[str] = None
    extractedText: Optional[str] = Field(default=None, validation_alias="extracted_text")
    summary: Optional[str] = None
    extractedMetadata: Optional[Dict[str, Any]] = Field(default_factory=dict, validation_alias="extracted_metadata")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class DocumentLinkRequest(BaseModel):
    dispute_id: str
