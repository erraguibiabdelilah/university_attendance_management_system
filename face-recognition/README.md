# 🎓 Smart Attendance System — AI Face Recognition Module

> **Scope:** This module is **only** the AI engine.  
> It receives student data from an external management system, detects faces in a classroom image, and returns structured attendance results.

---

## 📁 Folder Structure

```
face_attendance/
│
├── main.py                    ← FastAPI application entry point
├── webcam_scanner.py          ← Standalone real-time webcam scanner
├── requirements.txt
├── .env.example               ← Copy to .env and customise
├── students_example.json      ← Sample student list for testing
│
├── core/
│   ├── config.py              ← Centralised settings (reads .env)
│   └── face_engine.py         ← ★ Core AI pipeline
│
├── api/
│   └── routes.py              ← FastAPI endpoints
│
├── models/
│   └── schemas.py             ← Pydantic request/response models
│
├── utils/
│   ├── image_utils.py         ← Image loading & preprocessing helpers
│   └── logger.py              ← Application logger
│
├── students/                  ← Place student reference images here
├── cache/                     ← Auto-created: embedding cache files
├── logs/                      ← Auto-created: application logs
└── uploads/                   ← Auto-created: temp upload storage
```

---

## ⚡ Windows Setup (Step-by-Step)

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10 or 3.11 | https://python.org |
| pip | bundled | — |
| Git | any | https://git-scm.com |
| Visual C++ Build Tools | latest | https://visualstudio.microsoft.com/visual-cpp-build-tools/ |

> ⚠️ **Visual C++ Build Tools are required** on Windows to compile some packages (OpenCV, dlib).

---

### Step 1 — Clone / extract the project

```cmd
cd C:\Projects
:: if using git:
git clone https://github.com/your-repo/face_attendance.git
cd face_attendance
```

---

### Step 2 — Create a virtual environment

```cmd
python -m venv venv
venv\Scripts\activate
```

Your prompt will show `(venv)` when the environment is active.

---

### Step 3 — Upgrade pip

```cmd
python -m pip install --upgrade pip
```

---

### Step 4 — Install dependencies

```cmd
pip install -r requirements.txt
```

> ☕ First install takes **5–10 minutes** — TensorFlow and DeepFace are large packages.  
> DeepFace will **automatically download** model weights on first use (~200 MB for ArcFace).

---

### Step 5 — Configure the module

```cmd
copy .env.example .env
```

Open `.env` in Notepad and adjust settings if needed.  
The defaults work out-of-the-box for most setups.

---

### Step 6 — Place student images

Put each student's reference photo in the `students/` folder:

```
students/
├── ahmed.jpg
├── sara.jpg
├── yassine.jpg
└── ...
```

Photo requirements:
- Clearly visible face (frontal or slight angle)
- Minimum 100×100 pixels
- JPEG or PNG
- One face per image

---

### Step 7 — Start the API server

```cmd
python main.py
```

The server starts at: **http://localhost:8000**  
Interactive API docs: **http://localhost:8000/docs**

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/api/v1/health` | Liveness check |
| `GET`  | `/api/v1/config` | Current model config |
| `POST` | `/api/v1/scan` | **Run attendance scan** |
| `POST` | `/api/v1/embed` | Pre-warm embedding cache |
| `DELETE` | `/api/v1/cache/{class_name}` | Clear cache for a class |

---

## 📡 Example API Request — `/scan`

The `/scan` endpoint accepts `multipart/form-data` with three parts:

| Field | Type | Description |
|-------|------|-------------|
| `class_name` | string | e.g. `"INFO-2A"` |
| `students_json` | string (JSON) | Array of student records |
| `classroom_image` | file | JPEG / PNG / WebP |

### Using curl (Windows PowerShell)

```powershell
$students = '[
  {"student_id":1,"name":"Ahmed Benali","image_path":"students/ahmed.jpg"},
  {"student_id":2,"name":"Sara Idrissi","image_path":"students/sara.jpg"}
]'

curl -X POST http://localhost:8000/api/v1/scan `
  -F "class_name=INFO-2A" `
  -F "students_json=$students" `
  -F "classroom_image=@classroom_photo.jpg"
```

### Using Python requests

```python
import requests, json

students = [
    {"student_id": 1, "name": "Ahmed Benali", "image_path": "students/ahmed.jpg"},
    {"student_id": 2, "name": "Sara Idrissi",  "image_path": "students/sara.jpg"},
]

