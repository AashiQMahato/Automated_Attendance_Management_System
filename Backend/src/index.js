// Load .env before anything else: ES module imports are hoisted, so modules
// that read process.env at import time (e.g. Cloudinary config) need it first.
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import connectDb from "./database/db.js";
import { faceServiceHealth, startFaceService } from "./services/faceService.js";
import userRoutes from "./routes/user.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import holidayRoutes from "./routes/holiday.routes.js";

const app = express();

// Allowed frontends: local dev + CORS_ORIGIN (comma-separated) from the env.
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://aams-frontend.onrender.com",
  ...(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter((o) => o && o !== "*"),
];

const corsOptions = {
  origin: [...new Set(allowedOrigins)],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Liveness/readiness for hosting health checks and debugging.
app.get("/api/v1/health", async (req, res) => {
  res.status(200).json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    faceService: await faceServiceHealth(),
  });
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/assignments", assignmentRoutes);
app.use("/api/v1/holidays", holidayRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Errors thrown outside asyncHandler (e.g. multer file-type/size errors).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : err.statusCode || (err.name === "MulterError" ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message: err.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT) || 8080;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    startFaceService();
  })
  .catch((error) => console.error("MongoDB connection failed!", error));
