
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime

class LeadData(BaseModel):
    """Data model for lead information"""
    name: str = Field(..., min_length=1, max_length=100, description="Lead's full name")
    email: str = Field(..., description="Lead's email address")
    phone: Optional[str] = Field(None, max_length=20, description="Lead's phone number")
    source: str = Field(default="Manual Entry", description="Lead source")
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0, description="Confidence score for extracted data")

class ProcessingResponse(BaseModel):
    """Response model for document processing"""
    success: bool
    message: str
    data: Dict[str, Any]
    processing_time: float = Field(..., description="Processing time in seconds")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Overall confidence score")

class HealthResponse(BaseModel):
    """Health check response model"""
    status: str
    message: str
    timestamp: str
    details: Optional[Dict[str, Any]] = None

class ErrorResponse(BaseModel):
    """Error response model"""
    error: bool = True
    message: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
