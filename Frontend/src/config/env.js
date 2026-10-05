// Centralized access to Vite environment variables.
// Only variables prefixed with VITE_ are exposed to the client bundle.

const stripTrailingSlash = (url) => url?.replace(/\/+$/, "");

export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"
);

export const FACE_RECOGNITION_URL = stripTrailingSlash(
  import.meta.env.VITE_FACE_RECOGNITION_URL || "http://localhost:8000"
);
