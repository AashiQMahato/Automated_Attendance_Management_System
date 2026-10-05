"""FastAPI entry point for the face service.

Run (from Backend/face-service):  python -m uvicorn app.main:app --port 8001
The Node backend starts this automatically; see Backend/src/services/faceService.js.
"""
import asyncio
import io
import logging
from contextlib import asynccontextmanager
from typing import Optional

import cv2
import numpy as np
from PIL import Image, ImageOps
from pillow_heif import register_heif_opener
from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from .config import settings
from .recognizer import FaceRecognizer

register_heif_opener()  # lets Pillow open HEIC/HEIF (iPhone photos)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("face-service")

MAX_IMAGE_BYTES = 10 * 1024 * 1024
state = {"recognizer": None, "error": None}


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Models take a few seconds to load; do it off the event loop so /health answers meanwhile.
    async def load():
        try:
            state["recognizer"] = await run_in_threadpool(FaceRecognizer, settings)
            logger.info("Face service ready")
        except Exception as exc:  # noqa: BLE001 - surface any load failure via /health
            state["error"] = str(exc)
            logger.exception("Face service failed to load models")

    task = asyncio.create_task(load())
    yield
    task.cancel()


app = FastAPI(title="AttendEase Face Service", lifespan=lifespan)

if settings.cloudinary_enabled:
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )


def _check_key(key: Optional[str]) -> None:
    if settings.service_key and key != settings.service_key:
        raise HTTPException(status_code=401, detail="Invalid service key")


HEIF_BRANDS = (b"heic", b"heix", b"hevc", b"hevx", b"heim", b"heis", b"mif1", b"msf1")


def _is_heif(data: bytes) -> bool:
    # ISO-BMFF header: bytes 4–8 are "ftyp", followed by the brand.
    return len(data) > 12 and data[4:8] == b"ftyp" and data[8:12] in HEIF_BRANDS


def decode_image(data: bytes):
    """Return (BGR image, bytes to archive). HEIC/HEIF is converted to JPEG,
    applying the camera's EXIF rotation."""
    if _is_heif(data):
        with Image.open(io.BytesIO(data)) as img:
            rgb = ImageOps.exif_transpose(img).convert("RGB")
        buffer = io.BytesIO()
        rgb.save(buffer, format="JPEG", quality=92)
        logger.info("Converted HEIC photo to JPEG")
        return cv2.cvtColor(np.asarray(rgb), cv2.COLOR_RGB2BGR), buffer.getvalue()
    # IMREAD_COLOR already applies EXIF orientation for JPEGs.
    return cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR), data


def _upload_to_cloudinary(data: bytes) -> Optional[str]:
    if not settings.cloudinary_enabled:
        return None
    try:
        return cloudinary.uploader.upload(data, folder=settings.cloudinary_folder)["secure_url"]
    except Exception:  # noqa: BLE001 - the photo archive is best-effort; recognition still works
        logger.exception("Cloudinary upload failed")
        return None


@app.get("/health")
async def health():
    recognizer = state["recognizer"]
    return {
        "status": "ok" if recognizer else ("error" if state["error"] else "loading"),
        "ready": recognizer is not None,
        "known_people": recognizer.known_people if recognizer else 0,
        "error": state["error"],
        "cloudinary": settings.cloudinary_enabled,
    }


@app.post("/recognize")
@app.post("/upload_and_recognize/", include_in_schema=False)  # legacy path used by older clients
async def recognize(file: UploadFile = File(...), x_face_service_key: Optional[str] = Header(default=None)):
    _check_key(x_face_service_key)
    recognizer = state["recognizer"]
    if recognizer is None:
        raise HTTPException(status_code=503, detail=state["error"] or "Face service is still loading")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image is larger than 10MB")

    try:
        image, data = await run_in_threadpool(decode_image, data)
    except Exception:  # noqa: BLE001 - corrupt or unsupported container
        logger.exception("Could not decode upload")
        image = None
    if image is None:
        raise HTTPException(status_code=400, detail="Unsupported image format. Use JPG, PNG or HEIC.")

    # Archive the photo and run recognition concurrently (network I/O vs CPU).
    url, result = await asyncio.gather(
        run_in_threadpool(_upload_to_cloudinary, data),
        run_in_threadpool(recognizer.recognize, image, None),
    )
    result["cloudinary_url"] = url
    for face in result["results"]:
        face["cloudinary_url"] = url
    logger.info("Detected %d faces, recognized %d", result["faces_detected"], sum(r["recognized"] for r in result["results"]))
    return result


@app.post("/reload")
async def reload_known_faces(x_face_service_key: Optional[str] = Header(default=None)):
    """Reload embeddings after running scripts/build_embeddings.py."""
    _check_key(x_face_service_key)
    if state["recognizer"] is None:
        raise HTTPException(status_code=503, detail="Face service is still loading")
    await run_in_threadpool(state["recognizer"].reload_known_faces)
    return {"known_people": state["recognizer"].known_people}
