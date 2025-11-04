"""API routes for CrewAI Service."""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import time
import requests

from api.schemas import (
    GenerateReportRequest,
    GenerateReportResponse,
    HealthResponse
)
from crews.crew_manager import CrewManager
from utils.logger import logger
from utils.exceptions import CrewAIServiceException
from config import settings

router = APIRouter(prefix="/api")

# Service start time
start_time = time.time()

# Global crew manager instance
crew_manager = CrewManager()


@router.post("/weekly-report/generate", response_model=GenerateReportResponse)
async def generate_report(request: GenerateReportRequest):
    """
    Generate weekly report using CrewAI agents.
    
    This endpoint initiates a multi-agent workflow to:
    1. Collect data from Screenpipe, MineContext, and local DB
    2. Analyze the data for insights and patterns
    3. Write a structured Markdown report
    4. Review for quality
    5. Export to file
    
    Args:
        request: Report generation parameters
        
    Returns:
        GenerateReportResponse with report content and metadata
    """
    try:
        logger.info(f"Report generation requested: {request.start_date} to {request.end_date}")
        
        # Call crew manager to generate report
        result = crew_manager.generate_report(
            start_date=request.start_date,
            end_date=request.end_date,
            options=request.options.dict()
        )
        
        return GenerateReportResponse(
            status="success",
            data=result
        )
    
    except CrewAIServiceException as e:
        logger.error(f"Service error during report generation: {e}")
        return GenerateReportResponse(
            status="error",
            message="Failed to generate report",
            error={
                "code": "SERVICE_ERROR",
                "detail": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )
    
    except Exception as e:
        logger.error(f"Unexpected error during report generation: {e}")
        return GenerateReportResponse(
            status="error",
            message="An unexpected error occurred",
            error={
                "code": "INTERNAL_ERROR",
                "detail": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Checks availability of:
    - Screenpipe service
    - MineContext service
    - LLM configuration
    
    Returns:
        HealthResponse with service statuses
    """
    services = {}
    
    # Check Screenpipe
    try:
        start = time.time()
        r = requests.get(f"{settings.SCREENPIPE_URL}/health", timeout=3)
        response_time = (time.time() - start) * 1000
        services["screenpipe"] = {
            "available": r.status_code == 200,
            "url": settings.SCREENPIPE_URL,
            "response_time_ms": round(response_time, 2)
        }
    except Exception as e:
        logger.warning(f"Screenpipe health check failed: {e}")
        services["screenpipe"] = {
            "available": False,
            "url": settings.SCREENPIPE_URL
        }
    
    # Check MineContext
    try:
        start = time.time()
        r = requests.get(f"{settings.MINECONTEXT_URL}/health", timeout=3)
        response_time = (time.time() - start) * 1000
        services["minecontext"] = {
            "available": r.status_code == 200,
            "url": settings.MINECONTEXT_URL,
            "response_time_ms": round(response_time, 2)
        }
    except Exception as e:
        logger.warning(f"MineContext health check failed: {e}")
        services["minecontext"] = {
            "available": False,
            "url": settings.MINECONTEXT_URL
        }
    
    # Check LLM configuration
    services["llm"] = {
        "available": bool(settings.SILICONFLOW_API_KEY),
        "provider": "SiliconFlow",
        "model": settings.LLM_MODEL
    }
    
    # Determine overall health status
    all_critical_services_ok = (
        services["llm"]["available"]
    )
    
    status = "healthy" if all_critical_services_ok else "degraded"
    
    return HealthResponse(
        status=status,
        version="1.0.0",
        services=services,
        uptime_seconds=round(time.time() - start_time, 2)
    )

