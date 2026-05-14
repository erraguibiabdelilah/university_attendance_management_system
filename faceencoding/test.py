from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import binascii
import io
import json

import face_recognition
import numpy as np
from PIL import Image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class FrameRequest(BaseModel):
    frame: str
    photoIndex: int
    userId: int


class LivenessRequest(BaseModel):
    encodings: list[str]


@app.get("/health")
def health():
    return {"status": "ok"}


def decode_frame(frame: str) -> np.ndarray:
    try:
        raw = frame.split(",", 1)[1] if "," in frame else frame
        image_bytes = base64.b64decode(raw, validate=True)
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        return np.array(image)
    except (binascii.Error, OSError, ValueError):
        raise HTTPException(status_code=400, detail="Image invalide")


def parse_encoding(encoding: str) -> np.ndarray:
    try:
        vector = np.array(json.loads(encoding), dtype=float)
    except (TypeError, json.JSONDecodeError, ValueError):
        raise HTTPException(status_code=400, detail="Encoding invalide")

    if vector.shape != (128,):
        raise HTTPException(status_code=400, detail="Encoding doit contenir 128 valeurs")

    return vector


@app.post("/extract-encoding")
def extract_encoding(req: FrameRequest):
    if req.photoIndex < 1 or req.photoIndex > 3:
        raise HTTPException(status_code=400, detail="photoIndex doit être entre 1 et 3")

    if req.userId <= 0:
        raise HTTPException(status_code=400, detail="userId invalide")

    image_np = decode_frame(req.frame)
    locations = face_recognition.face_locations(image_np)

    if len(locations) == 0:
        raise HTTPException(status_code=422, detail="Aucun visage")

    if len(locations) > 1:
        raise HTTPException(status_code=422, detail="Plusieurs visages")

    encodings = face_recognition.face_encodings(image_np, locations)

    if not encodings:
        raise HTTPException(status_code=422, detail="Impossible d'encoder le visage")

    vector = encodings[0].tolist()

    return {
        "encoding": json.dumps(vector),
        "photoIndex": req.photoIndex,
        "userId": req.userId,
    }


@app.post("/verify-liveness")
def verify_liveness(req: LivenessRequest):
    if len(req.encodings) != 3:
        raise HTTPException(status_code=400, detail="3 encodings requis")

    vecs = [parse_encoding(e) for e in req.encodings]

    d12 = np.linalg.norm(vecs[0] - vecs[1])
    d13 = np.linalg.norm(vecs[0] - vecs[2])
    d23 = np.linalg.norm(vecs[1] - vecs[2])

    same_person = d12 < 0.6 and d13 < 0.6 and d23 < 0.6
    real_movements = d12 > 0.05 and d13 > 0.05 and d23 > 0.05

    if not same_person:
        raise HTTPException(status_code=422, detail="Personne différente")

    if not real_movements:
        raise HTTPException(status_code=422, detail="Aucun mouvement détecté")

    return {
        "valid": True,
        "message": "Liveness validé",
    }
