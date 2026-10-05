import axios from "axios";
import { API_BASE_URL } from "../config/env";

// Shared client for dashboard requests. Reads the token per request, exactly
// like the previous per-component `Authorization: Bearer ${localStorage...}`.
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// GET /subjects answers 404 when the user simply has no subjects yet.
// Treat that as an empty list, not a failure.
export const fetchSubjects = async () => {
  try {
    const { data } = await api.get("/subjects");
    return data?.data || [];
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
};
