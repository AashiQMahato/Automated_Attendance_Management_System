// One-time setup for the Python face service: creates face-service/.venv with
// a compatible Python (3.9–3.11) and installs its requirements.
// Usage: npm run face:setup   (override the interpreter with FACE_SETUP_PYTHON)
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const serviceDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../face-service");
const venvDir = path.join(serviceDir, ".venv");
const venvPython = process.platform === "win32" ? path.join(venvDir, "Scripts", "python.exe") : path.join(venvDir, "bin", "python");

const candidates = [
    process.env.FACE_SETUP_PYTHON,
    "python3.11",
    "python3.10",
    "python3.9",
    "/usr/bin/python3",
    "python3",
    "python",
].filter(Boolean);

const versionOf = (cmd) => {
    try {
        const out = execFileSync(cmd, ["-c", "import sys; print('%d.%d' % sys.version_info[:2])"], { encoding: "utf8" }).trim();
        const [major, minor] = out.split(".").map(Number);
        return { out, ok: major === 3 && minor >= 9 && minor <= 11 };
    } catch {
        return null;
    }
};

const run = (cmd, args) => {
    const result = spawnSync(cmd, args, { stdio: "inherit", cwd: serviceDir });
    if (result.status !== 0) process.exit(result.status ?? 1);
};

if (!existsSync(venvPython)) {
    const python = candidates.find((c) => versionOf(c)?.ok);
    if (!python) {
        console.error("Need Python 3.9–3.11 (PyTorch 2.2 has no wheels for newer versions). Install one, or set FACE_SETUP_PYTHON.");
        process.exit(1);
    }
    console.log(`Creating face-service/.venv with ${python} (Python ${versionOf(python).out})`);
    run(python, ["-m", "venv", venvDir]);
}

run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"]);
run(venvPython, ["-m", "pip", "install", "-r", "requirements.txt"]);

const missing = ["models/yolov8_face.pt", "data/known_encodings.npy", "data/known_names.npy"].filter(
    (p) => !existsSync(path.join(serviceDir, p)),
);
console.log("\nFace service installed.");
if (missing.length) console.log(`Still missing (see face-service/README.md):\n  ${missing.join("\n  ")}`);
