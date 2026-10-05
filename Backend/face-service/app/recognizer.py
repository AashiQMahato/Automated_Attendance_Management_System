"""Face detection (YOLOv8) + recognition (FaceNet / InceptionResnetV1)."""
import logging
from typing import Dict, List, Optional

import cv2
import numpy as np
import torch
from facenet_pytorch import InceptionResnetV1
from ultralytics import YOLO

from .config import Settings

logger = logging.getLogger("face-service")

FACE_SIZE = (160, 160)


def preprocess_face(face_bgr: np.ndarray) -> torch.Tensor:
    """Crop (BGR) -> normalized RGB tensor, matching how the stored
    embeddings were produced (see scripts/build_embeddings.py)."""
    face_rgb = cv2.cvtColor(cv2.resize(face_bgr, FACE_SIZE), cv2.COLOR_BGR2RGB)
    return torch.from_numpy(face_rgb.astype(np.float32) / 255.0).permute(2, 0, 1).unsqueeze(0)


def load_embedding_model(device: str) -> InceptionResnetV1:
    return InceptionResnetV1(pretrained="vggface2").eval().to(device)


class FaceRecognizer:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        if not settings.yolo_model_path.exists():
            raise FileNotFoundError(f"YOLO face model not found at {settings.yolo_model_path}")
        self.detector = YOLO(str(settings.yolo_model_path))
        self.embedder = load_embedding_model(self.device)
        self.known_encodings = np.zeros((0, 512), dtype=np.float32)
        self.known_names: List[str] = []
        self.reload_known_faces()

    def reload_known_faces(self) -> None:
        enc_path, names_path = self.settings.encodings_path, self.settings.names_path
        if not (enc_path.exists() and names_path.exists()):
            logger.warning("No known-face data at %s; every face will be 'Unknown'.", enc_path.parent)
            return
        encodings = np.load(enc_path).astype(np.float32)
        norms = np.linalg.norm(encodings, axis=1, keepdims=True)
        self.known_encodings = encodings / np.clip(norms, 1e-10, None)
        self.known_names = [str(n) for n in np.load(names_path, allow_pickle=True)]
        logger.info("Loaded %d embeddings for %d people", len(self.known_names), len(set(self.known_names)))

    @property
    def known_people(self) -> int:
        return len(set(self.known_names))

    def detect(self, image_bgr: np.ndarray) -> List[Dict]:
        faces = []
        height, width = image_bgr.shape[:2]
        for result in self.detector(image_bgr, verbose=False):
            for box in result.boxes:
                confidence = float(box.conf[0])
                if confidence < self.settings.detection_threshold:
                    continue
                x1, y1, x2, y2 = (int(v) for v in box.xyxy[0].tolist())
                x1, y1, x2, y2 = max(0, x1), max(0, y1), min(width, x2), min(height, y2)
                if x2 <= x1 or y2 <= y1:
                    continue
                faces.append({"bbox": [x1, y1, x2, y2], "confidence": confidence, "crop": image_bgr[y1:y2, x1:x2]})
        return faces

    def embed(self, face_bgr: np.ndarray) -> np.ndarray:
        with torch.no_grad():
            vec = self.embedder(preprocess_face(face_bgr).to(self.device)).squeeze().cpu().numpy()
        return vec / max(np.linalg.norm(vec), 1e-10)

    def match(self, embedding: np.ndarray) -> Dict:
        if not len(self.known_names):
            return {"recognized": False, "name": "Unknown", "confidence": 0.0}
        similarities = self.known_encodings @ embedding  # cosine similarity (both normalized)
        best = int(np.argmax(similarities))
        distance = float(1.0 - similarities[best])
        recognized = distance <= self.settings.recognition_threshold
        return {
            # Native Python types only: numpy scalars are not JSON serializable.
            "recognized": bool(recognized),
            "name": self.known_names[best] if recognized else "Unknown",
            "confidence": round(max(0.0, 1.0 - distance), 4),
        }

    def recognize(self, image_bgr: np.ndarray, image_url: Optional[str] = None) -> Dict:
        results = []
        for face in self.detect(image_bgr):
            match = self.match(self.embed(face["crop"]))
            results.append(
                {
                    "bbox": face["bbox"],
                    "detection_confidence": round(face["confidence"], 4),
                    "cloudinary_url": image_url,
                    **match,
                }
            )
        return {"faces_detected": len(results), "cloudinary_url": image_url, "results": results}
