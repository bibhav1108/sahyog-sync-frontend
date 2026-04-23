import axios from "axios";

export const BACKEND_BASE_URL = "http://localhost:8005";

const API = axios.create({
  baseURL: `${BACKEND_BASE_URL}/api/`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
