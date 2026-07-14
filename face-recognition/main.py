"""
Smart Attendance System - AI Face Recognition Module
=====================================================
Entry point for the FastAPI application.
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import router
from core.config import settings
from utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("🚀 AI Face Recognition Module starting up...")
    logger.info(f"   Model backend : {settings.FACE_MODEL}")
    logger.info(f"   Detector      : {settings.DETECTOR_BACKEND}")
    logger.info(f"   Threshold     : {settings.SIMILARITY_THRESHOLD}")
    yield
    logger.info("🛑 AI Face Recognition Module shutting down...")


app = FastAPI(
    title="Smart Attendance - AI Face Recognition Module",
    description=(
        "AI module responsible for detecting student faces in classroom images "
        "and comparing them with a provided student database to produce attendance results."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# Allow calls from the external management system
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info",
    )
