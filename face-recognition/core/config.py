"""
core/config.py
--------------
Centralised configuration for the AI module.
All values can be overridden via environment variables or a .env file.
"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── Server ──────────────────────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False

    # ── CORS ────────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["*"]

    # ── Face Recognition ────────────────────────────────────────────────────
    # Model: "ArcFace" | "Facenet512" | "Facenet" | "VGG-Face" | "DeepFace"
    FACE_MODEL: str = "ArcFace"

    # Detector: "retinaface" | "mtcnn" | "opencv" | "ssd" | "mediapipe"
    DETECTOR_BACKEND: str = "retinaface"

    # Cosine distance threshold (lower = stricter)
    # ArcFace cosine: 0.68 recommended; tune per environment
    SIMILARITY_THRESHOLD: float = 0.68

    # Distance metric: "cosine" | "euclidean" | "euclidean_l2"
    DISTANCE_METRIC: str = "cosine"

    # Enforce face detection (reject images without a detectable face)
    ENFORCE_DETECTION: bool = False

    # ── Embedding Cache ──────────────────────────────────────────────────────
    CACHE_DIR: str = "cache"
    CACHE_ENABLED: bool = True

    # ── File Uploads ─────────────────────────────────────────────────────────
    UPLOAD_DIR: str = "uploads"
    MAX_IMAGE_SIZE_MB: int = 10

    # ── Logging ──────────────────────────────────────────────────────────────
    LOG_DIR: str = "logs"
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
