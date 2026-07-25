import http from "@/api/http";

export const getStores = () => http.get("/api/stores/get");

export const createStore = (payload) => http.post("/api/stores/create", payload);

export const deleteStore = (id) => http.delete(`/api/stores/delete/${id}`);

export const getStoreById = (id) => http.get(`/api/stores/getById/${id}`);

export const updateStore = (id, payload) =>
  http.put(`/api/stores/update/${id}`, payload);
