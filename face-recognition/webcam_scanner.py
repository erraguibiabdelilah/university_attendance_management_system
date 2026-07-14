"""
webcam_scanner.py
-----------------
Standalone real-time webcam attendance scanner.
Uses the same FaceEngine pipeline but operates on live frames.

Usage:
    python webcam_scanner.py --class INFO-2A --students students.json

The script:
  1. Loads student embeddings once at startup.
  2. Captures frames from the webcam.
  3. Runs face detection + matching every N seconds (configurable).
  4. Draws bounding boxes with names on screen.
  5. Press 'q' to quit and print the final attendance report.
"""

from __future__ import annotations

import argparse
import json
import time
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np

from core.config import settings
from core.face_engine import FaceEngine
from models.schemas import StudentRecord
from utils.logger import logger

# ── Colours (BGR) ────────────────────────────────────────────────────────────
COL_PRESENT = (0, 220, 0)    # green
COL_UNKNOWN = (0, 165, 255)  # orange
COL_TEXT    = (255, 255, 255)


def draw_faces(
    frame: np.ndarray,
    present_students,
    unknown_count: int,
) -> np.ndarray:
    """Overlay bounding boxes and names on the frame."""
    for student in present_students:
        loc = student.face_location
        if not loc:
            continue
        x, y, w, h = loc["x"], loc["y"], loc["w"], loc["h"]
        cv2.rectangle(frame, (x, y), (x + w, y + h), COL_PRESENT, 2)
        label = f"{student.name} ({student.confidence:.0%})"
        cv2.putText(frame, label, (x, y - 8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, COL_TEXT, 1, cv2.LINE_AA)

    # HUD overlay
    cv2.putText(
        frame,
        f"Present: {len(present_students)}  Unknown: {unknown_count}",
        (10, 28),
        cv2.FONT_HERSHEY_SIMPLEX, 0.7, COL_PRESENT, 2, cv2.LINE_AA,
    )
    return frame


def run_webcam_scanner(
    class_name: str,
    students: list[StudentRecord],
    scan_interval: float = 3.0,
    camera_index: int = 0,
):
    engine = FaceEngine()

    logger.info("Pre-computing student embeddings …")
    student_embeddings = engine.build_student_embeddings(students, class_name)
    if not student_embeddings:
        logger.error("No student embeddings could be built. Check your student images.")
        return

    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        logger.error(f"Cannot open camera index {camera_index}")
        return

    logger.info(f"Webcam open. Scanning every {scan_interval}s. Press 'q' to quit.")

    last_scan = 0.0
    last_present: list = []
    last_unknown = 0
    cumulative_present_ids: set[int] = set()

    while True:
        ret, frame = cap.read()
        if not ret:
            logger.warning("Frame capture failed — retrying …")
            time.sleep(0.1)
            continue

        now = time.time()
        if now - last_scan >= scan_interval:
            classroom_faces = engine.detect_classroom_faces(frame.copy())
            last_present, last_unknown = engine.match_faces(
                classroom_faces, student_embeddings
            )
            cumulative_present_ids.update(s.student_id for s in last_present)
            last_scan = now

        display = draw_faces(frame.copy(), last_present, last_unknown)
        cv2.imshow(f"Attendance Scanner — {class_name}", display)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()

    # ── Final report ─────────────────────────────────────────────────────────
    print("\n" + "=" * 50)
    print(f"  ATTENDANCE REPORT — {class_name}")
    print(f"  Scan ended: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 50)

    present_names = {
        s.student_id: s.name
        for s, _ in student_embeddings
        if s.student_id in cumulative_present_ids
    }
    absent_names  = {
        s.student_id: s.name
        for s, _ in student_embeddings
        if s.student_id not in cumulative_present_ids
    }

    print(f"\n✅ PRESENT ({len(present_names)}):")
    for sid, name in present_names.items():
        print(f"   [{sid}] {name}")

    print(f"\n❌ ABSENT ({len(absent_names)}):")
    for sid, name in absent_names.items():
        print(f"   [{sid}] {name}")

    rate = len(present_names) / len(student_embeddings) if student_embeddings else 0
    print(f"\n📊 Attendance rate: {rate:.0%}")
    print("=" * 50)


# ── CLI entry point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Real-time webcam attendance scanner")
    parser.add_argument("--class", dest="class_name", required=True,
                        help="Class name, e.g. INFO-2A")
    parser.add_argument("--students", required=True,
                        help="Path to students JSON file")
    parser.add_argument("--interval", type=float, default=3.0,
                        help="Seconds between scans (default: 3)")
    parser.add_argument("--camera", type=int, default=0,
                        help="Camera device index (default: 0)")
    args = parser.parse_args()

    students_path = Path(args.students)
    if not students_path.exists():
        raise SystemExit(f"Students file not found: {students_path}")

    raw = json.loads(students_path.read_text(encoding="utf-8"))
    student_list = [StudentRecord(**s) for s in raw]

    run_webcam_scanner(
        class_name=args.class_name,
        students=student_list,
        scan_interval=args.interval,
        camera_index=args.camera,
    )
