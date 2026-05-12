from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import face_recognition
import numpy as np
import base64
import json
from PIL import Image
import io

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()

class FrameRequest(BaseModel):
    frame: str
    photoIndex: int
    userId: int

class LivenessRequest(BaseModel):
    encodings: list[str]

@app.post("/extract-encoding")
def extract_encoding(req: FrameRequest):

    try:
        raw = req.frame.split(",")[1]
        image_bytes = base64.b64decode(raw)

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        image_np = np.array(image)

    except:
        raise HTTPException(400, "Image invalide")

    locations = face_recognition.face_locations(image_np)

    if len(locations) == 0:
        raise HTTPException(422, "Aucun visage")

    if len(locations) > 1:
        raise HTTPException(422, "Plusieurs visages")

    encodings = face_recognition.face_encodings(image_np, locations)

    vector = encodings[0].tolist()

    return {
        "encoding": json.dumps(vector),
        "photoIndex": req.photoIndex,
        "userId": req.userId
    }

@app.post("/verify-liveness")
def verify_liveness(req: LivenessRequest):

    if len(req.encodings) != 3:
        raise HTTPException(400, "3 encodings requis")

    vecs = [np.array(json.loads(e)) for e in req.encodings]

    d12 = np.linalg.norm(vecs[0] - vecs[1])
    d13 = np.linalg.norm(vecs[0] - vecs[2])
    d23 = np.linalg.norm(vecs[1] - vecs[2])

    same_person = (
        d12 < 0.6 and
        d13 < 0.6 and
        d23 < 0.6
    )

    real_movements = (
        d12 > 0.05 and
        d13 > 0.05 and
        d23 > 0.05
    )

    if not same_person:
        raise HTTPException(422, "Personne différente")

    if not real_movements:
        raise HTTPException(422, "Aucun mouvement détecté")

    return {
        "valid": True,
        "message": "Liveness validé"
    }