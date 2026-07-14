"""
models/schemas.py
-----------------
All Pydantic models used by the API (request bodies and response shapes).
"""

from __future__ import annotations
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ── Input Models ────────────────────────────────────────────────────────────

class StudentRecord(BaseModel):
    """A single student entry sent by the external management system."""
    student_id: int = Field(..., description="Unique student identifier")
    name: str = Field(..., description="Full name of the student")
    image_path: str = Field(
        ...,
        description=(
            "Path to the student's reference face image. "
            "Can be a local path OR a base64 data-URI (data:image/...;base64,...)."
        ),
    )


class ScanRequest(BaseModel):
    """
    Payload sent by the external system when a professor starts a scan.
    The classroom image is supplied as a separate multipart file upload
    (see /scan endpoint).  This model carries the metadata + student list.
    """
    class_name: str = Field(..., example="INFO-2A")
    students: List[StudentRecord] = Field(..., min_length=1)


# ── Output Models ───────────────────────────────────────────────────────────

class PresentStudent(BaseModel):
    student_id: int
    name: str
    confidence: float = Field(..., ge=0.0, le=1.0, description="Match confidence [0–1]")
    face_location: Optional[dict] = Field(
        None,
        description="Bounding box {x, y, w, h} of the detected face in the classroom image",
    )


class AbsentStudent(BaseModel):
    student_id: int
    name: str


class AttendanceResult(BaseModel):
    """Final attendance report returned to the external system."""
    class_name: str
    present_students: List[PresentStudent]
    absent_students: List[AbsentStudent]
    unknown_faces_detected: int
    total_students: int
    present_count: int
    absent_count: int
    attendance_rate: float = Field(..., description="Present / Total [0–1]")
    scan_time: datetime
    processing_time_seconds: float


# ── Embedding Cache Models ───────────────────────────────────────────────────

class EmbeddingCacheEntry(BaseModel):
    student_id: int
    name: str
    embedding: List[float]
    image_hash: str  # MD5 of the source image — used to detect stale cache
