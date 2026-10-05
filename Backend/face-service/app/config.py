"""Settings for the face service, read from environment variables.

When the Node backend starts this service it passes its own environment
(including Backend/.env), so Cloudinary credentials live in one place.
"""
import os
from dataclasses import dataclass
from pathlib import Path

SERVICE_ROOT = Path(__file__).resolve().parent.parent


def _path(env_key: str, default: Path) -> Path:
    value = os.getenv(env_key)
    return Path(value).expanduser().resolve() if value else default


def _float(env_key: str, default: float) -> float:
    try:
        return float(os.getenv(env_key, default))
    except ValueError:
        return default


@dataclass(frozen=True)
class Settings:
    yolo_model_path: Path = _path("FACE_YOLO_MODEL", SERVICE_ROOT / "models" / "yolov8_face.pt")
    encodings_path: Path = _path("FACE_ENCODINGS", SERVICE_ROOT / "data" / "known_encodings.npy")
    names_path: Path = _path("FACE_NAMES", SERVICE_ROOT / "data" / "known_names.npy")
    faces_dir: Path = _path("FACE_DATASET_DIR", SERVICE_ROOT / "data" / "faces")
    # Minimum YOLO confidence for a detection to count as a face.
    detection_threshold: float = _float("FACE_DETECTION_THRESHOLD", 0.79)
    # Maximum cosine distance for a match (lower = stricter).
    recognition_threshold: float = _float("FACE_RECOGNITION_THRESHOLD", 0.6)
    # Optional shared secret; when set, requests must send X-Face-Service-Key.
    service_key: str = os.getenv("FACE_SERVICE_KEY", "")
    cloudinary_cloud_name: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    cloudinary_api_key: str = os.getenv("CLOUDINARY_API_KEY", "")
    cloudinary_api_secret: str = os.getenv("CLOUDINARY_API_SECRET", "")
    cloudinary_folder: str = os.getenv("FACE_CLOUDINARY_FOLDER", "attendance_system")

    @property
    def cloudinary_enabled(self) -> bool:
        return bool(self.cloudinary_cloud_name and self.cloudinary_api_key and self.cloudinary_api_secret)


settings = Settings()
