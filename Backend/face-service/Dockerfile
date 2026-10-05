# Only needed when deploying the face service separately from the Node API
# (then set FACE_SERVICE_URL on the backend). Locally the backend starts it.
FROM python:3.11-slim

WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY scripts ./scripts
# Model and known-face data are not in git; mount or copy them at deploy time:
#   models/yolov8_face.pt, data/known_encodings.npy, data/known_names.npy

ENV PORT=8001
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
