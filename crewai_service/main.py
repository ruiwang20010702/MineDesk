"""Main entry point for CrewAI Service FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from api.router import router
from config import settings
from utils.logger import logger


# Create FastAPI app
app = FastAPI(
    title="CrewAI Service for MineDesk",
    description="Multi-agent workflow service for automated weekly report generation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:*", "http://127.0.0.1:*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """Startup event handler."""
    logger.info("=" * 60)
    logger.info("🚀 CrewAI Service starting...")
    logger.info(f"📍 Service URL: http://{settings.HOST}:{settings.PORT}")
    logger.info(f"📚 API Docs: http://{settings.HOST}:{settings.PORT}/docs")
    logger.info(f"🔧 Debug Mode: {settings.DEBUG}")
    logger.info(f"🤖 LLM Model: {settings.LLM_MODEL}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown event handler."""
    logger.info("👋 CrewAI Service shutting down...")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "CrewAI Service for MineDesk",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        workers=settings.WORKERS,
        reload=settings.DEBUG,
        log_level="info"
    )

