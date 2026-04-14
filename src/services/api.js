import axios from "axios";

export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8005";
const API = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api/v1/`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
