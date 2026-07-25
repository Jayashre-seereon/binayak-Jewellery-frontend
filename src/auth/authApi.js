import http from "@/api/http";

export const loginApi = (payload) => http.post("/api/users/login", payload);

export const refreshTokenApi = (payload) =>
  http.post("/api/users/refresh-token", payload);

export const logoutApi = () => http.post("/api/users/logout");
