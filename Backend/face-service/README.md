# Face service

YOLOv8 face detection + FaceNet recognition, served by FastAPI. The Node
backend starts it automatically and exposes it as
`POST /api/v1/attendance/recognize` (teachers only), so the frontend never
calls it directly.

```
face-service/
├── app/
│   ├── main.py        # FastAPI app: /health, /recognize, /reload
│   ├── recognizer.py  # detection, embeddings, matching
│   └── config.py      # settings from environment variables
├── scripts/
│   └── build_embeddings.py   # (re)build known-face embeddings
├── models/            # yolov8_face.pt              (not in git)
├── data/              # known_*.npy + faces/ photos (not in git: biometric data)
├── requirements.txt
└── Dockerfile         # only for deploying it as a separate service
```

## Setup (once)

```bash
cd Backend
npm run face:setup        # creates face-service/.venv (Python 3.9–3.11) and installs deps
```

Then put the model and data in place (they are git-ignored on purpose):

```
face-service/models/yolov8_face.pt
face-service/data/known_encodings.npy
face-service/data/known_names.npy
face-service/data/faces/<StudentName>/*.jpg   # only needed to rebuild embeddings
```

Now `npm run dev` / `npm start` in `Backend/` starts the API and this service
together. Check `GET /api/v1/health` → `faceService.ready: true`.

## Adding or updating students

Folder names are the names recognition returns, and the app matches them to
students' full names (case-insensitive), so name folders exactly like the
student's name in AttendEase.

```bash
npm run face:embeddings                     # rebuild everyone from data/faces
npm run face:embeddings -- --person Bipin   # add/replace one student
```

Restart the backend (or `POST /reload` on the service) to pick up changes.

## Configuration

Set in `Backend/.env` (see `Backend/.env.example`): `FACE_SERVICE_AUTOSTART`,
`FACE_SERVICE_PORT`, `FACE_SERVICE_URL` (use a separately hosted instance),
`FACE_SERVICE_KEY`, `FACE_DETECTION_THRESHOLD`, `FACE_RECOGNITION_THRESHOLD`.
Cloudinary credentials are shared with the backend; when they're missing the
photo simply isn't archived and recognition still works.

## Deploying

PyTorch needs ~2 GB RAM, more than small Node hosts allow. Deploy this folder
on its own (Dockerfile provided, with the model/data copied in), set
`FACE_SERVICE_KEY` on both sides, and point the backend at it with
`FACE_SERVICE_URL`. Without it, the app keeps working and teachers mark
attendance manually.
