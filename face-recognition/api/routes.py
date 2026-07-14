"""
api/routes.py
-------------
All HTTP endpoints exposed by the AI Face Recognition Module.

POST /scan        – main endpoint: receive student list + classroom image
POST /embed       – pre-compute and cache embeddings for a class
GET  /health      – liveness / readiness probe
GET  /config      – return current model configuration
DELETE /cache/{class_name} – clear cached embeddings for a class
"""

from __future__ import annotations

import json
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse

from core.config import settings
from core.face_engine import FaceEngine
from models.schemas import AttendanceResult, StudentRecord
from utils.image_utils import bytes_to_image, preprocess_classroom_image, resize_if_needed
from utils.logger import logger

router = APIRouter()

# Single shared engine instance (models are loaded lazily by DeepFace)
_engine = FaceEngine()


# ── /health ──────────────────────────────────────────────────────────────────

@router.get("/health", tags=["System"])
async def health_check():
    """Liveness probe."""
    return {
        "status": "ok",
        "model": settings.FACE_MODEL,
        "detector": settings.DETECTOR_BACKEND,
    }


# ── /config ───────────────────────────────────────────────────────────────────

@router.get("/config", tags=["System"])
async def get_config():
    """Return the active model configuration (read-only)."""
    return {
        "face_model": settings.FACE_MODEL,
        "detector_backend": settings.DETECTOR_BACKEND,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD,
        "distance_metric": settings.DISTANCE_METRIC,
        "cache_enabled": settings.CACHE_ENABLED,
    }


# ── /scan ─────────────────────────────────────────────────────────────────────

@router.post(
    "/scan",
    response_model=AttendanceResult,
    status_code=status.HTTP_200_OK,
    tags=["Attendance"],
    summary="Run attendance scan on a classroom image",
)
async def scan_classroom(
    class_name: str = Form(..., description="Class identifier, e.g. INFO-2A"),
    students_json: str = Form(
        ...,
        description="JSON array of StudentRecord objects",
    ),
    classroom_image: UploadFile = File(
        ..., description="Classroom photo (JPEG / PNG / WebP)"
    ),
):
    """
    **Main endpoint.**

    Accepts:
    - `class_name`: string form field
    - `students_json`: JSON-encoded list of students (form field)
    - `classroom_image`: the classroom photo as a file upload

    Returns a full `AttendanceResult` JSON.
    """
    # ── Validate students payload ────────────────────────────────────────────
    try:
        raw_students = json.loads(students_json)
        students = [StudentRecord(**s) for s in raw_students]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid students_json: {exc}",
        )

    if not students:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="students_json must contain at least one student.",
        )

    # ── Validate & decode image ──────────────────────────────────────────────
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if classroom_image.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image type: {classroom_image.content_type}",
        )

    img_bytes = await classroom_image.read()
    if len(img_bytes) > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image exceeds {settings.MAX_IMAGE_SIZE_MB} MB limit.",
        )

    try:
        img_array = bytes_to_image(img_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not decode classroom image: {exc}",
        )

    # ── Preprocess ───────────────────────────────────────────────────────────
    img_array = resize_if_needed(img_array, max_dim=1920)
    img_array = preprocess_classroom_image(img_array)

    # ── Run pipeline ─────────────────────────────────────────────────────────
    try:
        result = _engine.run_attendance_scan(
            class_name=class_name,
            students=students,
            classroom_image=img_array,
        )
    except Exception as exc:
        logger.exception("Scan pipeline error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Face recognition pipeline error: {exc}",
        )

    return result


# ── /embed ────────────────────────────────────────────────────────────────────

@router.post(
    "/embed",
    tags=["Embeddings"],
    summary="Pre-compute and cache student embeddings (optional optimisation)",
)
async def precompute_embeddings(
    class_name: str = Form(...),
    students_json: str = Form(...),
):
    """
    Pre-warms the embedding cache for a class.
    Call this after student registration so that the first /scan is faster.
    """
    try:
        raw_students = json.loads(students_json)
        students = [StudentRecord(**s) for s in raw_students]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid students_json: {exc}",
        )

    try:
        embedded = _engine.build_student_embeddings(students, class_name)
    except Exception as exc:
        logger.exception("Embedding pre-computation error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        )

    return {
        "class_name": class_name,
        "total_students": len(students),
        "embedded_successfully": len(embedded),
        "failed": len(students) - len(embedded),
    }


# ── /cache/{class_name} ───────────────────────────────────────────────────────

@router.delete(
    "/cache/{class_name}",
    tags=["Embeddings"],
    summary="Clear cached embeddings for a class",
)
async def clear_cache(class_name: str):
    """Delete the embedding cache file for the specified class."""
    safe_name = "".join(c if c.isalnum() else "_" for c in class_name)
    cache_path = Path(settings.CACHE_DIR) / f"{safe_name}_embeddings.json"

    if cache_path.exists():
        cache_path.unlink()
        return {"detail": f"Cache cleared for class '{class_name}'."}
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": f"No cache found for class '{class_name}'."},
    )
