# AttendEase — Automated Attendance Management System

Attendance, assignments and holidays for students and teachers, with
face-recognition attendance from a class photo.

## Project structure

```
Automated_Attendance_Management_System/
├── Frontend/                 React + Vite + Tailwind (student & teacher dashboards)
└── Backend/                  Express + MongoDB API
    ├── src/
    │   ├── index.js          app entry (routes, CORS, health, error handling)
    │   ├── controllers/      request handlers
    │   ├── models/           Mongoose schemas
    │   ├── routes/           /api/v1/* routers
    │   ├── middlewares/      auth, role checks, uploads
    │   ├── services/         faceService.js — starts/proxies the face service
    │   ├── database/  utils/
    ├── face-service/         Python (FastAPI) face detection + recognition
    └── scripts/              setup helpers
```

## Run locally

```bash
# Backend (API on :8080; also starts the face service once set up)
cd Backend
cp .env.example .env          # fill in MongoDB, JWT and Cloudinary values
npm install
npm run face:setup            # once: Python env for face recognition (see face-service/README.md)
npm run dev

# Frontend (http://localhost:5173)
cd ../Frontend
cp .env.example .env          # VITE_API_BASE_URL=http://localhost:8080/api/v1
npm install
npm run dev
```

`GET /api/v1/health` reports the database and face-service status.

## Tech stack

- **Frontend:** React 18, Vite, Tailwind CSS, Ant Design, Recharts, Zustand, Framer Motion
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Multer, Cloudinary
- **Face recognition:** Python, FastAPI, YOLOv8 (face detection), FaceNet / InceptionResnetV1 (embeddings)

## Screenshots

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/4e8a4ef1-2e49-4f78-8442-1be664c5beaf" width="100%"/></td>
    <td><img src="https://github.com/user-attachments/assets/634bcbce-3fef-431c-999c-f16907f8d234" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2056d478-afcc-44fa-afe7-827bfe4d3e2e" width="100%"/></td>
    <td><img src="https://github.com/user-attachments/assets/7431b102-6781-4267-81f8-2a6054eece57" width="100%"/></td>
  </tr>
</table>
