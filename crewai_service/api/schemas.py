"""Pydantic schemas for API request/response models."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ReportOptions(BaseModel):
    """Options for report generation."""
    language: str = Field(default="zh", description="Report language (zh or en)")
    include_activities: bool = Field(default=True, description="Include desktop activities")
    include_documents: bool = Field(default=True, description="Include document search")
    include_conversations: bool = Field(default=True, description="Include chat history")
    template: str = Field(default="default", description="Report template (default/detailed/simple)")


class GenerateReportRequest(BaseModel):
    """Request model for generating weekly report."""
    start_date: str = Field(..., description="Start date in ISO 8601 format (YYYY-MM-DD)")
    end_date: str = Field(..., description="End date in ISO 8601 format (YYYY-MM-DD)")
    options: Optional[ReportOptions] = Field(default_factory=ReportOptions)


class ReportMetadata(BaseModel):
    """Metadata about generated report."""
    generated_at: str
    duration_seconds: float
    word_count: int
    sections: List[str]


class ReportStatistics(BaseModel):
    """Statistics about the weekly data."""
    total_activities: int
    total_documents: int
    total_time_hours: float
    productivity_score: float


class GenerateReportResponse(BaseModel):
    """Response model for report generation."""
    status: str = Field(..., description="success or error")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Report data")
    message: Optional[str] = Field(default=None, description="Human-readable message")
    error: Optional[Dict[str, Any]] = Field(default=None, description="Error details")


class ServiceStatus(BaseModel):
    """Status of an external service."""
    available: bool
    url: str
    response_time_ms: Optional[float] = None


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = Field(..., description="healthy or unhealthy")
    version: str
    services: Dict[str, Any]
    uptime_seconds: float


class ReportStatus(BaseModel):
    """Status of report generation."""
    status: str = Field(..., description="pending, in_progress, completed, or failed")
    progress: int = Field(..., ge=0, le=100, description="Progress percentage")
    current_step: str
    estimated_time_remaining: Optional[int] = None

