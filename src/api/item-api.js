import http from "@/api/axios";

export const getItems = async () => {
  const res = await http.get("/api/items/get");
  return res.data?.items || [];
};

export const getItemsByProduct = async (productId) => {
  const res = await http.get(`/api/items/getByProduct/${productId}`);
  return res.data?.items || res.data?.data || [];
};

export const getItemById = async (id) => {
  const res = await http.get(`/api/items/getById/${id}`);
  return res.data?.item ?? res.data?.data ?? null;
};

const buildItemFormData = (data) => {
  const formData = new FormData();

  formData.append("name", data.name || "");
  formData.append("productId", String(Number(data.productId || "")));
  formData.append("designId", String(Number(data.designId || "")));
  formData.append("description", data.description || "");

  if (data.image) {
    formData.append("image", data.image);
  }

  return formData;
};

export const addItem = async (data) => {
  const res = await http.post("/api/items/create", buildItemFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateItem = async (id, data) => {
  const res = await http.put(`/api/items/update/${id}`, buildItemFormData(data), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteItem = async (id) => {
  const res = await http.delete(`/api/items/delete/${id}`);
  return res.data;
};
