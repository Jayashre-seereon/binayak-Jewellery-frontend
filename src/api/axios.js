import axios from "axios";
import { useAuthStore } from "../store/authStore";

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL
});

http.interceptors.request.use((config) => {
  const { token, storeToken } = useAuthStore.getState();
  const activeToken = storeToken || token;

  if (activeToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${activeToken}`;
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
    const isStoreAuthEndpoint = originalRequest?.url?.includes("/api/stores/");
    const { token, refreshToken, storeToken, storeRefreshToken } =
      useAuthStore.getState();
    const usingStoreSession = Boolean(storeToken);

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint &&
      !isStoreAuthEndpoint
    ) {
      originalRequest._retry = true;

      try {
        const currentRefreshToken = usingStoreSession
          ? storeRefreshToken
          : refreshToken;

        if (!currentRefreshToken) {
          useAuthStore.getState().logout();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        const refreshUrl = usingStoreSession
          ? "/api/stores/refresh-token"
          : "/api/users/refresh-token";

        refreshPromise =
          refreshPromise ||
          http.post(refreshUrl, { refreshToken: currentRefreshToken });

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
          if (usingStoreSession) {
            useAuthStore.getState().setStoreSession({
              storeToken: nextToken,
              storeRefreshToken: nextRefreshToken || currentRefreshToken,
            });
          } else {
            useAuthStore.getState().setSession({
              token: nextToken,
              refreshToken: nextRefreshToken || currentRefreshToken,
            });
          }
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
