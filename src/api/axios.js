import axios from "axios";
import { useAuthStore } from "../store/authStore";

const http = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL
});

http.interceptors.request.use((config) => {
  const url = config.url || "";

  // Only skip adding Authorization for login and refresh-token endpoints.
  // Allow logout endpoints to receive the Authorization header.
  const isAuthLogin =
    url.includes("/api/users/login") ||
    url.includes("/api/users/refresh-token") ||
    url.includes("/api/stores/login") ||
    url.includes("/api/stores/refresh-token");

  if (isAuthLogin) {
    return config;
  }

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

    // Only exclude login and refresh-token endpoints from the automatic
    // refresh flow. This allows endpoints like /api/users/logout to trigger
    // a refresh when they return 401 due to an expired access token.
    const isAuthExcluded =
      originalRequest?.url?.includes("/api/users/login") ||
      originalRequest?.url?.includes("/api/users/refresh-token") ||
      originalRequest?.url?.includes("/api/stores/login") ||
      originalRequest?.url?.includes("/api/stores/refresh-token");

    const { refreshToken, storeToken, storeRefreshToken } = useAuthStore.getState();
    const usingStoreSession = Boolean(storeToken);

    if (status === 401 && !originalRequest._retry && !isAuthExcluded) {
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
          axios.post(`${import.meta.env.VITE_API_BASE_URL}${refreshUrl}`, {
            refreshToken: currentRefreshToken,
          });

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
              storeUser: useAuthStore.getState().storeUser,
              storeToken: nextToken,
              storeRefreshToken: nextRefreshToken || currentRefreshToken,
            });
          } else {
            useAuthStore.getState().setSession({
              user: useAuthStore.getState().user,
              token: nextToken,
              refreshToken: nextRefreshToken || currentRefreshToken,
            });
          }
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return http(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        refreshPromise = null;
      }
    }

    return Promise.reject(error);
  }
);

export default http;
