"""
core/face_engine.py
-------------------
Core AI pipeline:
  1. Load / cache student face embeddings
  2. Detect all faces in a classroom image
  3. Generate embeddings for each detected face
  4. Compare against student embeddings
  5. Return structured attendance results
"""

from __future__ import annotations

import hashlib
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional, Tuple

import cv2
import numpy as np
from deepface import DeepFace

from core.config import settings
from models.schemas import (
    AttendanceResult,
    AbsentStudent,
    EmbeddingCacheEntry,
    PresentStudent,
    StudentRecord,
)
from utils.logger import logger
from utils.image_utils import load_image_from_source, decode_base64_image


# ────────────────────────────────────────────────────────────────────────────
# Helper utilities
# ────────────────────────────────────────────────────────────────────────────

def _md5(data: bytes) -> str:
    return hashlib.md5(data).hexdigest()


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Return cosine similarity in [0, 1]; higher = more similar."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def _distance_to_confidence(distance: float, metric: str) -> float:
    """
    Convert a raw DeepFace distance to a human-readable confidence in [0, 1].
    """
    if metric == "cosine":
        # cosine distance ∈ [0, 2]; similarity = 1 – distance/2
        return max(0.0, 1.0 - distance / 2.0)
    elif metric in ("euclidean", "euclidean_l2"):
        # Heuristic: clip at 2.0 and invert
        return max(0.0, 1.0 - min(distance, 2.0) / 2.0)
    return 0.0


# ────────────────────────────────────────────────────────────────────────────
# Embedding cache (disk-based JSON, one file per class session)
# ────────────────────────────────────────────────────────────────────────────

class EmbeddingCache:
    """
    Persist student embeddings on disk so they don't need to be recomputed
    every time the same class is scanned.
    Keyed by (class_name + student_id + image_hash).
    """

    def __init__(self, class_name: str):
        self.enabled = settings.CACHE_ENABLED
        cache_dir = Path(settings.CACHE_DIR)
        cache_dir.mkdir(parents=True, exist_ok=True)
        safe_name = "".join(c if c.isalnum() else "_" for c in class_name)
        self.path = cache_dir / f"{safe_name}_embeddings.json"
        self._data: dict[str, EmbeddingCacheEntry] = {}
        self._load()

    def _load(self):
        if self.enabled and self.path.exists():
            try:
                raw = json.loads(self.path.read_text(encoding="utf-8"))
                self._data = {k: EmbeddingCacheEntry(**v) for k, v in raw.items()}
                logger.info(f"Cache loaded: {len(self._data)} entries from {self.path}")
            except Exception as exc:
                logger.warning(f"Cache load failed ({exc}); starting fresh.")
                self._data = {}

    def _save(self):
        if self.enabled:
            self.path.write_text(
                json.dumps({k: v.model_dump() for k, v in self._data.items()}, indent=2),
                encoding="utf-8",
            )

    def get(self, student_id: int, image_hash: str) -> Optional[np.ndarray]:
        key = f"{student_id}_{image_hash}"
        entry = self._data.get(key)
        if entry and entry.image_hash == image_hash:
            return np.array(entry.embedding, dtype=np.float32)
        return None

    def set(self, student_id: int, name: str, image_hash: str, embedding: np.ndarray):
        key = f"{student_id}_{image_hash}"
        self._data[key] = EmbeddingCacheEntry(
            student_id=student_id,
            name=name,
            embedding=embedding.tolist(),
            image_hash=image_hash,
        )
        self._save()


# ────────────────────────────────────────────────────────────────────────────
# Face Engine
# ────────────────────────────────────────────────────────────────────────────

