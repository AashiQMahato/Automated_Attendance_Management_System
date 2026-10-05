// Manages the Python face-recognition service (Backend/face-service).
//
// By default the backend starts it as a child process on boot, so
// `npm run dev` / `npm start` brings up both. To run it elsewhere (e.g. a
// separate Render service), set FACE_SERVICE_URL and it won't be spawned.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { apiError } from "../utils/errorHandler.js";

const SERVICE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../face-service");
const PORT = Number(process.env.FACE_SERVICE_PORT) || 8001;
const MAX_RESTARTS = 3;

let child = null;
let restarts = 0;
let stopping = false;

const log = (...args) => console.log("[face-service]", ...args);

export const faceServiceUrl = () => (process.env.FACE_SERVICE_URL || `http://127.0.0.1:${PORT}`).replace(/\/+$/, "");

const authHeaders = () => (process.env.FACE_SERVICE_KEY ? { "X-Face-Service-Key": process.env.FACE_SERVICE_KEY } : {});

// Model location the Python side will use (mirrors face-service/app/config.py).
const modelPath = () =>
    process.env.FACE_YOLO_MODEL ? path.resolve(process.env.FACE_YOLO_MODEL) : path.join(SERVICE_DIR, "models", "yolov8_face.pt");

const resolvePython = () => {
    if (process.env.FACE_SERVICE_PYTHON) return process.env.FACE_SERVICE_PYTHON;
    const venvPython =
        process.platform === "win32"
            ? path.join(SERVICE_DIR, ".venv", "Scripts", "python.exe")
            : path.join(SERVICE_DIR, ".venv", "bin", "python");
    return existsSync(venvPython) ? venvPython : null;
};

export const faceServiceHealth = async () => {
    try {
        const res = await fetch(`${faceServiceUrl()}/health`, { signal: AbortSignal.timeout(2000) });
        return res.ok ? await res.json() : { status: "error", ready: false };
    } catch {
        return { status: "offline", ready: false };
    }
};

const spawnService = (python) => {
    child = spawn(python, ["-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", String(PORT)], {
        cwd: SERVICE_DIR,
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
        stdio: ["ignore", "pipe", "pipe"],
    });
    const forward = (stream) => (chunk) =>
        chunk
            .toString()
            .split("\n")
            .filter(Boolean)
            .forEach((line) => stream.write(`[face-service] ${line}\n`));
    child.stdout.on("data", forward(process.stdout));
    child.stderr.on("data", forward(process.stderr));

    child.on("exit", (code, signal) => {
        child = null;
        if (stopping) return;
        log(`exited (${signal || code})`);
        if (restarts < MAX_RESTARTS) {
            restarts += 1;
            const delay = 2000 * restarts;
            log(`restarting in ${delay / 1000}s (${restarts}/${MAX_RESTARTS})`);
            setTimeout(() => spawnService(python), delay);
        } else {
            log("giving up; face recognition is unavailable until the backend restarts");
        }
    });
};

export const stopFaceService = () => {
    stopping = true;
    if (child) child.kill("SIGTERM");
};

export const startFaceService = async () => {
    if (process.env.FACE_SERVICE_URL) {
        log(`using external service at ${faceServiceUrl()}`);
        return;
    }
    if (process.env.FACE_SERVICE_AUTOSTART === "false") {
        log("autostart disabled (FACE_SERVICE_AUTOSTART=false)");
        return;
    }
    // Reuse an instance left running by a previous dev reload.
    if ((await faceServiceHealth()).status !== "offline") {
        log(`already running on port ${PORT}`);
        return;
    }
    const python = resolvePython();
    if (!python) {
        log("not set up — run `npm run face:setup` once to enable face recognition");
        return;
    }
    // Don't spend time/memory loading PyTorch when the model isn't there yet.
    if (!existsSync(modelPath())) {
        log(`model missing at ${path.relative(process.cwd(), modelPath())} — face recognition disabled.`);
        log("Copy yolov8_face.pt into face-service/models/ (and known_*.npy into face-service/data/), then restart. See face-service/README.md");
        return;
    }
    log(`starting on port ${PORT}`);
    spawnService(python);

    // Stop the child with the backend (incl. nodemon restarts via SIGUSR2).
    process.once("exit", stopFaceService);
    for (const signal of ["SIGINT", "SIGTERM", "SIGUSR2"]) {
        process.once(signal, () => {
            stopFaceService();
            process.kill(process.pid, signal);
        });
    }
};

// Forwards an uploaded image to the service and returns its JSON result.
export const recognizeFaces = async (file) => {
    const form = new FormData();
    form.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname || "photo.jpg");

    let res;
    try {
        res = await fetch(`${faceServiceUrl()}/recognize`, {
            method: "POST",
            body: form,
            headers: authHeaders(),
            signal: AbortSignal.timeout(60_000),
        });
    } catch (error) {
        const timedOut = error.name === "TimeoutError";
        throw new apiError(timedOut ? 504 : 503, timedOut ? "Face recognition timed out" : "Face recognition service is unavailable");
    }

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
        // 4xx from the service (bad image, too large) are the client's; anything else is ours.
        const status = res.status >= 400 && res.status < 500 && res.status !== 401 ? res.status : res.status === 503 ? 503 : 502;
        // Service-side details (e.g. file paths) stay in the server log, not the client response.
        if (status >= 500) log(`recognize failed (${res.status}): ${body.detail || "unknown error"}`);
        throw new apiError(
            status,
            status === 503 ? "Face recognition is not available right now" : status >= 500 ? "Face recognition failed" : body.detail || "Invalid image",
        );
    }
    return body;
};
