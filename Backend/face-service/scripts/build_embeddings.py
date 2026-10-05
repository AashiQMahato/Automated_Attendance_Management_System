"""Build or update the known-face embeddings used for recognition.

Dataset layout (one folder per student; the folder name is the name that
recognition returns, so match the student's name in the app):

    data/faces/
        Aashiq/   img1.jpg img2.jpg ...
        Bipin/    ...

Usage (from Backend/face-service, with the service's venv):
    python -m scripts.build_embeddings                 # rebuild everyone
    python -m scripts.build_embeddings --person Bipin  # add/replace one student

Replaces the old Face_embedding.py (full rebuild) and new_embedding.py
(incremental add). Afterwards restart the backend or POST /reload.
"""
import argparse
import logging
import sys
from pathlib import Path
from typing import List, Tuple

import cv2
import numpy as np
import torch

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from app.config import settings  # noqa: E402
from app.recognizer import load_embedding_model, preprocess_face  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("build_embeddings")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def person_embeddings(model, device: str, folder: Path) -> List[np.ndarray]:
    vectors = []
    for image_path in sorted(folder.iterdir()):
        if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        image = cv2.imread(str(image_path))
        if image is None:
            logger.warning("Skipping unreadable image %s", image_path.name)
            continue
        with torch.no_grad():
            vec = model(preprocess_face(image).to(device)).squeeze().cpu().numpy()
        vectors.append(vec / max(np.linalg.norm(vec), 1e-10))
    return vectors


def load_existing() -> Tuple[np.ndarray, np.ndarray]:
    if settings.encodings_path.exists() and settings.names_path.exists():
        return np.load(settings.encodings_path), np.load(settings.names_path, allow_pickle=True)
    return np.zeros((0, 512), dtype=np.float32), np.array([], dtype=str)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--faces", type=Path, default=settings.faces_dir, help="dataset folder (default: data/faces)")
    parser.add_argument("--person", help="only (re)build this person's embeddings")
    args = parser.parse_args()

    if not args.faces.is_dir():
        logger.error("Dataset folder not found: %s", args.faces)
        return 1

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = load_embedding_model(device)

    if args.person:
        folder = args.faces / args.person
        if not folder.is_dir():
            logger.error("No folder for %s in %s", args.person, args.faces)
            return 1
        encodings, names = load_existing()
        keep = names != args.person  # replace, not duplicate, existing vectors
        new = person_embeddings(model, device, folder)
        if not new:
            logger.error("No usable images for %s", args.person)
            return 1
        encodings = np.vstack([encodings[keep], np.array(new)]) if keep.any() else np.array(new)
        names = np.concatenate([names[keep], np.full(len(new), args.person)])
        logger.info("%s: %d embeddings", args.person, len(new))
    else:
        all_vectors, all_names = [], []
        for folder in sorted(p for p in args.faces.iterdir() if p.is_dir()):
            vectors = person_embeddings(model, device, folder)
            logger.info("%s: %d embeddings", folder.name, len(vectors))
            all_vectors += vectors
            all_names += [folder.name] * len(vectors)
        if not all_vectors:
            logger.error("No images found in %s", args.faces)
            return 1
        encodings, names = np.array(all_vectors), np.array(all_names)

    settings.encodings_path.parent.mkdir(parents=True, exist_ok=True)
    np.save(settings.encodings_path, encodings.astype(np.float32))
    np.save(settings.names_path, names)
    logger.info("Saved %d embeddings for %d people to %s", len(names), len(set(names.tolist())), settings.encodings_path.parent)
    return 0


if __name__ == "__main__":
    sys.exit(main())