class FaceEngine:
    """
    Orchestrates the full face-recognition pipeline for one attendance scan.
    """

    def __init__(self):
        self.model = settings.FACE_MODEL
        self.detector = settings.DETECTOR_BACKEND
        self.threshold = settings.SIMILARITY_THRESHOLD
        self.metric = settings.DISTANCE_METRIC

    # ── 1. Build student embeddings ─────────────────────────────────────────

    def build_student_embeddings(
        self,
        students: List[StudentRecord],
        class_name: str,
    ) -> List[Tuple[StudentRecord, np.ndarray]]:
        """
        For every student, load their reference image and generate a face embedding.
        Uses disk cache to avoid redundant computation.

        Returns a list of (StudentRecord, embedding_vector) tuples.
        Only students whose face was successfully embedded are included.
        """
        cache = EmbeddingCache(class_name)
        results: List[Tuple[StudentRecord, np.ndarray]] = []

        for student in students:
            try:
                img_bytes, img_array = load_image_from_source(student.image_path)
                img_hash = _md5(img_bytes)

                # Try cache first
                cached = cache.get(student.student_id, img_hash)
                if cached is not None:
                    logger.debug(f"Cache hit: {student.name} (id={student.student_id})")
                    results.append((student, cached))
                    continue

                # Generate embedding via DeepFace
                embedding_objs = DeepFace.represent(
                    img_path=img_array,
                    model_name=self.model,
                    detector_backend=self.detector,
                    enforce_detection=settings.ENFORCE_DETECTION,
                )

                if not embedding_objs:
                    logger.warning(f"No face found in reference image for {student.name}")
                    continue

                # Take the first (largest) face
                emb = np.array(embedding_objs[0]["embedding"], dtype=np.float32)
                cache.set(student.student_id, student.name, img_hash, emb)
                results.append((student, emb))
                logger.debug(f"Embedded: {student.name} (id={student.student_id})")

            except Exception as exc:
                logger.error(f"Failed to embed {student.name}: {exc}")

        logger.info(
            f"Student embeddings ready: {len(results)}/{len(students)} successful"
        )
        return results

    # ── 2. Detect & embed classroom faces ───────────────────────────────────

    def detect_classroom_faces(
        self, classroom_image: np.ndarray
    ) -> List[Tuple[np.ndarray, dict]]:
        """
        Detect every face in the classroom image.
        Returns a list of (embedding_vector, face_location_dict).
        """
        detected: List[Tuple[np.ndarray, dict]] = []

        try:
            face_objs = DeepFace.represent(
                img_path=classroom_image,
                model_name=self.model,
                detector_backend=self.detector,
                enforce_detection=False,
            )

            for face_obj in face_objs:
                emb = np.array(face_obj["embedding"], dtype=np.float32)
                region = face_obj.get("facial_area", {})
                location = {
                    "x": region.get("x", 0),
                    "y": region.get("y", 0),
                    "w": region.get("w", 0),
                    "h": region.get("h", 0),
                }
                detected.append((emb, location))

        except Exception as exc:
            logger.error(f"Face detection failed: {exc}")

        logger.info(f"Faces detected in classroom image: {len(detected)}")
        return detected

    # ── 3. Match faces ───────────────────────────────────────────────────────

    def match_faces(
        self,
        classroom_faces: List[Tuple[np.ndarray, dict]],
        student_embeddings: List[Tuple[StudentRecord, np.ndarray]],
    ) -> Tuple[List[PresentStudent], int]:
        """
        For each classroom face, find the best-matching student.

        Returns:
          - List of PresentStudent (one per matched student; no duplicates)
          - Number of unknown faces (classroom faces that matched no student)
        """
        matched_student_ids: set[int] = set()
        present: List[PresentStudent] = []
        unknown_count = 0

        for face_emb, location in classroom_faces:
            best_student: Optional[StudentRecord] = None
            best_confidence = 0.0

            for student, student_emb in student_embeddings:
                if self.metric == "cosine":
                    # DeepFace cosine distance = 1 – cosine_similarity
                    distance = 1.0 - _cosine_similarity(face_emb, student_emb)
                else:
                    distance = float(np.linalg.norm(face_emb - student_emb))

                confidence = _distance_to_confidence(distance, self.metric)

                # Check against threshold (distance-based)
                if distance <= self.threshold and confidence > best_confidence:
                    best_confidence = confidence
                    best_student = student

            if best_student and best_student.student_id not in matched_student_ids:
                matched_student_ids.add(best_student.student_id)
                present.append(
                    PresentStudent(
                        student_id=best_student.student_id,
                        name=best_student.name,
                        confidence=round(best_confidence, 4),
                        face_location=location,
                    )
                )
                logger.debug(
                    f"Matched: {best_student.name} "
                    f"(conf={best_confidence:.2%})"
                )
            else:
                unknown_count += 1

        return present, unknown_count

    # ── 4. Full pipeline ─────────────────────────────────────────────────────

    def run_attendance_scan(
        self,
        class_name: str,
        students: List[StudentRecord],
        classroom_image: np.ndarray,
    ) -> AttendanceResult:
        """
        End-to-end pipeline:
          build embeddings → detect faces → match → produce report.
        """
        t_start = time.perf_counter()

        # Step 1 – Student embeddings
        student_embeddings = self.build_student_embeddings(students, class_name)

        # Step 2 – Classroom face detection + embeddings
        classroom_faces = self.detect_classroom_faces(classroom_image)

        # Step 3 – Matching
        present_students, unknown_faces = self.match_faces(
            classroom_faces, student_embeddings
        )

        # Step 4 – Determine absent students
        present_ids = {s.student_id for s in present_students}
        absent_students = [
            AbsentStudent(student_id=s.student_id, name=s.name)
            for s, _ in student_embeddings
            if s.student_id not in present_ids
        ]

        # Step 5 – Build result
        total = len(students)
        present_count = len(present_students)
        elapsed = round(time.perf_counter() - t_start, 3)

        result = AttendanceResult(
            class_name=class_name,
            present_students=present_students,
            absent_students=absent_students,
            unknown_faces_detected=unknown_faces,
            total_students=total,
            present_count=present_count,
            absent_count=len(absent_students),
            attendance_rate=round(present_count / total, 4) if total else 0.0,
            scan_time=datetime.now(timezone.utc),
            processing_time_seconds=elapsed,
        )

        logger.info(
            f"Scan complete | class={class_name} | "
            f"present={present_count}/{total} | "
            f"unknown={unknown_faces} | "
            f"time={elapsed}s"
        )
        return result
