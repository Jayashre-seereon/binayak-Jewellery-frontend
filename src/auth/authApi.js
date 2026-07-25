import http from "@/api/http";

export const loginApi = async (payload) => {
  const res = await http.post("/api/users/login", payload);
  return res;
};

export const refreshTokenApi = async (payload) => {
  const res = await http.post("/api/users/refresh-token", payload);
  return res;
};

export const logoutApi = async () => {
  const res = await http.post("/api/users/logout");
  return res;
};
