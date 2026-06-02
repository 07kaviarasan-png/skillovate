import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - uses 'skillovate_token' to match the old frontend
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("skillovate_token") || localStorage.getItem("sk_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - redirects to /learner on auth failure
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("skillovate_token");
      localStorage.removeItem("skillovate_user");
      window.location.href = "/learner";
    }
    return Promise.reject(error);
  }
);
