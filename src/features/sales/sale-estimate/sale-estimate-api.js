import http from "@/api/axios";

export const getSales = async () => {
  const res = await http.get("/api/sales/get");
  return res.data?.sales ?? [];
};

export const getSaleById = async (id) => {
  const res = await http.get(`/api/sales/getById/${id}`);
  return res.data?.sale ?? null;
};

export const createSale = async (payload) => {
  const res = await http.post("/api/sales/create", payload);
  return res.data ?? null;
};

export const getSalePdf = async (id) => {
  const res = await http.get(`/api/sales/downloadPdf/${id}`, {
    responseType: "blob",
  });
  return res.data;
};
