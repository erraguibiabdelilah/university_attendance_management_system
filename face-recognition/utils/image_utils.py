"""
utils/image_utils.py
--------------------
Helpers to load images from:
  - Local file paths
  - Base64 data-URIs (sent by mobile / web clients)
  - Uploaded file bytes (FastAPI UploadFile)
  - NumPy arrays (webcam frames)
"""

from __future__ import annotations

import base64
import re
from pathlib import Path
from typing import Tuple

import cv2
import numpy as np
import urllib.request

from utils.logger import logger


def load_image_from_source(source: str) -> Tuple[bytes, np.ndarray]:
    """
    Load an image from a file path, base64 data-URI, or HTTP(S) URL.
    Returns: (raw_bytes, bgr_numpy_array)
    """
    if source.startswith("data:image"):
        return decode_base64_image(source)

    if source.startswith("http://") or source.startswith("https://"):
        with urllib.request.urlopen(source, timeout=10) as resp:
            raw_bytes = resp.read()
        return raw_bytes, _bytes_to_array(raw_bytes)

    path = Path(source)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {source}")

    raw_bytes = path.read_bytes()
    arr = _bytes_to_array(raw_bytes)
    return raw_bytes, arr


def decode_base64_image(data_uri: str) -> Tuple[bytes, np.ndarray]:
    """
    Decode a base64 data-URI (data:image/<fmt>;base64,<data>) into
    raw bytes and a BGR numpy array.
    """
    match = re.match(r"data:image/[^;]+;base64,(.*)", data_uri, re.DOTALL)
    if not match:
        raise ValueError("Invalid base64 data-URI format.")
    raw_bytes = base64.b64decode(match.group(1))
    return raw_bytes, _bytes_to_array(raw_bytes)


def bytes_to_image(data: bytes) -> np.ndarray:
    """Convert raw image bytes (from UploadFile) to a BGR numpy array."""
    return _bytes_to_array(data)


def _bytes_to_array(data: bytes) -> np.ndarray:
    arr = np.frombuffer(data, dtype=np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image — unsupported format or corrupt file.")
    return img


def preprocess_classroom_image(img: np.ndarray) -> np.ndarray:
    """
    Light preprocessing to improve detection in challenging classroom conditions:
    - CLAHE histogram equalisation (improves low-contrast / uneven lighting)
    - Mild denoising
    """
    # Work on a copy
    out = img.copy()

    # Convert to LAB, apply CLAHE on L channel, convert back
    lab = cv2.cvtColor(out, cv2.COLOR_BGR2LAB)
    l_ch, a_ch, b_ch = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    l_ch = clahe.apply(l_ch)
    out = cv2.cvtColor(cv2.merge([l_ch, a_ch, b_ch]), cv2.COLOR_LAB2BGR)

    return out


def resize_if_needed(img: np.ndarray, max_dim: int = 1920) -> np.ndarray:
    """Downscale very large images to speed up detection without quality loss."""
    h, w = img.shape[:2]
    if max(h, w) <= max_dim:
        return img
    scale = max_dim / max(h, w)
    new_w, new_h = int(w * scale), int(h * scale)
    logger.debug(f"Resizing classroom image from ({w}×{h}) to ({new_w}×{new_h})")
    return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
