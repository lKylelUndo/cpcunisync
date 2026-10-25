import axios, { type AxiosError } from "axios";

/**
 * Shared axios instance for every API call in the client.
 * Never use raw fetch for backend requests.
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const method = error.config?.method?.toUpperCase() ?? "UNKNOWN";
    const url = error.config?.url ?? "unknown";

    if (status === 401) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("accessToken");
        window.localStorage.removeItem("user");

        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    } else if (!error.response) {
      console.error(
        `[API System Error] ${method} ${url} failed: the API is unreachable.`,
        error.message,
      );
    } else if (status !== undefined && status >= 500) {
      console.error(
        `[API System Error] ${method} ${url} returned HTTP ${status}.`,
        error.response.data,
      );
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
