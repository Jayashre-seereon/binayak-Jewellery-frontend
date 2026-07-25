import axios from "axios";
import { useAuthStore } from "@/auth/authStore";

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshPromise = null;

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthEndpoint = originalRequest?.url?.includes("/api/users/");

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      const { refreshToken } = useAuthStore.getState();
      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        refreshPromise =
          refreshPromise ||
          http.post("/api/users/refresh-token", { refreshToken });

        const response = await refreshPromise;
        refreshPromise = null;

        const nextToken =
          response.data?.accessToken ||
          response.data?.token ||
          response.data?.data?.accessToken ||
          response.data?.data?.token;
        const nextRefreshToken =
          response.data?.refreshToken || response.data?.data?.refreshToken;

        if (nextToken) {
          useAuthStore.getState().setSession({
            token: nextToken,
            refreshToken: nextRefreshToken || refreshToken,
          });
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default http;
