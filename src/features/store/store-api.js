import http from "@/api/http";

export const getStores = async () => {
  const res = await http.get("/api/stores/get");
  return res;
};

export const createStore = async (payload) => {
  const res = await http.post("/api/stores/create", payload);
  return res;
};

export const deleteStore = async (id) => {
  const res = await http.delete(`/api/stores/delete/${id}`);
  return res;
};

export const getStoreById = async (id) => {
  const res = await http.get(`/api/stores/getById/${id}`);
  return res;
};

export const updateStore = async (id, payload) => {
  const res = await http.put(`/api/stores/update/${id}`, payload);
  return res;
};
