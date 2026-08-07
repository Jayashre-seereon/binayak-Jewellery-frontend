import http from "./axios";

export const getProducts = async () => {
  const res = await http.get("/api/products/get");
  return res.data?.products || [];
};

export const getProductById = async (id) => {
  const res = await http.get(`/api/products/getById/${id}`);
  return res.data?.product ?? res.data?.data ?? null;
};

export const addProduct = async (data) => {
  const formData = new FormData();
  formData.append("name", data.name || "");
  formData.append("description", data.description || "");

  if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== "") {
    formData.append("categoryId", String(Number(data.categoryId)));
  }

  if (data.metalId !== undefined && data.metalId !== null && data.metalId !== "") {
    formData.append("metalId", String(Number(data.metalId)));
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  const res = await http.post("/api/products/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateProduct = async (id, data) => {
  const formData = new FormData();
  formData.append("name", data.name || "");
  formData.append("description", data.description || "");

  if (data.categoryId !== undefined && data.categoryId !== null && data.categoryId !== "") {
    formData.append("categoryId", String(Number(data.categoryId)));
  }

  if (data.metalId !== undefined && data.metalId !== null && data.metalId !== "") {
    formData.append("metalId", String(Number(data.metalId)));
  }

  if (data.image) {
    formData.append("image", data.image);
  }

  const res = await http.put(`/api/products/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await http.delete(`/api/products/delete/${id}`);
  return res.data;
};
