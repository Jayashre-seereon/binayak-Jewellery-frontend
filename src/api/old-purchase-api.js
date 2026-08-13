import http from "./axios";

/* ------------------------------------------------------------------ */
/* PURCHASE (type = OLD)                                              */
/* ------------------------------------------------------------------ */

export const getOldPurchases = async () => {
  const res = await http.get(`/api/purchases/get?purchaseType=OLD`);
  return res.data?.purchases ?? [];
};

export const getOldPurchaseById = async (id) => {
  const res = await http.get(`/api/purchases/getbyId/${id}`);
  return res.data?.purchase ?? null;
};

// formData must be a FormData instance: { data: <json string>, document: File, itemPhotos: File[] }
export const addOldPurchase = async (formData) => {
  const res = await http.post(`/api/purchases/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateOldPurchase = async (id, formData) => {
  const res = await http.put(`/api/purchases/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteOldPurchase = async (id) => {
  const res = await http.delete(`/api/purchases/delete/${id}`);
  return res.data;
};

/* ------------------------------------------------------------------ */
/* DROPDOWN MASTER DATA (fetched live from API)                       */
/* ------------------------------------------------------------------ */

export const getEmployees = async () => {
  const res = await http.get("/api/employees/get");
  return res.data?.employees ?? [];
};

export const getParties = async () => {
  const res = await http.get("/api/partymasters/get");
  if (Array.isArray(res.data)) return res.data;
  return res.data?.parties ?? res.data?.partymasters ?? res.data?.data ?? [];
};

export const getProducts = async () => {
  const res = await http.get("/api/products/get");
  return res.data?.products ?? [];
};

export const getMetals = async () => {
  const res = await http.get("/api/metals/get");
  return res.data?.metals ?? [];
};

export const getPurities = async (metalId) => {
  const res = await http.get(
    `/api/purities/get${metalId ? `?metalId=${metalId}` : ""}`
  );
  if (Array.isArray(res.data)) return res.data;
  return res.data?.data ?? res.data?.purities ?? [];
};

export const getGrades = async (purityId) => {
  const res = await http.get(
    `/api/grades/get${purityId ? `?purityId=${purityId}` : ""}`
  );
  if (Array.isArray(res.data)) return res.data;
  return res.data?.data ?? res.data?.grades ?? [];
};

export const getStones = async () => {
  const res = await http.get("/api/stones/get");
  if (Array.isArray(res.data)) return res.data;
  return res.data?.data ?? res.data?.stones ?? [];
};

/* ------------------------------------------------------------------ */
/* STATIC (hardcoded, NOT from API - matches Prisma enum)             */
/* ------------------------------------------------------------------ */

// enum PurchaseType { ORNAMENT OLD BULLION }
export const PURCHASE_TYPES = ["ORNAMENT", "OLD", "BULLION"];

export const PAYMENT_MODES = ["CASH", "CARD", "UPI", "BANK_TRANSFER"];

export const CUSTOMER_ID_TYPES = ["AADHAR", "PAN", "VOTER_ID", "DRIVING_LICENSE", "PASSPORT"];
