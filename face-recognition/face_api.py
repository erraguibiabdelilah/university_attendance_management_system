"""
face_api.py — Proxy between the mobile app and face_attendance service.

The mobile app sends:  { image: base64, students: [{id, firstName, lastName}], token: jwt }
This proxy:
  1. Builds StudentRecord list using photos from face_attendance/students/{id}.jpg
  2. Calls face_attendance POST /api/v1/scan (multipart)
  3. Returns {recognized: [{name, userId, confidence}]}

Run:
    cd C:\\AppMobile\\university_attendance_management_system\\face_attendance
    .\\venv\\Scripts\\uvicorn main:app --host 0.0.0.0 --port 8000

Then run this proxy on port 8001 (optional) OR just call face_attendance directly.
Actually — this file rewrites face_api to call face_attendance directly.

Run proxy:
    cd C:\\AppMobile\\university_attendance_management_system
    .\\face_attendance\\venv\\Scripts\\python -m uvicorn face_api:app --host 0.0.0.0 --port 8001
"""

import base64, io, json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

FACE_ATTENDANCE_URL = "http://localhost:8000/api/v1/scan"
STUDENTS_DIR = Path(__file__).parent / "face_attendance" / "students"

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


class Student(BaseModel):
    id: int
    firstName: str
    lastName: str


class RecognizeRequest(BaseModel):
    image: str          # base64 JPEG
    students: list[Student] = []
    token: str = ""


@app.post("/recognize")
async def recognize(req: RecognizeRequest):
    # Build StudentRecord list — only include students who have a photo
    records = []
    for s in req.students:
        # Look for {id}.jpg, {id}.png, {firstName}_{lastName}.jpg etc.
        photo = None
        for ext in ["jpg", "jpeg", "png"]:
            p = STUDENTS_DIR / f"{s.id}.{ext}"
            if p.exists():
                photo = p
                break
        if photo is None:
            continue  # skip students without a registered photo

        # Encode photo as base64 data-URI
        photo_b64 = base64.b64encode(photo.read_bytes()).decode()
        ext = photo.suffix.lstrip(".")
        records.append({
            "student_id": s.id,
            "name": f"{s.firstName} {s.lastName}",
            "image_path": f"data:image/{ext};base64,{photo_b64}",
        })

    if not records:
        return {"recognized": [], "message": "Aucun étudiant avec photo enregistrée"}

    # Decode classroom image
    img_bytes = base64.b64decode(req.image)

    # Call face_attendance /scan (multipart form)
    async with httpx.AsyncClient(timeout=60.0) as client:
        res = await client.post(
            FACE_ATTENDANCE_URL,
            data={
                "class_name": "scan",
                "students_json": json.dumps(records),
            },
            files={"classroom_image": ("photo.jpg", img_bytes, "image/jpeg")},
        )

    if res.status_code != 200:
        return {"recognized": [], "message": f"face_attendance error {res.status_code}: {res.text}"}

    data = res.json()
    recognized = [
        {"name": p["name"], "userId": p["student_id"], "confidence": p["confidence"]}
        for p in data.get("present_students", [])
    ]

    return {"recognized": recognized, "message": f"{len(recognized)} visage(s) reconnu(s)"}


@app.get("/health")
def health():
    return {"status": "ok"}