with open("classroom_photo.jpg", "rb") as img_file:
    response = requests.post(
        "http://localhost:8000/api/v1/scan",
        data={
            "class_name": "INFO-2A",
            "students_json": json.dumps(students),
        },
        files={"classroom_image": ("classroom.jpg", img_file, "image/jpeg")},
    )

print(response.json())
```

---

## 📤 Example Response

```json
{
  "class_name": "INFO-2A",
  "present_students": [
    {
      "student_id": 1,
      "name": "Ahmed Benali",
      "confidence": 0.9621,
      "face_location": {"x": 120, "y": 85, "w": 95, "h": 105}
    },
    {
      "student_id": 2,
      "name": "Sara Idrissi",
      "confidence": 0.9304,
      "face_location": {"x": 340, "y": 90, "w": 88, "h": 98}
    }
  ],
  "absent_students": [
    {"student_id": 3, "name": "Yassine El Amrani"},
    {"student_id": 4, "name": "Fatima Zahra Haddad"}
  ],
  "unknown_faces_detected": 1,
  "total_students": 4,
  "present_count": 2,
  "absent_count": 2,
  "attendance_rate": 0.5,
  "scan_time": "2026-05-15T14:30:00.000Z",
  "processing_time_seconds": 4.213
}
```

---

## 📷 Real-Time Webcam Scanner

```cmd
python webcam_scanner.py --class INFO-2A --students students_example.json
```

| Option | Default | Description |
|--------|---------|-------------|
| `--class` | required | Class name |
| `--students` | required | Path to students JSON |
| `--interval` | `3.0` | Seconds between scans |
| `--camera` | `0` | Camera device index |

Press **`q`** to quit and print the final attendance report to the console.

---

## 🧠 Model & Threshold Guide

| Model | Accuracy | Speed | Best For |
|-------|----------|-------|----------|
| **ArcFace** (default) | ★★★★★ | ★★★★ | Production, high accuracy |
| **Facenet512** | ★★★★★ | ★★★ | Very high accuracy, slower |
| **Facenet** | ★★★★ | ★★★★★ | Speed-critical scenarios |
| **VGG-Face** | ★★★ | ★★★ | Legacy / compatibility |

| Detector | Accuracy | Speed | Notes |
|----------|----------|-------|-------|
| **RetinaFace** (default) | ★★★★★ | ★★★ | Best for crowds and angles |
| **MTCNN** | ★★★★ | ★★★ | Good fallback |
| **OpenCV** | ★★★ | ★★★★★ | Fastest, less accurate |

### Threshold Tuning

| `SIMILARITY_THRESHOLD` | Behaviour |
|------------------------|-----------|
| `0.50` | Very strict — reduces false positives |
| **`0.68`** | **Recommended default** |
| `0.80` | Lenient — more matches, risk of false positives |

---

## 🚀 Performance Tips

1. **Pre-warm cache** — Call `/embed` once after student registration. Subsequent scans skip re-computing embeddings.
2. **Use ArcFace + RetinaFace** for the best accuracy/speed trade-off.
3. **GPU support** — Install `tensorflow-gpu` and CUDA to dramatically speed up embedding generation.
4. **Image quality** — Ensure classroom images are at least 720p and well-lit.
5. **Batch scanning** — For large classes (>50), use high-resolution images so RetinaFace can detect all faces in one pass.

---

## ❌ Troubleshooting

| Problem | Solution |
|---------|----------|
| `No module named 'cv2'` | Run `pip install opencv-python` |
| `TF model download fails` | Check internet connection; models download to `~/.deepface/weights/` |
| Camera index error | Try `--camera 1` or `--camera 2` |
| All students marked absent | Lower `SIMILARITY_THRESHOLD` to `0.75` in `.env` |
| Slow first scan | Normal — TF loads models on first call; subsequent scans are faster |
| `retina_face` import error | Run `pip install retina-face` |

---

## 🔗 Integration with External System

The external management system only needs to:

1. `POST /api/v1/embed` — after student registration (optional but recommended)
2. `POST /api/v1/scan` — when professor starts attendance
3. Parse the returned `AttendanceResult` JSON and save it to the database

The AI module has **no database**, **no authentication**, and **no UI** — it is a pure AI microservice.
